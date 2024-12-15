import prisma from "@/lib/prisma";
import { userLoginSchema } from "@/schema/user";
import { NextResponse } from "next/server";
import { compareSync } from "bcrypt";
import { SignJWT } from "jose";

export async function POST(request: Request) {
  try {
    // Tangkap data dari request
    const body = await request.json();

    // Validasi data dari request
    userLoginSchema.parse(body);

    // Cari user berdasarkan email
    const user = await prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });

    // Cek apakah user ada didalam database
    if (!user) {
      return NextResponse.json(
        {
          data: null,
          success: false,
          message: "Email or password is wrong",
        },
        {
          status: 401,
        },
      );
    }

    if (user?.roles !== "CUSTOMER") {
      return NextResponse.json(
        {
          data: null,
          success: false,
          message: "User not customer",
        },
        {
          status: 401,
        },
      );
    }

    if (!compareSync(body.password, user.password)) {
      return NextResponse.json(
        {
          data: null,
          success: false,
          message: "Email or password is wrong",
        },
        {
          status: 401,
        },
      );
    }

    // Membuat secret
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1d")
      .sign(secret);

    const { password, ...props } = user;

    return NextResponse.json({
      data: {
        ...props,
        token: token,
      },
      success: true,
      message: "Login success",
    });
  } catch (err: any) {
    console.log(err);
    return NextResponse.json({
      data: null,
      success: false,
      message: "Internal server error",
    });
  }
}
