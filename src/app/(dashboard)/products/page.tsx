import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import prisma from "@/lib/prisma";
import { Product } from "@/types/product";
import Image from "next/image";
import React from "react";

export default async function ProductPage() {
  const products = await prisma.product.findMany({
    include: {
      category: true,
      colors: true,
    },
  });

  console.log(products);

  return (
    <div>
      <Breadcrumb pageName="Product" />
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="px-4 py-6 md:px-6 xl:px-7.5">
          <h4 className="text-xl font-semibold text-black dark:text-white">
            Top Products
          </h4>
        </div>

        <div className="grid grid-cols-6 border-t border-stroke px-4 py-4.5 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5">
          <div className="col-span-3 flex items-center">
            <p className="font-medium">Product Name</p>
          </div>
          <div className="col-span-2 hidden items-center sm:flex">
            <p className="font-medium">Category</p>
          </div>
          <div className="col-span-1 flex items-center">
            <p className="font-medium">Price</p>
          </div>
          <div className="col-span-1 flex items-center">
            <p className="font-medium">Color</p>
          </div>
          <div className="col-span-1 flex items-center">
            <p className="font-medium">Action</p>
          </div>
        </div>

        {products.map((product, key) => (
          <div
            className="grid grid-cols-6 border-t border-stroke px-4 py-4.5 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5"
            key={key}
          >
            <div className="col-span-3 flex items-center">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="h-12.5 w-15 rounded-md">
                  <Image
                    src={
                      "https://www.greenscene.co.id/wp-content/uploads/2024/08/kamen-rider-gavv-4-1200x675.jpg"
                    }
                    // src={(product.images as string[])[0]}
                    width={60}
                    height={50}
                    alt="Product"
                  />
                </div>
                <p className="text-sm text-black dark:text-white">
                  {product.name}
                </p>
              </div>
            </div>
            <div className="col-span-2 hidden items-center sm:flex">
              <p className="text-sm text-black dark:text-white">
                {product.category.name}
              </p>
            </div>
            <div className="col-span-1 flex items-center">
              <p className="text-sm text-black dark:text-white">
                ${product.price}
              </p>
            </div>
            <div className="col-span-1 flex items-center">
              <div className="flex gap-2">
                {product.colors.map((color) => (
                  <div
                    key={color.id}
                    style={{
                      backgroundColor: color.color,
                      height: "20px",
                      width: "20px",
                      borderRadius: "50%",
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="col-span-1 flex items-center">
              <p className="text-sm text-meta-3">
                {/* ${product.profit} */}
                test
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
