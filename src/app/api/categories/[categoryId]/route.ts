import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: { categoryId: string } },
) {
  try {
    const category = await prisma.category.findFirst({
      where: {
        id: Number(params.categoryId),
      },
    });
  } catch (err: any) {
    return new NextResponse("Internal server error", { status: 500 });
  }
}
