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

    const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID!;
    const clientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET!;
    const redirectUri = `${process.env.OAUTH_REDIRECT_URI!}/google_drive`;

    const authUser = new URL(
      req.headers.get("x-clerk-clerk-url")!
    ).searchParams.get("authuser");

    const tokenUrl = "https://oauth2.googleapis.com/token";

    const response = await axios.post(
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
      const tokens = response.data as Credentials;
      if (tokens.access_token && tokens.refresh_token && tokens.expires_in) {
        await ConnectToDB();
        await User.findOneAndUpdate(
          { userId },
          {
            $set: {
              "GOOGLE_DRIVE.accessToken": tokens.access_token,
              "GOOGLE_DRIVE.refreshToken": tokens.refresh_token,
              "GOOGLE_DRIVE.expiresAt": Date.now() + tokens.expires_in * 1000,
              "GOOGLE_DRIVE.authUser": authUser,
            },
          }
        );
      }
    }

    return NextResponse.redirect(
      "https://qflbv4c3-3001.inc1.devtunnels.ms/integrations?success=true&platform=GOOGLE_DRIVE"
    );
  } catch (error: any) {
    console.log(error.message);
    return NextResponse.redirect(
      "https://qflbv4c3-3001.inc1.devtunnels.ms/integrations?success=false&platform=GOOGLE_DRIVE"
    );
  }
}
