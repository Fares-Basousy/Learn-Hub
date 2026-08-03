import { NextResponse } from "next/server";
import { auth } from "@/auth";

const PROTECTED_PATHS = [
  "/dashboard",
  "/organizations",
  "/sales-index",
  "/students",
  "/timetable-edit",
  "/news-edit",
];

export default auth((req) => {
  const isAuthed = !!req.auth;
  const { pathname } = req.nextUrl;

  if (PROTECTED_PATHS.some((p) => pathname.startsWith(p)) && !isAuthed) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (pathname === "/login" && isAuthed) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/organizations/:path*",
    "/sales-index/:path*",
    "/students/:path*",
    "/timetable-edit/:path*",
    "/news-edit/:path*",
    "/login",
  ],
};
