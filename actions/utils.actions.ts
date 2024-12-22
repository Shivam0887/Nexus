"use server";

import { JSDOM } from "jsdom";
import {
  ConnectToDB,
  encrypt,
  generateGitHubJWT,
  hasRichTextObject,
  isGoogleService,
  redactText,
  refreshGitHubAccessToken,
  refreshSlackAccessToken,
} from "@/lib/utils";
import { docs_v1, drive_v3, gmail_v1, google } from "googleapis";
import { User, TUser } from "@/models/user.model";
import {
  DocumentType,
  FilterKey,
  OAuth2Client,
  TActionResponse,
  TSearchableService,
} from "@/lib/types";
import { CharacterTextSplitter } from "langchain/text_splitter";
import { updateSearchResultCount } from "./user.actions";
import { WebClient } from "@slack/web-api";
import { Octokit, RestEndpointMethodTypes } from "@octokit/rest";
import {
  isFullPage,
  isFullPageOrDatabase,
  Client as NotionClient,
  collectPaginatedAPI,
  isFullBlock,
  isFullUser,
} from "@notionhq/client";
import { LogoMap, Scopes } from "@/lib/constants";
import {
  BlockObjectResponse,
  PageObjectResponse,
  PartialBlockObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { format } from "date-fns";
import { auth } from "@clerk/nextjs/server";
import { decryptedUserData } from "./security.actions";
import { Match } from "@slack/web-api/dist/types/response/SearchMessagesResponse";

const textSplitter = new CharacterTextSplitter({ separator: "</html>" });

const refreshAccessToken = async (
  user: TUser,
  platform: Exclude<FilterKey, "NOTION">,
  oauth2Client?: OAuth2Client
): Promise<{
  accessToken: string;
  expiresAt: number;
  refreshToken?: string;
}> => {
  switch (platform) {
    case "GITHUB":
      const encodedJwt = generateGitHubJWT();
      const gitHubResponse = await refreshGitHubAccessToken(encodedJwt, user.GITHUB.installationId);
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
      const { access_token, expires_in, refresh_token } = slackResponse.data.authed_user;
      return {
        accessToken: access_token,
        expiresAt: expires_in!,
        refreshToken: refresh_token!,
      };
    default:
      oauth2Client!.setCredentials({
        refresh_token: user[platform].refreshToken,
      });

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
  user: TUser,
  platform: Exclude<FilterKey, "NOTION">,
  oauth2Client?: OAuth2Client
): Promise<TActionResponse> => {
  const { accessToken, expiresAt } = user[platform];

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
      const { accessToken, expiresAt, refreshToken: refresh_token } = await refreshAccessToken(user, platform, oauth2Client);
      const updateQuery = {
        [`${platform}.accessToken`]: encrypt(accessToken),
        [`${platform}.expiresAt`]: expiresAt,
      };

      if (platform === "SLACK") {
        updateQuery[`${platform}.refreshToken`] = encrypt(refresh_token!);
      }

      await ConnectToDB();
      user = (await User.findOneAndUpdate(
        { userId: user.userId },
        {
          $set: updateQuery,
        },
        {
          new: true,
        }
      ))!;

      console.log("Access token refreshed.");
      return {
        success: true,
        data: "",
      };
    } catch (error: any) {
      const errorMessage =
        error?.response && error?.response?.data?.error === "invalid_grant"
          ? `RE_AUTHENTICATE-${platform}`
          : error.message;

      if (errorMessage === `RE_AUTHENTICATE-${platform}`) {
        await User.findOneAndUpdate(
          { userId: user.userId },
          {
            $set: {
              [`${platform}.connectionStatus`]: 2,
            },
          }
        );
      }
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
};

export const getPlatformClient = async (user: TUser, platform: FilterKey) => {
  const dbUser = (await decryptedUserData(user.userId)) as TUser | undefined;
  if (!dbUser) return;

  user = dbUser;

  switch (platform) {
    case "SLACK":
      return new WebClient(dbUser?.[platform].accessToken);
    case "NOTION":
      return new NotionClient({ auth: dbUser?.[platform].accessToken });
    case "GITHUB":
      return new Octokit({ auth: dbUser?.[platform].accessToken });
    default:
      const clientId = process.env[`${platform}_CLIENT_ID`]!;
      const clientSecret = process.env[`${platform}_CLIENT_SECRET`]!;
      const redirectUri = `${process.env.OAUTH_REDIRECT_URI!}/${platform.toLowerCase()}`;
      return new google.auth.OAuth2({
        clientId,
        clientSecret,
        redirectUri,
      });
  }
};

// Helper function to process Gmail content
const processEmailContent = async (
  user: TUser,
  oauth2Client: OAuth2Client,
  id: string
) => {
  const gmail = google.gmail({
    version: "v1",
    auth: oauth2Client,
  });

  const message = await gmail.users.messages.get({
    userId: user.GMAIL.email,
    id,
    fields: "payload(headers,parts(mimeType,body)),labelIds",
  });

  const { payload, labelIds } = message.data;
  const headers = payload?.headers ?? [];

  // Determine the label (inbox or first available label)
  const label = labelIds?.includes("INBOX")
                ? "inbox"
                : labelIds?.[0]?.toLowerCase() ?? "inbox";

  // Construct email URL
  const href = `https://mail.google.com/mail/u/${user.GMAIL!.authUser}/#${label}/${id}`;

  // Process email content  
  const contentPromises = (payload!.parts ?? []).map(
    async ({ body, mimeType }) => {
      if (!body?.data) return "";

      let tempContent = Buffer.from(body.data, "base64").toString("utf8");

      if (mimeType === "text/html") {
        const htmlContent = await textSplitter.splitText(content);
        tempContent = htmlContent
          .map((html) => {
            const dom = new JSDOM(html.concat("</html>"));
            return (dom.window.document.querySelector("body")?.textContent ?? "");
          })
          .join(" ");
      }

      return tempContent;
    }
  );

  const content = (await Promise.all(contentPromises)).join(" ");

  // Helper function to extract header value
  const getHeader = (
    headers: gmail_v1.Schema$MessagePartHeader[],
    name: string
  ): string => headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? "";

  return {
    content,
    href,
    date: getHeader(headers, "Date"),
    author: getHeader(headers, "From"),
    title: getHeader(headers, "Subject"),
  };
};

// Helper function to process Google Docs content
const processDocsContent = async (
  user: TUser,
  id: string,
  oauth2Client: OAuth2Client
) => {
  const accumulateDocsContent = (content: docs_v1.Schema$StructuralElement) => {
    let result = "";
    if (content.paragraph?.elements) {
      result = content.paragraph.elements.reduce((curContent, { textRun }) => (curContent += textRun?.content ?? ""), result);

    } else if (content.table?.tableRows) {
      const tableRows = content.table.tableRows;

      tableRows.forEach(({ tableCells }) => {
        tableCells?.forEach(({ content }) => {
          const structuralElement = content ?? [];
          result = structuralElement.reduce((curContent, item) => (curContent += accumulateDocsContent(item)), result);
        });
      });
    }

    return result;
  };

  const docs = google.docs({
    version: "v1",
    auth: oauth2Client,
  });

  const document = await docs.documents.get({
    documentId: id!,
    fields: "title,tabs(documentTab(body(content(paragraph(elements(textRun(content))),table(tableRows(tableCells(content)))))))",
  });

  let content = "";
  if (document.data.tabs) {
    const structuralElement = document.data.tabs[0].documentTab?.body?.content ?? [];
    content = structuralElement.reduce((curContent, item) => (curContent += accumulateDocsContent(item)), "");
  }

  return {
    content,
    title: document.data.title ?? "",
  };
};

// Helper function to process Google Sheets content
const processSheetsContent = async (
  user: TUser,
  id: string,
  oauth2Client: OAuth2Client,
  ranges: string[]
) => {
  let content = "";
  const sheets = google.sheets({
    version: "v4",
    auth: oauth2Client,
  });

  const sheet = await sheets.spreadsheets.get({
    spreadsheetId: id!,
    ranges,
    fields: "properties(title),sheets(properties(sheetId,sheetType,hidden),data(rowData(values(formattedValue)))),spreadsheetUrl",
  });

  const { data, properties } = sheet.data.sheets![0];

  let title = sheet.data.properties!.title!;
  let href = sheet.data.spreadsheetUrl! + `?gid=${properties!.sheetId!}#gid=${properties!.sheetId!}`;

  if (
    properties!.sheetType === "GRID" &&
    !properties!.hidden
  ) {
    data?.forEach(({ rowData }) => {
      rowData?.forEach(({ values }) => {
        values?.forEach(({ formattedValue }) => {
          content += formattedValue! + " ";
        });
        content += "\n";
      });
    });
  }

  return {
    content,
    title,
    href,
  };
};

const processNotionPageContent = async (
  notionClient: NotionClient,
  id: string
) => {
  const getRichText = (richText: RichTextItemResponse[]) => richText.reduce((text, { plain_text }) => text + plain_text, "");

  const processBlock = async (
    block: BlockObjectResponse | PartialBlockObjectResponse
  ): Promise<string> => {
    let content = "";

    if (isFullBlock(block)) {
      if (hasRichTextObject(block.type) && block.parent.type === "page_id") {
        const richTextContent = getRichText((block as any)[block.type].rich_text);
        content += `${block.type}: ${richTextContent}\n`;
      }

      // Check if the block has children and process them recursively
      if (block.has_children) {
        const childBlocks = await collectPaginatedAPI(
          notionClient.blocks.children.list,
          {
            block_id: block.id,
          }
        );

        for (const childBlock of childBlocks) {
          content += await processBlock(childBlock); // Recursively process each child block
        }
      }
    }

    return content; // Return the accumulated content for this block
  };

  const blocks = await collectPaginatedAPI(notionClient.blocks.children.list, {
    block_id: id,
  });

  return (await Promise.all(blocks.map(processBlock))).join("");
};

const processNotionDatabaseContent = async (
  notionClient: NotionClient,
  id: string
) => {
  const databaseEntries = await collectPaginatedAPI(
    notionClient.databases.query,
    {
      database_id: id,
    }
  );

  let content = "";

  // Function to extract content from a database entry
  const extractEntryContent = (entry: PageObjectResponse): string => {
    return Object.entries(entry.properties)
      .map(([propertyName, property]) => {
        let value = "";

        switch (property.type) {
          case "title":
            value = property.title.map((text) => text.plain_text).join(" ");
            break;
          case "rich_text":
            value = property.rich_text.map((text) => text.plain_text).join(" ");
            break;
          case "number":
            value = property.number?.toString() ?? "N/A";
            break;
          case "select":
            value = property.select?.name ?? "N/A";
            break;
          case "multi_select":
            value = property.multi_select.map((item: any) => item.name).join(", ") || "N/A";
            break;
          case "date":
            value = property.date?.start
                    ? format(property.date.start, "yyyy-dd-MM HH:mm:ss")
                    : "N/A";
            break;
          case "checkbox":
            value = property.checkbox ? "✔️" : "❌";
            break;
          case "url":
            value = property.url || "N/A";
            break;
          case "email":
            value = property.email ?? "N/A";
            break;
          case "phone_number":
            value = property.phone_number ?? "N/A";
            break;
          case "formula":
            value = property.formula.type === "boolean"
                    ? property.formula.boolean?.valueOf.toString() ?? "N/A"
                    : property.formula.type === "date"
                    ? property.formula.date?.start?.toString() ?? "N/A"
                    : property.formula.type === "number"
                    ? property.formula.number?.toString() ?? "N/A"
                    : property.formula.string ?? "N/A";

            break;
          case "relation":
            value = property.relation.map((relation) => relation.id).join(", ") || "N/A";
            break;
          case "created_time":
            value = format(property.created_time, "yyyy-dd-MM HH:mm:ss");
            break;
          case "last_edited_time":
            value = format(property.last_edited_time, "yyyy-dd-MM HH:mm:ss");
            break;
          case "people":
            value = property.people
              .map((person) => (isFullUser(person) ? person.name ?? person.object : person.object))
              .join(", ");

            break;
          case "files":
            value = property.files.map((file) => file.name).join(", ") || "N/A";
            break;
          case "status":
            value = property.status?.name ?? "N/A";
            break;
          case "created_by":
            value = isFullUser(property.created_by)
                    ? property.created_by.name ?? property.created_by.object
                    : property.created_by.object;
            break;
          case "last_edited_by":
            value = isFullUser(property.last_edited_by)
                    ? property.last_edited_by.name ?? property.last_edited_by.object
                    : property.last_edited_by.object;
            break;
          // Add more cases as needed for other property types
          default:
            return `${propertyName}: Unsupported type`;
        }

        return `${propertyName}: ${value}`;
      })
      .join("\n"); // Join all property values with a newline
  };

  // Process each entry and accumulate the content
  databaseEntries.forEach((entry) => {
    if (entry.object === "page" && isFullPage(entry)) {
      content += extractEntryContent(entry) + "\n\n"; // Add a newline after each entry
    }
  });

  return content; // Return the accumulated content for the database
};

export const searchGmail = async (
  searchQuery: string,
  user: TUser
): Promise<TActionResponse<DocumentType[]>> => {
  const oauth2Client = (await getPlatformClient(user, "GMAIL")) as OAuth2Client;
  const response = await checkAndRefreshToken(user, "GMAIL", oauth2Client);

  const result: DocumentType[] = [];
  if (!response.success)
    return {
      success: false,
      error: response.error,
    };

  const gmail = google.gmail({
    version: "v1",
    auth: oauth2Client,
  });

  let retry = 4;
  const regex1 = /\b\w+:[^\s]+\b/g; //find key:value pairs
  const regex2 = /(?<=subject:)("[^"]+"|\S+)/g // extracting the value of key "subject"
  const regex3 = /\b(?!subject\b)\w+:[^\s]+/g // find key:value pairs except the subject as key and it's respective value
  let q: string = "";
  let updatedGmailQuery: string | undefined = searchQuery;

  let gmailMessages: gmail_v1.Schema$ListMessagesResponse = {};
  let pageToken: string | undefined;

  do {
    if(retry <= 3) {
      if(retry === 3) updatedGmailQuery = updatedGmailQuery.match(regex1)?.join(' ')?.trim();
      else {
        updatedGmailQuery = updatedGmailQuery.match(regex3)?.join(' ');
        if(retry === 2 && updatedGmailQuery) updatedGmailQuery += updatedGmailQuery.match(regex2)?.join(' ')?.trim();
      }
      
      if(!updatedGmailQuery) break;
    }

    q = updatedGmailQuery;

     // Fetch emails
    const { data } = await gmail.users.messages.list({
      userId: user.email,
      q,
      maxResults: 25,
      pageToken,
    });

    gmailMessages = data;

    retry--;
  } while (user.isAISearch && !gmailMessages.messages && retry > 0);


  do {
    if (!gmailMessages.messages) break;

    // Process each email
    const emails = await Promise.all(
      gmailMessages.messages.map(async ({ id }): Promise<DocumentType> => {
        const { author, content, date, href, title } = await processEmailContent(user, oauth2Client, id!);

        return {
          id: id!,
          date,
          author,
          title,
          href,
          email: user.GMAIL.email,
          logo: LogoMap["GMAIL"],
          content,
          key: "GMAIL",
        };
      })
    );

    emails.forEach((email) => {
      result.push(email);
    });

    pageToken = gmailMessages.nextPageToken ?? undefined;
  } while (pageToken && result.length < 50); // Limit total results to 50

  await updateSearchResultCount("GMAIL", result.length);

  return {
    success: true,
    data: result,
  };
};

export const searchDocs = async (
  searchQuery: string,
  user: TUser
): Promise<TActionResponse<DocumentType[]>> => {
  const oauth2Client = (await getPlatformClient(user, "GOOGLE_DRIVE")) as OAuth2Client;
  const response = await checkAndRefreshToken(user, "GOOGLE_DRIVE", oauth2Client);

  if (!response.success)
    return {
      success: false,
      error: response.error,
    };

  // Google Drive client that fetches the list of documents matching the search query
  const drive = google.drive({
    auth: oauth2Client,
    version: "v3",
  });

  let q = searchQuery;
  let docsData: drive_v3.Schema$FileList = {};
  let retry = 2;

  do {
    if(retry === 1){
      q.replace(/\bname(?= contains)\b/g, "fullText");
      q.replace(/\bname\s!=/g, "fullText contains");
    }

    const { data } = await drive.files.list({
      q,
      fields: "files(id,createdTime,owners(emailAddress))",
      corpus: "user",
    });

    docsData = data;

    retry--;
  } while (user.isAISearch && !docsData.files && retry > 0);

  const resultWithPromise = docsData.files?.map(
    async ({ id, createdTime, owners }): Promise<DocumentType> => {
      const { content, title } = await processDocsContent(
        user,
        id!,
        oauth2Client
      );

      return {
        id: id!,
        author: owners![0].emailAddress!,
        content: redactText(content),
        date: createdTime!,
        email: user.email,
        title,
        logo: LogoMap["GOOGLE_DOCS"],
        href: `https://docs.google.com/document/d/${id!}`,
        key: "GOOGLE_DOCS",
      };
    }
  );

  const result = await Promise.all(resultWithPromise ?? []);

  await updateSearchResultCount("GOOGLE_DOCS", result.length);

  return {
    success: true,
    data: result,
  };
};

export const searchSheets = async (
  searchQuery: string,
  user: TUser
): Promise<TActionResponse<(DocumentType & { ranges: string[] })[]>> => {
  const oauth2Client = (await getPlatformClient(user, "GOOGLE_DRIVE")) as OAuth2Client;
  const response = await checkAndRefreshToken(user, "GOOGLE_DRIVE", oauth2Client);

  if (!response.success)
    return {
      success: false,
      error: response.error,
    };

  const [query, ...ranges] = searchQuery.split("_");

  const drive = google.drive({
    version: "v3",
    auth: oauth2Client,
  });

  let q = query;
  let sheetsData: drive_v3.Schema$FileList = {};
  let retry = 2;

  do {
    if(retry === 1){
      q.replace(/\bname(?= contains)\b/g, "fullText");
      q.replace(/\bname\s!=/g, "fullText contains");
    }

    const { data } = await drive.files.list({
      q,
      fields: "files(id,createdTime,owners(emailAddress))",
      corpus: "user",
    });

    sheetsData = data;

    retry--;
  } while (user.isAISearch && !sheetsData.files && retry > 0);

  const files = sheetsData.files || [];

  const resultWithPromise = files.map(
    async ({id, createdTime, owners }): Promise<DocumentType & { ranges: string[] }> => {
      const { content, href, title } = await processSheetsContent(
        user,
        id!,
        oauth2Client,
        ranges
      );

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
        ranges,
      };
    }
  );

  const result = await Promise.all(resultWithPromise ?? []);

  await updateSearchResultCount("GOOGLE_SHEETS", result.length);

  return {
    success: true,
    data: result,
  };
};

export const searchSlack = async (
  searchQuery: string,
  user: TUser
): Promise<TActionResponse<DocumentType[]>> => {
  const response = await checkAndRefreshToken(user, "SLACK");
  if (!response.success)
    return {
      success: false,
      error: response.error,
    };

  const slackClient = (await getPlatformClient(user, "SLACK")) as WebClient;
  let matches: Match[] = [];
  let query = searchQuery;
  let retry = 2;

  do {

    if(retry === 1) {
      const expWithoutQuotes = query.match(/"[^"]+"/g)?.join(" ").replace(/"/g, '').trim();
      if(!expWithoutQuotes) break;

      const pairs = query.match(/\b\w+:\S+\b/g)?.join(" ").trim();
      if(!pairs) break;

      query = expWithoutQuotes + " " + pairs;
    }

    const slackMsg = await slackClient.search.messages({ query });
    matches = slackMsg.messages?.matches ?? [];

    if (!slackMsg.ok)
      return {
        success: false,
        error: "Slack error, please try again later.",
      };

    retry--;
  } while (user.isAISearch && matches.length === 0 && retry > 0);

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
      const date = new Date(parseInt(String(parseFloat(ts!) * 1000).slice(0, -4))).toISOString();

      const content = redactText(files ? files[0].title! : text!);

      return {
        id: iid ?? "",
        author: username ?? "",
        content,
        date,
        href: `https://app.slack.com/client/${team!}/${channel!.id}`,
        email: (await slackClient.users.info({ user: userId!, token: user.SLACK.accessToken })).user?.profile?.email ?? "",
        key: "SLACK",
        logo: LogoMap["SLACK"],
        title: content,
      };
    }
  );

  const result = await Promise.all(resultWithPromise);

  await updateSearchResultCount("SLACK", result.length);
  return {
    success: true,
    data: result,
  };
};

export const searchNotion = async (
  searchQuery: string,
  user: TUser
): Promise<TActionResponse<(DocumentType & { type: "Page" | "Database" })[]>> => {
  const notionClient = (await getPlatformClient(user, "NOTION")) as NotionClient;
  const response = await notionClient.search({ query: searchQuery });

  const resultWithPromise = response.results.map(async (item) => {
      const document: DocumentType & { type: "Page" | "Database" } = {
        author: "",
        content: "",
        date: "",
        email: "",
        href: "",
        id: "",
        key: "NOTION",
        logo: LogoMap["NOTION"],
        title: "",
        type: "Page",
      };

      if (isFullPageOrDatabase(item)) {
        const notionUser = await notionClient.users.retrieve({
          user_id: item.created_by.id,
          auth: user.NOTION.accessToken,
        });

        document.author = notionUser.name ?? "";
        document.email = notionUser.type === "person" ? notionUser.person.email! : "";
        document.href = item.url;
        document.id = item.id;
        document.date = item.created_time;

        if (isFullPage(item)) {
          document.content = user.isAISearch
                             ? redactText(await processNotionPageContent(notionClient, item.id))
                             : "";
          document.title = item.properties?.title?.type === "title"
                           ? item.properties.title.title[0].plain_text
                           : "No title found";
        } else {
          document.type = "Database";
          document.title = item.title[0].plain_text;
          document.content = user.isAISearch
                             ? redactText(await processNotionDatabaseContent(notionClient, item.id))
                             : "";
        }
      }

      return document;
    }
  );

  const result = await Promise.all(resultWithPromise);

  await updateSearchResultCount("NOTION", result.length);

  return {
    success: true,
    data: result,
  };
};

export const searchGitHub = async (
  searchQuery: string,
  user: TUser,
): Promise<TActionResponse<DocumentType[]>> => {
  const response = await checkAndRefreshToken(user, "GITHUB");
  if (!response.success)
    return {
      success: false,
      error: response.error,
    };
  
  const isSearchSpace = searchQuery.match(/\btype=\w+\b/);
  let q = searchQuery;
  let searchSpace: ("Repositories" | "Commits" | "PullRequests" | "Issues") = "Repositories"

  if(isSearchSpace){
    searchSpace = isSearchSpace[0].slice(5) as ("Repositories" | "Commits" | "PullRequests" | "Issues");
    q.replace(isSearchSpace[0], "");
  }

  const gitHub = (await getPlatformClient(user, "GITHUB")) as Octokit;

  let result: DocumentType[] = [];
  let retry = 2;

  do {
    const searchParams = {
      q,
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    };

    // Will try one more time, if no result found. 
    if(retry < 2){
      if(!(/\bin:\w+\b/.test(q))) break; // if no in:[value] key-value pair found    

      const extractInOperator = q.match(/\bin:\w+\b/)!;
      const value = extractInOperator[0].split(":")[1];

      if(searchSpace === "Commits" || searchSpace === "PullRequests"){
        if(!(/^[title|body]$/.test(value)) || value !== "title,body") break;

        q.replace(value, "in:title,body");
      }
      else {
        if(!(/^[name|description]$/.test(value)) || value !== "name,description") break;
          
        q.replace(value, "in:name,description");
      }
    }
    
    switch (searchSpace) {
      case "Commits":
        const { data: commitData } = await gitHub.rest.search.commits(
          searchParams as RestEndpointMethodTypes["search"]["commits"]["parameters"]
        );
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
            key: "GITHUB",
            logo: LogoMap["GITHUB"],
            title: message,
          });
        });
        break;
      case "Repositories":
        const { data: repoData } = await gitHub.rest.search.repos(
          searchParams as RestEndpointMethodTypes["search"]["repos"]["parameters"]
        );
  
        repoData.items.forEach(
          ({ created_at, description, full_name, id, html_url }) => {
            result.push({
              author: full_name,
              content: description ?? "",
              date: created_at,
              email: "",
              href: html_url,
              id: id.toString(),
              key: "GITHUB",
              logo: LogoMap["GITHUB"],
              title: description ?? "",
            });
          }
        );
        break;
      default:
        const { data } = await gitHub.rest.search.issuesAndPullRequests(
          searchParams as RestEndpointMethodTypes["search"]["issuesAndPullRequests"]["parameters"]
        );
  
        data.items.forEach(({ html_url, id, title, user, created_at, body }) => {
          result.push({
            author: user?.name ?? "",
            content: body ?? "",
            date: created_at,
            email: user?.email ?? "",
            href: html_url,
            id: id.toString(),
            key: "GITHUB",
            logo: LogoMap["GITHUB"],
            title,
          });
        });
    }

    retry--;
  } while (user.isAISearch && result.length === 0 && retry > 0);

  await updateSearchResultCount("GITHUB", result.length);
  return {
    success: true,
    data: result,
  };
};

/**
 * @description This method process the content based on the platform/service.
 * @param platform Searchable platform/service except for Google Calendar, GitHub, and Google Drive.
 * @param id Id of the search item.
 * @param ranges Required, if the platform/service is Google Sheets, otherwise optional.
 * @param type Required, if the plaform/service is Notion, otherwise optional.
 */
export const getProcessedContent = async (
  platform: Exclude<TSearchableService, "GITHUB" | "SLACK">,
  id: string,
  type?: "Page" | "Database",
  ranges?: string[]
): Promise<TActionResponse> => {
  try {
    const { userId } = await auth();
    if (!userId)
      return {
        success: false,
        error: "Unauthorized",
      };

    const user = (await decryptedUserData(userId)) as TUser | undefined;
    if (!user)
      return {
        success: false,
        error: "User not found.",
      };

    let content = "";
    switch (platform) {
      case "DISCORD":
        // Implemented soon
        break;
      case "GMAIL":
        const gmailOAuth2Client = (await getPlatformClient(user, platform)) as OAuth2Client;
        const gmailRefreshTokenResp = await checkAndRefreshToken(user, platform, gmailOAuth2Client);

        if (!gmailRefreshTokenResp.success)
          return {
            success: false,
            error: gmailRefreshTokenResp.error,
          };

        const { content: emailContent } = await processEmailContent(user, gmailOAuth2Client, id);
        content = emailContent;
        break;
      case "MICROSOFT_TEAMS":
        // Implemented soon
        break;
      case "NOTION":
        if (!type)
          return {
            success: false,
            error: "'type' paramater is missing when passing 'NOTION' in the 'platform' paramater",
          };

        const notionClient = (await getPlatformClient(user, platform)) as NotionClient;
        content = type === "Database"
                  ? await processNotionDatabaseContent(notionClient, id)
                  : await processNotionPageContent(notionClient, id);
        break;
      default:
        //Handling in the default case because Google Drive manages all of them, Google Docs, Google Sheets, and Google Slides.
        const oauth2Client = (await getPlatformClient(user, "GOOGLE_DRIVE")) as OAuth2Client;
        const refreshTokenResp = await checkAndRefreshToken(user, "GOOGLE_DRIVE", oauth2Client);

        if (!refreshTokenResp.success)
          return {
            success: false,
            error: refreshTokenResp.error,
          };

        if (platform === "GOOGLE_DOCS") {
          const { content: docsContent } = await processDocsContent(user, id, oauth2Client);
          content = docsContent;
        } else if (platform === "GOOGLE_SHEETS") {
          if (!ranges)
            return {
              success: false,
              error: "'ranges' paramater is missing when passing 'GOOGLE_SHEETS' in the 'platform' paramater",
            };

          const { content: sheetsContent } = await processSheetsContent(user, id, oauth2Client, ranges);
          content = sheetsContent;
        } else {
          // Implemented soon
        }
    }

    return {
      success: true,
      data: content,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
};

export const getOAuthUrl = async (platform: FilterKey, userId: string | null | undefined) => {
  if (!userId) return undefined;

  let url: string | undefined = undefined;

  switch (platform) {
    case "DISCORD":
      break;
    case "SLACK":
      url = `https://slack.com/oauth/v2/authorize/?client_id=${process.env.SLACK_CLIENT_ID!}&redirect_uri=${process.env.OAUTH_REDIRECT_URI!}/slack&response_type=code&state=${userId}&user_scope=${Scopes[platform].join(",")}`;
      break;
    case "NOTION":
      url = `https://api.notion.com/v1/oauth/authorize?client_id=${process.env.NOTION_CLIENT_ID!}&response_type=code&owner=user&redirect_uri=${process.env.OAUTH_REDIRECT_URI!}/notion&state=${userId}`;
      break;
    case "GITHUB":
      url = "https://github.com/apps/nexus-ai-search-assistant/installations/new";
      break;
    case "MICROSOFT_TEAMS":
      break;
    default:
      url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env[`${platform}_CLIENT_ID`]}&redirect_uri=${process.env.OAUTH_REDIRECT_URI!}/${platform.toLowerCase()}&response_type=code&scope=openid ${Scopes[platform].join(" ")}&access_type=offline&prompt=consent select_account&state=${userId}`;
  }

  return url;
}