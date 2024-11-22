import { z } from "zod";

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { User, UserType } from "@/models/user.model";
import { Platforms, Scopes } from "@/lib/constants";
import { getPlatformClient } from "@/actions/utils.actions";
import { OAuth2Client } from "@/lib/types";
import { ConnectToDB } from "@/lib/utils";

const platformSchema = z.enum(Platforms);

export async function POST(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const platform = platformSchema.parse(
      req.nextUrl.searchParams.get("platform")
    );

    await ConnectToDB();
    const user = (await User.findOne<UserType>({ userId }))!;

    let url = "";
    switch (platform) {
      case "DISCORD":
        break;
      case "SLACK":
        url = `https://slack.com/oauth/v2/authorize/?client_id=${process.env
          .SLACK_CLIENT_ID!}&redirect_uri=${process.env
          .OAUTH_REDIRECT_URI!}/slack&response_type=code&state=${userId}&user_scope=${Scopes[
          platform
        ].join(",")}`;
        break;
      case "NOTION":
        url = `https://api.notion.com/v1/oauth/authorize?client_id=${process.env
          .NOTION_CLIENT_ID!}&response_type=code&owner=user&redirect_uri=${process
          .env.OAUTH_REDIRECT_URI!}/notion&state=${userId}`;
        break;
      case "GITHUB":
        url =
          "https://github.com/apps/nexus-ai-search-assistant/installations/new";
        break;
      case "MICROSOFT_TEAMS":
        break;
      default:
        const oauth2Client = (await getPlatformClient(
          user,
          platform
        )) as OAuth2Client;
        url = oauth2Client.generateAuthUrl({
          access_type: "offline",
          prompt: "consent select_account",
          scope: `openid ${Scopes[platform].join(" ")}`,
          state: userId,
        });
    }

    return new NextResponse(url);
  } catch (error: any) {
    console.log(error.message);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
