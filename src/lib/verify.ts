import prisma from "@/lib/prisma";
import { jwtVerify } from "jose";

export async function verifyUser(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");

    const token = authHeader?.split(" ")[1];

    if (!token) {
      return null;
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    const user = await prisma.user.findFirstOrThrow({
      where: {
        id: payload.userId as number,
      },
    });

    if (!user) {
      return null;
    }

    if (user.roles !== "ADMIN") {
      return null;
    }

    return user;
  } catch (err: any) {
    console.log(err);
    return null;
  }
}
