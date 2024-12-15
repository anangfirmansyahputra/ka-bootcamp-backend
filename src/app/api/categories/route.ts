import prisma from "@/lib/prisma";
import { verifyUser } from "@/lib/verify";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export async function POST(request: Request) {
  try {
    const user = await verifyUser(request);

    if (user === null) {
      return NextResponse.json(
        {
          data: null,
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const body = await request.json();

    // categorySchema.parse(body);

    const category = await prisma.category.create({
      data: {
        name: body.name,
        description: body.description,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (err: any) {
    console.log(err);
    if (err instanceof ZodError) {
      return NextResponse.json(err.issues[0]);
    } else {
      return new NextResponse("Internal server error", { status: 500 });
    }
  }
}

export async function GET(request: Request) {
  try {
    const category = await prisma.category.findMany({});

    return NextResponse.json(category, { status: 200 });
  } catch (err: any) {
    return new NextResponse("Internal server error", { status: 500 });
  }
}
