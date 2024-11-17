"use server";

import { JSDOM } from "jsdom";
import {
  ConnectToDB,
  generateGitHubJWT,
  isGoogleService,
  redactText,
  refreshGitHubAccessToken,
  refreshSlackAccessToken,
} from "@/lib/utils";
import { docs_v1, gmail_v1, google } from "googleapis";
import { User, UserType } from "@/models/user.model";
import {
  CombinedFilterKey,
  DocumentType,
  FilterKey,
  OAuth2Client,
  TActionResponse,
} from "@/lib/types";
import { CharacterTextSplitter } from "langchain/text_splitter";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { updateSearchResultCount } from "./user.actions";
import { WebClient } from "@slack/web-api";
import { Octokit, RestEndpointMethodTypes } from "@octokit/rest";
import {
  isFullPage,
  isFullPageOrDatabase,
  Client as NotionClient,
} from "@notionhq/client";
import { LogoMap } from "@/lib/constants";

const textSplitter = new CharacterTextSplitter({ separator: "</html>" });

const tunedModel_Gmail = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY!,
  model: "tunedModels/gmailquery-ham7ian0yejt",
});

const tunedModel_Docs = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY!,
  model: "tunedModels/google-docs-data-5u6szrdsitel",
});

const tunedModel_Sheets = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY!,
  model: "tunedModels/google-sheets-data-rsvd22fipb8n",
});

const tunedModel_Slack = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY!,
  model: "tunedModels/slack-data-oglib9jwnvqj",
});

const tunedModel_GitHub = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY!,
  model: "tunedModels/github-data-qw3h8evn8n45",
});

const refreshAccessToken = async (
  user: UserType,
  platform: Exclude<FilterKey, "NOTION">,
  oauth2Client?: OAuth2Client,
  refreshToken?: string
): Promise<{
  accessToken: string;
  expiresAt: number;
  refreshToken?: string;
}> => {
  switch (platform) {
    case "GITHUB":
      const encodedJwt = generateGitHubJWT();
      const gitHubResponse = await refreshGitHubAccessToken(
        encodedJwt,
        user.GITHUB.installationId
      );
      return {
        accessToken: gitHubResponse.data.token,
        expiresAt: new Date(gitHubResponse.data.expires_at).getTime(),
      };
    case "DISCORD":
      return { accessToken: "", expiresAt: 0 };
    case "MICROSOFT_TEAMS":
      return { accessToken: "", expiresAt: 0 };
    case "SLACK":
      const slackResponse = await refreshSlackAccessToken(user);
      const { access_token, expires_in, refresh_token } =
        slackResponse.data.authed_user;
      return {
        accessToken: access_token,
        expiresAt: expires_in!,
        refreshToken: refresh_token!,
      };
    default:
      oauth2Client!.setCredentials({ refresh_token: refreshToken! });
      const { credentials } = await oauth2Client!.refreshAccessToken();
      oauth2Client!.setCredentials({
        access_token: credentials.access_token,
      });

      return {
        accessToken: credentials.access_token!,
        expiresAt: credentials.expiry_date!,
      };
  }
};

export const checkAndRefreshToken = async (
  user: UserType,
  platform: Exclude<FilterKey, "NOTION">,
  oauth2Client?: OAuth2Client
): Promise<TActionResponse> => {
  const { accessToken, expiresAt, refreshToken } = user[platform];

  if (!accessToken) {
    return {
      success: false,
      error: `Please connect your ${platform.toLowerCase()} account...`,
    };
  }

  // Check if the token has expired
  const currentTime = Date.now();
  if (expiresAt && currentTime < expiresAt - 60000) {
    if (isGoogleService(platform)) {
      oauth2Client!.setCredentials({
        access_token: accessToken,
      });
    }

    return {
      success: true,
      data: "",
    };
  } else {
    try {
      const { accessToken, expiresAt, refreshToken: refresh_token } = await refreshAccessToken(user, platform, oauth2Client, refreshToken);
      const updateQuery = {
        [`${platform}.accessToken`]: accessToken,
        [`${platform}.expiresAt`]: expiresAt,
      };

      if (platform === "GITHUB") {
        updateQuery[`${platform}.refreshToken`] = refresh_token!;
      }

      await ConnectToDB();
      await User.findOneAndUpdate(
        { userId: user.userId },
        {
          $set: updateQuery,
        }
      );

      console.log("Access token refreshed.");
      return {
        success: true,
        data: "",
      };
    } catch (error: any) {
      const errorMessage = error?.response && error?.response?.data?.error === "invalid_grant" ? `RE_AUTHENTICATE-${platform}` : error.message;
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
};

export const getPlatformClient = async (
  user: UserType,
  platform: FilterKey
) => {
  const clientId = process.env[`${platform}_CLIENT_ID`]!;
  const clientSecret = process.env[`${platform}_CLIENT_SECRET`]!;
  const redirectUri = `${process.env.OAUTH_REDIRECT_URI!}/${platform.toLowerCase()}`;

  const dbUser = (await User.findOne<UserType>({ userId: user.userId }))!;

  user = dbUser;

  switch (platform) {
    case "SLACK":
      return new WebClient(dbUser?.[platform].accessToken);
    case "NOTION":
      return new NotionClient({ auth: dbUser?.[platform].accessToken });
    case "GITHUB":
      return new Octokit({ auth: dbUser?.[platform].accessToken });
    default:
      return new google.auth.OAuth2({
        clientId,
        clientSecret,
        redirectUri,
      });
  }
};

// Helper function to process email content
const processEmailContent = async (
  parts: gmail_v1.Schema$MessagePart[] | undefined
): Promise<string> => {
  if (!parts) return "";

  const contentPromises = parts.map(async ({ body, mimeType }) => {
    if (!body?.data) return "";

    let content = Buffer.from(body.data, "base64").toString("utf8");

    if (mimeType === "text/html") {
      const htmlContent = await textSplitter.splitText(content);
      content = htmlContent
        .map((html) => {
          const dom = new JSDOM(html.concat("</html>"));
          return dom.window.document.querySelector("body")?.textContent ?? "";
        })
        .join(" ");
    }

    return content;
  });

  return (await Promise.all(contentPromises)).join(" ");
};

// Helper function to process Google Docs content
const processDocsContent = (
  content: docs_v1.Schema$StructuralElement
): string => {
  let result = "";
  if (content.paragraph?.elements) {
    result = content.paragraph.elements.reduce((curContent, { textRun }) => {
      return (curContent += textRun?.content ?? "");
    }, result);
  } else if (content.table?.tableRows) {
    const tableRows = content.table.tableRows;

    tableRows.forEach(({ tableCells }) => {
      tableCells?.forEach(({ content }) => {
        const structuralElement = content ?? [];
        result = structuralElement.reduce((curContent, item) => {
          return (curContent += processDocsContent(item));
        }, result);
      });
    });
  }

  return result;
};

export const searchEmails = async (
  searchQuery: string,
  user: UserType
): Promise<DocumentType[]> => {
  if (searchQuery.trim().length === 0) return [];

  const oauth2Client = (await getPlatformClient(user, "GMAIL")) as OAuth2Client;
  const response = await checkAndRefreshToken(user, "GMAIL", oauth2Client);

  const result: DocumentType[] = [];
  if (!response.success) return result;

  const gmail = google.gmail({
    version: "v1",
    auth: oauth2Client,
  });

  let pageToken: string | undefined;

  // Helper function to extract header value
  const getHeader = (
    headers: gmail_v1.Schema$MessagePartHeader[],
    name: string
  ): string =>
    headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ??
    "";

  do {
    // Fetch emails
    const { data } = await gmail.users.messages.list({
      userId: user.email,
      q: searchQuery,
      maxResults: 25,
      pageToken,
    });

    if (!data.messages) break;

    // Process each email
    const emails = await Promise.all(
      data.messages.map(async ({ id }): Promise<DocumentType> => {
        const message = await gmail.users.messages.get({
          userId: user.email,
          id: id!,
        });

        const { payload, labelIds } = message.data;
        const headers = payload?.headers ?? [];

        // Determine the label (inbox or first available label)
        const label = labelIds?.includes("INBOX") ? "inbox" : labelIds?.[0]?.toLowerCase() ?? "inbox";

        // Construct email URL
        const href = `https://mail.google.com/mail/u/${user.GMAIL!.authUser}/#${label}/${id}`;

        // Process email content
        let content = "";
        if (user.isAISearch) {
          content = redactText(await processEmailContent(payload?.parts));
        }

        return {
          id: id!,
          date: getHeader(headers, "Date"),
          author: getHeader(headers, "From"),
          title: getHeader(headers, "Subject"),
          href,
          email: user.email,
          logo: LogoMap["GMAIL"],
          content,
          key: "GMAIL",
        };
      })
    );

    emails.forEach((email) => {
      result.push(email);
    });

    pageToken = data.nextPageToken ?? undefined;
  } while (pageToken && result.length < 50); // Limit total results to 50

  await updateSearchResultCount("GMAIL", result.length);
  return result;
};

export const searchDocs = async (searchQuery: string, user: UserType) => {
  const oauth2Client = (await getPlatformClient(
    user,
    "GOOGLE_DRIVE"
  )) as OAuth2Client;
  const response = await checkAndRefreshToken(
    user,
    "GOOGLE_DRIVE",
    oauth2Client
  );
  if (!response.success) return [];

  // Google Drive client that fetches the list of documents matching the search query
  const drive = google.drive({
    auth: oauth2Client,
    version: "v3",
  });

  const docs = google.docs({
    version: "v1",
    auth: oauth2Client,
  });

  const docsIds = await drive.files.list({
    q: searchQuery,
    fields: "files(id,createdTime,owners(emailAddress))",
    corpus: "user",
  });

  const resultWithPromise = docsIds.data.files?.map(
    async ({ id, createdTime, owners }): Promise<DocumentType> => {
      const document = await docs.documents.get({
        documentId: id!,
        fields:
          "title,tabs(documentTab(body(content(paragraph(elements(textRun(content))),table(tableRows(tableCells(content)))))))",
      });

      let content = "";
      if (document.data.tabs && user.isAISearch) {
        const structuralElement =
          document.data.tabs[0].documentTab?.body?.content ?? [];

        content = structuralElement.reduce((curContent, item) => {
          curContent += processDocsContent(item);
          return curContent;
        }, "");
      }

      return {
        id: id!,
        author: owners![0].emailAddress!,
        content: redactText(content),
        date: createdTime!,
        email: user.email,
        title: document.data.title!,
        logo: LogoMap["GOOGLE_DOCS"],
        href: `https://docs.google.com/document/d/${id!}`,
        key: "GOOGLE_DOCS",
      };
    }
  );

  const result = await Promise.all(resultWithPromise ?? []);

  await updateSearchResultCount("GOOGLE_DOCS", result.length);

  return result;
};

export const searchSheets = async (
  searchQuery: string,
  user: UserType
): Promise<DocumentType[]> => {
  const oauth2Client = (await getPlatformClient(user, "GOOGLE_DRIVE")) as OAuth2Client;
  const {success} = await checkAndRefreshToken(user, "GOOGLE_DRIVE", oauth2Client);

  if (!success) return [];

  const [q, ...ranges] = searchQuery.split("_");

  const drive = google.drive({
    version: "v3",
    auth: oauth2Client,
  });

  const sheets = google.sheets({
    version: "v4",
    auth: oauth2Client,
  });

  const response = await drive.files.list({
    q,
    fields: "files(id,createdTime,owners(emailAddress))",
    corpus: "user",
  });

  const files = response.data.files || [];

  const resultWithPromise = files.map(
    async ({ id, createdTime, owners }): Promise<DocumentType> => {
      const sheet = await sheets.spreadsheets.get({
        spreadsheetId: id!,
        ranges,
        fields:
          "properties(title),sheets(properties(sheetId,sheetType,hidden),data(rowData(values(formattedValue)))),spreadsheetUrl",
      });

      const { data, properties } = sheet.data.sheets![0];

      let content = "";
      let title = sheet.data.properties!.title!;
      let href =
        sheet.data.spreadsheetUrl! +
        `?gid=${properties!.sheetId!}#gid=${properties!.sheetId!}`;

      if (
        properties!.sheetType === "GRID" &&
        !properties!.hidden &&
        user.isAISearch
      ) {
        data?.forEach(({ rowData }) => {
          rowData?.forEach(({ values }) => {
            values?.forEach(({ formattedValue }) => {
              content += formattedValue!;
            });
          });
        });
      }

      return {
        date: createdTime!,
        author: owners ? owners[0].emailAddress! : "",
        email: user.email,
        content: redactText(content),
        href,
        id: id!,
        key: "GOOGLE_SHEETS",
        logo: LogoMap["GOOGLE_SHEETS"],
        title,
      };
    }
  );

  const result = await Promise.all(resultWithPromise ?? []);

  await updateSearchResultCount("GOOGLE_SHEETS", result.length);

  return result;
};

export const searchSlack = async (
  searchQuery: string,
  user: UserType
): Promise<DocumentType[]> => {
  const { success } =  await checkAndRefreshToken(user, 'SLACK');
  if(!success) return [];

  const slackClient = (await getPlatformClient(user, "SLACK")) as WebClient;
  const response = await slackClient.search.messages({
    query: searchQuery,
  });

  if (!response.ok) return [];

  const matches = response.messages?.matches ?? [];

  const resultWithPromise = matches.map(
    async ({
      channel,
      team,
      text,
      username,
      files,
      iid,
      ts,
      user: userId,
    }): Promise<DocumentType> => {
      const date = new Date(
        parseInt(String(parseFloat(ts!) * 1000).slice(0, -4))
      ).toISOString();

      const content = redactText(files ? files[0].title! : text!);

      return {
        id: iid ?? "",
        author: username ?? "",
        content,
        date,
        href: `https://app.slack.com/client/${team!}/${channel!.id}`,
        email:
          (
            await slackClient.users.info({
              user: userId!,
              token: user.SLACK.accessToken,
            })
          ).user?.profile?.email ?? "",
        key: "SLACK",
        logo: LogoMap["SLACK"],
        title: content,
      };
    }
  );

  const result = await Promise.all(resultWithPromise);

  await updateSearchResultCount("SLACK", result.length);
  return result;
};

export const searchNotion = async (searchQuery: string, user: UserType) => {
  const notionClient = (await getPlatformClient(
    user,
    "NOTION"
  )) as NotionClient;
  const response = await notionClient.search({
    query: searchQuery,
  });

  const resultWithPromise = response.results.map(
    async (item): Promise<DocumentType> => {
      const document: DocumentType = {
        author: "",
        content: "",
        date: "",
        email: "",
        href: "",
        id: "",
        key: "NOTION",
        logo: LogoMap["NOTION"],
        title: "",
      };

      if (isFullPageOrDatabase(item)) {
        const notionUser = await notionClient.users.retrieve({
          user_id: item.created_by.id,
          auth: user.NOTION.accessToken,
        });

        document.author = notionUser.name ?? "";
        document.email =
          notionUser.type === "person" ? notionUser.person.email! : "";
        document.href = item.url;
        document.id = item.id;
        document.date = item.created_time;

        if (isFullPage(item)) {
          document.title =
            item.properties.title.type === "title"
              ? item.properties.title.title[0].plain_text
              : "";
        } else {
          document.title = item.title[0].plain_text;
        }
      }

      return document;
    }
  );

  const result = await Promise.all(resultWithPromise);

  await updateSearchResultCount("NOTION", result.length);

  return result;
};

export const searchGitHub = async (searchQuery: string, user: UserType) => {
  const { success } =  await checkAndRefreshToken(user, 'GITHUB');
  if(!success) return [];
  
  const index = searchQuery.search(/type=/);
  const startIndex = index + 5;
  const str = searchQuery.slice(startIndex);
  const endIndex = str.search(/\s/);
  const searchSpace = (str.slice(0, endIndex === -1 ? undefined : endIndex)) as ("Repositories" | "Commits" | "PullRequests" | "Issues");

  const gitHub = (await getPlatformClient(user, 'GITHUB')) as Octokit;

  const result: DocumentType[] = [];
  const searchParams = {
    q: searchQuery.replace(`type=${searchSpace}`, ''),
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  }

  switch(searchSpace){
    case "Commits":
      const { data: commitData } = await gitHub.rest.search.commits(searchParams as RestEndpointMethodTypes["search"]["commits"]["parameters"]);      
      commitData.items.forEach(({ url, commit, node_id }) => {
        const { author, message } = commit;
        const { date, email, name } = author;
    
        result.push({
          author: name,
          content: message,
          date,
          email,
          href: url,
          id: node_id,
          key: 'GITHUB',
          logo: LogoMap["GITHUB"],
          title: message
        });
      });
      break;
    case "Repositories":
      const { data: repoData } = await gitHub.rest.search.repos(searchParams as RestEndpointMethodTypes["search"]["repos"]["parameters"]);
      repoData.items.forEach(({ created_at, description, full_name, id, html_url }) => {
        result.push({
          author: full_name,
          content: description ?? "",
          date: created_at,
          email: "",
          href: html_url,
          id: id.toString(),
          key: 'GITHUB',
          logo: LogoMap["GITHUB"],
          title: description ?? ""
        });
      });
      break;
    default:
      const { data } = await gitHub.rest.search.issuesAndPullRequests(searchParams as RestEndpointMethodTypes["search"]["issuesAndPullRequests"]["parameters"])
      
      data.items.forEach(({ html_url, id, title, user, created_at, body }) => {
        result.push({
          author: user?.name ?? "",
          content: body ?? "",
          date: created_at,
          email: user?.email ?? "",
          href: html_url,
          id: id.toString(),
          key: 'GITHUB',
          logo: LogoMap["GITHUB"],
          title
        });
      })
  }

  await updateSearchResultCount('GITHUB', result.length);
  return result;
};

export const generateSearchQuery = async (input: string) => {
  // const emailQuery = (await tunedModel_Gmail.invoke(input)).content.toString();
  // const docsQuery = (await tunedModel_Docs.invoke(input)).content.toString();
  // const sheetsQuery = (await tunedModel_Sheets.invoke(input)).content.toString();
  // const slackQuery = (await tunedModel_Slack.invoke(input)).content.toString();
  const gitHubQuery = (await tunedModel_GitHub.invoke(input)).content.toString();

  return { gitHubQuery };
};
