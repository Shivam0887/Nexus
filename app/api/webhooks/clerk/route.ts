import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { ConnectToDB, encrypt } from "@/lib/utils";
import { User, TUser } from "@/models/user.model";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("WEBHOOK_SECRET not found");
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  const eventType = evt.type;

  await ConnectToDB();
  if (eventType === "user.created") {
    const userId = evt.data.id;
    const imageUrl = encrypt(evt.data.has_image ? evt.data.image_url : "");
    const username = encrypt(evt.data.username);
    const email = encrypt(evt.data.email_addresses[0].email_address);

    const birthday = encrypt(
      evt.data.unsafe_metadata?.birthday as string | undefined
    );

    await User.create({
      userId,
      imageUrl,
      username,
      email,
      birthday,
    });
  } else if (eventType === "user.deleted") {
    const isDeleted = evt.data.deleted;
    const userId = evt.data.id;

    if (isDeleted && userId) {
      const user = await User.findOne<TUser>({ userId });
      if (user) {
        await User.findOneAndDelete({ userId });
      }
    }
  } else if (eventType === "user.updated") {
    const imageUrl = encrypt(evt.data.image_url);
    const username = encrypt(evt.data.username);
    const userId = evt.data.id;

    await User.findOneAndUpdate(
      { userId },
      {
        $set: {
          imageUrl,
          username,
        },
      }
    );
  }

  return new Response("User created successfully", { status: 200 });
}
