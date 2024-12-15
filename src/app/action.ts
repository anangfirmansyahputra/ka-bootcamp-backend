"use server";

import prisma from "@/lib/prisma";
import { categorySchema } from "@/schema/category";
import { productSchema } from "@/schema/product";
import { userLoginSchema } from "@/schema/user";
import { compareSync } from "bcrypt";
import { SignJWT } from "jose";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ZodError } from "zod";

interface Color {
  color: string;
  quantity: number;
}

export async function signIn(formData: FormData) {
  try {
    // Tangkap data dari request
    const body = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    // Validasi data dari request
    userLoginSchema.parse(body);

    // Cari user berdasarkan email
    const user = await prisma.user.findUnique({
      where: {
        email: body.email as string,
      },
    });

    // Cek apakah user ada didalam database
    if (!user) {
      throw new Error("Email or password is wrong");
    }

    if (user?.roles !== "ADMIN") {
      throw new Error("You are not authorized to access this resource");
    }

    if (!compareSync(body.password as string, user.password)) {
      throw new Error("Email or password is wrong");
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

    // Setting token di cookie
    cookies().set("token", token);

    return { token };
  } catch (err: any) {
    console.log(err);
    if (err instanceof ZodError) {
      return { error: "Please insert a correct data" };
    } else {
      return { error: err?.message || "Internal server error" };
    }
  }
}

export async function signOut() {
  cookies().delete("token");
  redirect("/auth/signin");
}

export async function createCategory(formData: FormData) {
  try {
    const body = {
      name: formData.get("name"),
      isActive: formData.get("isActive"),
      description: formData.get("description"),
    };

    console.log(body);

    categorySchema.parse(body);

    const category = await prisma.category.create({
      data: {
        name: body.name as string,
        description: body.description as string,
        isActive: body.isActive === "1" ? true : false,
      },
    });

    return {
      success: true,
      data: category,
    };
  } catch (err: any) {
    console.log(err);
    if (err instanceof ZodError) {
      return { success: false, error: "Please insert a correct data" };
    } else {
      return { success: false, error: err?.message || "Internal server error" };
    }
  }
}

export async function deleteCategory(id: number) {
  try {
    await prisma.category.delete({
      where: {
        id: Number(id),
      },
    });

    return {
      success: true,
      message: "Category has been deleted",
    };
  } catch (err: any) {
    console.log(err);
    return {
      success: false,
      message: err?.message || "Internal server error",
    };
  }
}

export async function updateCategory(formData: FormData, id: number) {
  try {
    const body = {
      name: formData.get("name"),
      isActive: formData.get("isActive"),
      description: formData.get("description"),
    };

    categorySchema.parse(body);

    const category = await prisma.category.update({
      where: {
        id: Number(id),
      },
      data: {
        name: body.name as string,
        description: body.description as string,
        isActive: body.isActive === "1" ? true : false,
      },
    });

    revalidatePath("/categories");

    return {
      success: true,
      data: category,
    };
  } catch (err: any) {
    console.log(err);
    if (err instanceof ZodError) {
      return { success: false, error: "Please insert a correct data" };
    } else {
      return { success: false, error: err?.message || "Internal server error" };
    }
  }
}

export async function createProduct(
  formData: FormData,
  colors: Color[],
  images: string[],
) {
  try {
    const body = {
      name: formData.get("name"),
      description: formData.get("description"),
      categoryId: Number(formData.get("categoryId")),
      price: Number(formData.get("price")),
      company: formData.get("company"),
      images,
      colors,
    };

    productSchema.parse(body);

    const product = await prisma.product.create({
      data: {
        name: body.name as string,
        description: body.description as string,
        categoryId: Number(body.categoryId),
        images: body.images,
        price: Number(body.price),
        company: body.company as string,
      },
    });

    for (const color of colors) {
      await prisma.color.create({
        data: {
          color: color.color,
          quantity: color.quantity,
          productId: product.id,
        },
      });
    }

    return {
      success: true,
      data: product,
    };
  } catch (err: any) {
    console.log(err);
    if (err instanceof ZodError) {
      return { success: false, error: "Please insert a correct data" };
    } else {
      return { success: false, error: err?.message || "Internal server error" };
    }
  }
}

export async function deleteProduct(id: number) {
  await prisma.product.delete({
    where: {
      id: Number(id),
    },
  });

  return {
    success: true,
    message: "Product has been deleted",
  };
}

export async function updateProduct(
  formData: FormData,
  colors: {
    color: string;
    quantity: number;
    id?: number;
  }[],
  images: string[],
  id: number,
  idsColor: number[],
) {
  try {
    const body = {
      name: formData.get("name"),
      description: formData.get("description"),
      categoryId: Number(formData.get("categoryId")),
      price: Number(formData.get("price")),
      company: formData.get("company"),
      images,
      colors,
    };

    productSchema.parse(body);

    const product = await prisma.product.update({
      where: {
        id: id,
      },
      data: {
        name: body.name as string,
        description: body.description as string,
        categoryId: Number(body.categoryId),
        images: body.images,
        price: Number(body.price),
        company: body.company as string,
      },
    });

    for (const color of colors) {
      if (!color.id) {
        await prisma.color.create({
          data: {
            color: color.color,
            quantity: color.quantity,
            productId: product.id,
          },
        });
      } else {
        await prisma.color.update({
          where: {
            id: color.id,
          },
          data: {
            color: color.color,
            quantity: color.quantity,
          },
        });
      }
    }

    for (const id of idsColor) {
      await prisma.color.delete({
        where: {
          id: id,
        },
      });
    }

    return {
      success: true,
      data: product,
    };
  } catch (err: any) {
    console.log(err);
    if (err instanceof ZodError) {
      return { success: false, error: "Please insert a correct data" };
    } else {
      return { success: false, error: err?.message || "Internal server error" };
    }
  }
}
