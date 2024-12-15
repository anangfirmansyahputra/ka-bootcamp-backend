import prisma from "@/lib/prisma";
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

export async function PATCH(
  request: Request,
  { params }: { params: { productId: string } },
) {
  try {
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

    await prisma.product.findFirstOrThrow({
      where: {
        id: Number(params.productId),
      },
    });

    const updateProduct = await prisma.product.update({
      where: {
        id: Number(params.productId),
      },
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
      await prisma.color.update({
        where: {
          id: item.id,
          productId: updateProduct.id,
        },
        data: {
          productId: updateProduct.id,
          color: item.color,
          quantity: item.quantity,
        },
      });
    }

    return NextResponse.json(updateProduct, { status: 201 });
  } catch (err: any) {
    if (err instanceof ZodError) {
      return NextResponse.json(err.issues[0], { status: 400 });
    } else {
      return new NextResponse("Internal server error", { status: 500 });
    }
  }
}
