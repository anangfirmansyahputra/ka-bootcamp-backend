import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard Ecommerce",
  description: "Saya jawa",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DefaultLayout>{children}</DefaultLayout>;
}
