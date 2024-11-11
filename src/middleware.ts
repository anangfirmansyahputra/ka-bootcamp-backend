import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function middleware(request: NextRequest) {
  const token = cookies().get("token")?.value;
  // const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
