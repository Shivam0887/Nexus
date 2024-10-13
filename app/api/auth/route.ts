import { z } from "zod";

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { Platforms, Scopes } from "@/lib/constants";
import { User } from "@/models/user.model";
import { getPlatformClient } from "@/actions/utils.actions";

const platformSchema = z.enum(Platforms);

export async function POST(req: NextRequest) {
  const { userId } = auth();

  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const platform = platformSchema.parse(
      req.nextUrl.searchParams.get("platform")
    );

    const oauth2Client = await getPlatformClient(platform);

    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent select_account",
      scope: `openid ${Scopes[platform]}`,
      state: userId,
    });

    return new NextResponse(url);
  } catch (error: any) {
    console.log(error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { userId } = auth();

  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const platform = platformSchema.parse(
      req.nextUrl.searchParams.get("platform")
    );

    await User.findOneAndUpdate(
      { userId },
      {
        $set: {
          [`${platform}.accessToken`]: "",
          [`${platform}.refreshToken`]: "",
          [`${platform}.expiresAt`]: undefined,
          [`${platform}.authUser`]: undefined,
        },
      }
    );

    return new NextResponse(null, { status: 200 });
  } catch (error: any) {
    console.log(error?.message);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
