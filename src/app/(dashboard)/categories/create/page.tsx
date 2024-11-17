import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Form from "@/app/(dashboard)/categories/_components/form";
import { revalidatePath } from "next/cache";

export default async function CreateCategoryPage() {
  return (
    <div>
      <Breadcrumb pageName="Category" />
      <Form />
    </div>
  );
}
