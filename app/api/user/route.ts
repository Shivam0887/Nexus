import { User, UserType } from "@/models/user.model";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function GET(req: Request) {
  const user = await currentUser();

  if (!user) {
    return Response.json({ error: "Unauthenticated user" }, { status: 401 });
  }

  const res = await User.findOne<UserType>({ userId: user.id });

  if (!res) {
    return Response.json({ error: "user not found" }, { status: 404 });
  }

  return Response.json(JSON.stringify(res), { status: 200 });
}
