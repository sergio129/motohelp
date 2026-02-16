import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const pathname = request.nextUrl.pathname;

  // Rutas que requieren autenticación
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/sign-in", request.url));
    }

    const userRole = token.role as string;

    // Validar que el usuario acceda solo a su propio dashboard según su rol
    if (pathname.startsWith("/dashboard/client") && userRole !== "CLIENT") {
      return NextResponse.redirect(new URL(`/dashboard/${userRole.toLowerCase()}`, request.url));
    }

    if (pathname.startsWith("/dashboard/mechanic") && userRole !== "MECHANIC") {
      return NextResponse.redirect(new URL(`/dashboard/${userRole.toLowerCase()}`, request.url));
    }

    if (pathname.startsWith("/dashboard/admin") && userRole !== "ADMIN") {
      return NextResponse.redirect(new URL(`/dashboard/${userRole.toLowerCase()}`, request.url));
    }
  }

  // Redirigir /dashboard/ sin rol especificado al dashboard correcto
  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/sign-in", request.url));
    }
    const userRole = token.role as string;
    return NextResponse.redirect(new URL(`/dashboard/${userRole.toLowerCase()}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
