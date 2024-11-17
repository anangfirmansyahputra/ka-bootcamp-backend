import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import prisma from "@/lib/prisma";
import React from "react";
import Form from "../_components/form";
import { notFound } from "next/navigation";

export default async function CategoryDetailId({
  params,
}: {
  params: { categoryId: string };
}) {
  const category = await prisma.category.findFirst({
    where: {
      id: Number(params.categoryId),
    },
  });

  console.log(category);

  if (!category) {
    return notFound();
  }

  return (
    <div>
      <Breadcrumb pageName="Category" />
      <Form category={category} />
    </div>
  );
}
