import prisma from "@/lib/prisma";

export default async function UsersPage() {
  const users = await prisma.user.findMany({});

  return <div></div>;
}
