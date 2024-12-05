import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { ConnectToDB, encrypt } from "@/lib/utils";
import { User } from "@/models/user.model";

type TAxiosResponse = {
  access_token: string;
  bot_id: string;
  workspace_id: string;
};

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const err = req.nextUrl.searchParams.get("error");
  const userId = req.nextUrl.searchParams.get("state");

  try {
    if (err) {
      throw new Error(err);
    }

    if (!code) {
      return new NextResponse("Code not provided", { status: 400 });
    }
    if (!userId) {
      return new NextResponse("Bad request", { status: 400 });
    }

    const clientId = process.env.NOTION_CLIENT_ID!;
    const clientSecret = process.env.NOTION_CLIENT_SECRET!;
    const redirectUri = `${process.env.OAUTH_REDIRECT_URI!}/notion`;

    const tokenUrl = "https://api.notion.com/v1/oauth/token";
    const encoded = Buffer.from(`${clientId}:${clientSecret}`).toString(
      "base64"
    );

    const response = await axios.post<TAxiosResponse>(
      tokenUrl,
      {
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Basic ${encoded}`,
        },
      }
    );

    const { access_token, bot_id, workspace_id } = response.data;
    await ConnectToDB();
    await User.findOneAndUpdate(
      { userId },
      {
        $set: {
          "NOTION.accessToken": encrypt(access_token),
          "NOTION.workspaceId": encrypt(workspace_id),
          "NOTION.botId": encrypt(bot_id),
          "NOTION.searchResults": 0,
          "NOTION.connectionStatus": 1,
          "NOTION.searchStatus": false,
        },
      }
    );

    return NextResponse.redirect(
      "https://qflbv4c3-3001.inc1.devtunnels.ms/integrations?success=true&platform=NOTION"
    );
  } catch (error: any) {
    console.log(error.message);
    return NextResponse.redirect(
      "https://qflbv4c3-3001.inc1.devtunnels.ms/integrations?success=false&platform=NOTION"
    );
  }
}
