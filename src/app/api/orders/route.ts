import prisma from "@/lib/prisma";
import { verifyUser } from "@/lib/verify";
import { orderSchema } from "@/schema/order";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

type OrderPayload = {
  productId: number;
  colorId: number;
  quantity: number;
};

// export async function POST(request: Request) {
//   try {
//     const body = await request.json();

//     // orderSchema.parse(body);

//     if (body.items.length === 0) {
//       return new NextResponse("Please add minimum 1 product", { status: 400 });
//     }

//     for (const item of body.items) {
//       const color = await prisma.color.findFirstOrThrow({
//         where: {
//           id: item.colorId,
//           productId: item.productId,
//         },
//       });

//       if (item.quantity > color.quantity) {
//         return new NextResponse(
//           `Requested quantity (${item.quantity}) exceeds available stock (${color.quantity}) for productId ${item.productId}`,
//           { status: 400 },
//         );
//       }
//     }

//     const order = await prisma.order.create({
//       data: {
//         status: "PENDING",
//         userId: body.userId,
//         address: body.address,
//         postalCode: body.postalCode,
//         country: body.country,
//         city: body.city,
//         // items: {
//         //   create: (body.items as OrderPayload[]).map((item) => ({
//         //     colorId: item.colorId,
//         //     productId: item.productId,
//         //     quantity: item.quantity,
//         //   })),
//         // },
//       },
//       include: {
//         user: true,
//       },
//     });

//     for (const item of body.items as OrderPayload[]) {
//       const color = await prisma.color.findFirstOrThrow({
//         where: {
//           id: item.colorId,
//           productId: item.productId,
//         },
//       });

//       await prisma.color.update({
//         where: {
//           id: color.id,
//         },
//         data: {
//           quantity: color.quantity - item.quantity,
//         },
//       });
//     }

//     return NextResponse.json(order, { status: 201 });
//   } catch (error: any) {
//     console.log(error);
//     if (error instanceof ZodError) {
//       return NextResponse.json(error.issues[0], { status: 400 });
//     } else {
//       return new NextResponse("Internal server error", {
//         status: 500,
//       });
//     }
//   }
// }

export async function GET(request: Request) {
  try {
    const user = await verifyUser(request);
    if (!user) {
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

    const orders = await prisma.order.findMany({
      where: {
        userId: user.id,
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
                colors: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      data: orders,
      message: "Orders fetched successfully",
    });
  } catch (err: any) {
    console.log(err);
    return NextResponse.json(
      {
        data: null,
        message: err?.message || "Internal server error",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    orderSchema.parse(body);

    const transaction = await prisma.$transaction(async (ctx) => {
      for (const item of body.items) {
        const productColor = await ctx.color.findFirstOrThrow({
          where: {
            id: item.colorId,
            productId: item.productId,
          },
        });

        if (item.quantity > productColor.quantity) {
          throw new Error(
            `Requested quantity (${item.quantity}) exceeds available stock (${productColor.quantity}) for productId ${item.productId}`,
          );
        }
      }

      const order = await ctx.order.create({
        data: {
          status: "PENDING",
          userId: body.userId,
          address: body.address,
          postalCode: body.postalCode,
          country: body.country,
          city: body.city,
        },
      });

      for (const item of body.items) {
        await ctx.orderItems.create({
          data: {
            colorId: item.colorId,
            productId: item.productId,
            quantity: item.quantity,
            orderId: order.id,
          },
        });

        await ctx.color.update({
          where: {
            id: item.colorId,
            productId: item.productId,
          },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      return order;
    });

    return NextResponse.json({
      data: transaction,
      message: "Order created successfully",
      success: true,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        data: null,
        message: err?.message || "Internal server error",
      },
      {
        status: 500,
      },
    );
  }
}
