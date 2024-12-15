import prisma from "@/lib/prisma";
import { verifyUser } from "@/lib/verify";
import { productSchema } from "@/schema/product";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

type ProductPayload = {
  categoryId: number;
  name: string;
  price: number;
  description?: string;
  company: string;
  colors: {
    id: number;
    color: string;
    quantity: number;
  }[];
  images: string[];
};

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

    const body: ProductPayload = await request.json();
    productSchema.parse(body);

    const category = await prisma.category.findFirst({
      where: {
        id: body.categoryId,
      },
    });

    if (!category) {
      return new NextResponse("Category not found", { status: 404 });
    }

    const newProduct = await prisma.product.create({
      data: {
        name: body.name,
        price: body.price,
        categoryId: category.id,
        company: body.company,
        description: body.description,
        images: body.images,
        // colors: {
        //   createMany: {
        //     data: body.colors.map((color) => ({
        //       color: color.color,
        //       quantity: color.quantity,
        //     })),
        //   },
        // },
      },
    });

    for (const item of body.colors) {
      await prisma.color.create({
        data: {
          productId: newProduct.id,
          color: item.color,
          quantity: item.quantity,
        },
      });
    }

    return NextResponse.json(newProduct, { status: 201 });
  } catch (err: any) {
    if (err instanceof ZodError) {
      return NextResponse.json(err.issues[0], { status: 400 });
    } else {
      return new NextResponse("Internal server error", { status: 500 });
    }
  }
}

export async function GET(request: Request) {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        colors: true,
      },
    });

    return NextResponse.json(
      {
        data: products,
      },
      { status: 200 },
    );
  } catch (err: any) {
    return new NextResponse("Internal server error", { status: 500 });
  }
}
