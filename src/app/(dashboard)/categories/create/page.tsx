import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Form from "@/app/(dashboard)/categories/_components/form";

export default async function CreateCategoryPage() {
  return (
    <div>
      <Breadcrumb pageName="Category" />
      <Form />
    </div>
  );
}
