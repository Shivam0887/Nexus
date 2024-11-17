import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { ConnectToDB } from "@/lib/utils";
import { User } from "@/models/user.model";
import { TSlackAxiosResponse } from "@/lib/types";

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

    const clientId = process.env.SLACK_CLIENT_ID!;
    const clientSecret = process.env.SLACK_CLIENT_SECRET!;
    const redirectUri = `${process.env.OAUTH_REDIRECT_URI!}/slack`;

    const tokenUrl = "https://slack.com/api/oauth.v2.access";
    const response = await axios.post<TSlackAxiosResponse>(
      tokenUrl,
      {},
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        params: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
        }),
      }
    );

    if (!response.data.ok)
      throw new Error(
        response.data.error ?? "Slack error: unable to authenticate"
      );

    const tokenExchangeUrl = "https://slack.com/api/oauth.v2.exchange";
    const tokenExchangeResponse = await axios.post<TSlackAxiosResponse>(
      tokenExchangeUrl,
      {},
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        params: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          token: response.data.authed_user.access_token,
        }),
      }
    );

    if (!tokenExchangeResponse.data.ok)
      throw new Error(
        tokenExchangeResponse.data.error ??
          "Slack error: unable to refresh token"
      );

    const { authed_user, team } = tokenExchangeResponse.data;
    await ConnectToDB();
    await User.findOneAndUpdate(
      { userId },
      {
        $set: {
          "SLACK.authUser": authed_user.id,
          "SLACK.accessToken": authed_user.access_token,
          "SLACK.refreshToken": authed_user.refresh_token!,
          "SLACK.expiresAt": Date.now() + authed_user.expires_in! * 1000,
          "SLACK.teamId": team.id,
          "SLACK.teamName": team.name,
          "SLACK.searchResults": 0,
          "SLACK.connectionStatus": 1,
          "SLACK.searchStatus": false,
        },
      }
    );

    return NextResponse.redirect(
      "https://qflbv4c3-3001.inc1.devtunnels.ms/integrations?success=true&platform=SLACK"
    );
  } catch (error: any) {
    console.log("Slack error:", error.message);
    return NextResponse.redirect(
      "https://qflbv4c3-3001.inc1.devtunnels.ms/integrations?success=false&platform=SLACK"
    );
  }
}
