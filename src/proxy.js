import { NextResponse } from "next/server";
import { unsealData } from "iron-session";

export async function proxy(request) {
  const cookie = request.cookies.get("portal_session")?.value;
  if (cookie && process.env.AUTH_SECRET) {
    const session = await unsealData(cookie, {
      password: process.env.AUTH_SECRET,
      ttl: 43200,
    });
    if (session.uid) return NextResponse.next();
  }
  const login = new URL("/login", request.url);
  login.searchParams.set(
    "next",
    request.nextUrl.pathname + request.nextUrl.search,
  );
  return NextResponse.redirect(login);
}
export const config = {
  matcher: ["/assistant", "/dashboard", "/profile", "/complaints/:path*"],
};
