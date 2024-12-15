import UpdateDeleteButton from "@/app/_components/update-delete-btn";
import { deleteCategory } from "@/app/action";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import prisma from "@/lib/prisma";
import dayjs from "dayjs";
import Link from "next/link";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany();
  console.log(categories);

  return (
    <div>
      <Breadcrumb pageName="Category" />

      <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="mb-5 flex items-center justify-end">
          <Link
            href={"/categories/create"}
            className="rounded-lg bg-primary px-7 py-3 text-white shadow-md transition-opacity hover:bg-primary/90"
          >
            Add Category
          </Link>
        </div>
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="min-w-[220px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                  Name
                </th>
                <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                  Created At
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category, key) => (
                <tr key={key}>
                  <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                    <h5 className="font-medium text-black dark:text-white">
                      {category.name}
                    </h5>
                    {/* <p className="text-sm">${category.name}</p> */}
                  </td>
                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    <p className="text-black dark:text-white">
                      {dayjs(category.createdAt).format("D MMMM YYYY")}
                    </p>
                  </td>

                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    <UpdateDeleteButton
                      url={`/categories/${category.id}`}
                      type="category"
                      id={category.id}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
