import {
  absoluteUrl,
  ConnectToDB,
  encrypt,
  generateGitHubJWT,
  refreshGitHubAccessToken
} from "@/lib/utils";
import { User } from "@/models/user.model";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const installationId = req.nextUrl.searchParams.get("installation_id");
    if (!installationId)
      throw new Error("Bad request. No installation_id provided.");

    const encodedJwt = generateGitHubJWT();

    const { userId } = await auth();
    const response = await refreshGitHubAccessToken(encodedJwt, installationId);

    const { expires_at, token } = response.data;

    await ConnectToDB();
    await User.findOneAndUpdate(
      { userId },
      {
        $set: {
          "GITHUB.accessToken": encrypt(token),
          "GITHUB.expiresAt": new Date(expires_at).getTime(),
          "GITHUB.installationId": encrypt(installationId),
          "GITHUB.searchResults": 0,
          "GITHUB.connectionStatus": 1,
          "GITHUB.searchStatus": false,
        },
      }
    );

    return NextResponse.redirect(
      `${absoluteUrl}/integrations?success=true&platform=GITHUB`
    );
  } catch (error: any) {
    console.log("GitHub error:", error.message);
    return NextResponse.redirect(
      `${absoluteUrl}/integrations?success=false&platform=GITHUB`
    );
  }
}
