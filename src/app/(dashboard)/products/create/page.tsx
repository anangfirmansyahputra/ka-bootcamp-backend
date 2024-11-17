import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import FormProduct from "../_components/form";
import prisma from "@/lib/prisma";

export default async function ProductCreatePage() {
  const categories = await prisma.category.findMany({
    where: {
      isActive: true,
    },
  });

  return (
    <div>
      <Breadcrumb pageName="Product" />
      <FormProduct categories={categories} />
    </div>
  );
}
