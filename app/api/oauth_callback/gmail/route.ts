import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { ConnectToDB } from "@/lib/utils";
import { User } from "@/models/user.model";
import { Credentials } from "@/lib/types";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");
  const userId = req.nextUrl.searchParams.get("state");

  try {
    if (error) {
      throw new Error(error);
    }

    if (!code) {
      return new NextResponse("Code not provided", { status: 400 });
    }
    if (!userId) {
      return new NextResponse("Bad request", { status: 400 });
    }

    const clientId = process.env.GMAIL_CLIENT_ID!;
    const clientSecret = process.env.GMAIL_CLIENT_SECRET!;
    const redirectUri = `${process.env.OAUTH_REDIRECT_URI!}/gmail`;

    const authUser = new URL(req.headers.get("x-clerk-clerk-url")!).searchParams.get("authuser");

    const tokenUrl = "https://oauth2.googleapis.com/token";

    const response = await axios.post<Credentials>(
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

    if (response.data) {
      const tokens = response.data;
      if (tokens.access_token && tokens.refresh_token && tokens.expires_in) {
        const { data } = await axios.get<{ email: string }>('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
          },
        });

        await ConnectToDB();
        await User.findOneAndUpdate(
          { userId },
          {
            $set: {
              "GMAIL.accessToken": tokens.access_token,
              "GMAIL.refreshToken": tokens.refresh_token,
              "GMAIL.expiresAt": Date.now() + tokens.expires_in * 1000,
              "GMAIL.authUser": authUser,
              "GMAIL.connectionStatus": 1,
              "GMAIL.searchStatus": false,
              "GMAIL.searchResults": 0,
              "GMAIL.email": data.email
            },
          }
        );
      }
    }

    return NextResponse.redirect(
      "https://qflbv4c3-3001.inc1.devtunnels.ms/integrations?success=true&platform=GMAIL"
    );
  } catch (error: any) {
    console.log(error.message);
    return NextResponse.redirect(
      "https://qflbv4c3-3001.inc1.devtunnels.ms/integrations?success=false&platform=GMAIL"
    );
  }
}
