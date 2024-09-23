import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { ConnectToDB } from "@/lib/utils";
import { User } from "@/models/user.model";
import { Credentials } from "@/lib/types";
import { auth } from "@clerk/nextjs/server";

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

    await ConnectToDB();
    const clientId = process.env.GMAIL_CLIENT_ID!;
    const clientSecret = process.env.GMAIL_CLIENT_SECRET!;
    const redirectUri = `${process.env.OAUTH_REDIRECT_URI!}/gmail`;

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
        await User.findOneAndUpdate(
          { userId },
          {
            $set: {
              "gmail.accessToken": tokens.access_token,
              "gmail.refreshToken": tokens.refresh_token,
              "gmail.expiresAt": Date.now() + tokens.expires_in * 1000,
              "gmail.authUser": authUser,
            },
          }
        );
      }
    }

    return NextResponse.redirect(
      "https://qflbv4c3-3000.inc1.devtunnels.ms/integrations"
    );
  } catch (error: any) {
    console.log(error?.message);
    return NextResponse.redirect(
      "https://qflbv4c3-3000.inc1.devtunnels.ms/integrations"
    );
  }
}

export async function POST() {
  try {
    const { userId } = auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    await User.findOneAndUpdate(
      { userId },
      {
        $set: {
          "gmail.accessToken": "",
          "gmail.refreshToken": "",
          "gmail.expiresAt": undefined,
          "gmail.authUser": undefined,
        },
      }
    );

    return new NextResponse(null, { status: 200 });
  } catch (error: any) {
    console.log(error?.message);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
