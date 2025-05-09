import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyAuth } from "./lib/auth"

// กำหนด routes ที่ไม่ต้องตรวจสอบสิทธิ์
const publicRoutes = [
  "/login",
  "/register",
  "/api/auth/login",
  "/api/auth/register",
  "/api/check-env",
  "/api/database/init",
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ตรวจสอบว่าเป็น route ที่ไม่ต้องตรวจสอบสิทธิ์หรือไม่
  if (
    publicRoutes.some((route) => pathname.startsWith(route)) ||
    pathname.startsWith("/_next") ||
    pathname.includes("/favicon.ico")
  ) {
    return NextResponse.next()
  }

  // สำหรับ OPTIONS request (CORS preflight)
  if (request.method === "OPTIONS") {
    return handleCors(request)
  }

  // ตรวจสอบสิทธิ์สำหรับ routes อื่นๆ
  try {
    const token = request.cookies.get("auth-token")?.value

    // ถ้าไม่มี token ให้ redirect ไปที่หน้า login
    if (!token) {
      const url = new URL("/login", request.url)
      return NextResponse.redirect(url)
    }

    // ตรวจสอบความถูกต้องของ token
    const verifyResult = await verifyAuth(token)

    if (verifyResult.success && verifyResult.authenticated) {
      const response = NextResponse.next()
      // เพิ่ม headers สำหรับ CORS
      if (pathname.startsWith("/api/")) {
        addCorsHeaders(response)
      }
      return response
    }

    // ถ้าตรวจสอบไม่ผ่าน ให้ redirect ไปที่หน้า login
    const url = new URL("/login", request.url)
    return NextResponse.redirect(url)
  } catch (error) {
    console.error("Middleware authentication error:", error)

    // ถ้าเกิดข้อผิดพลาดในการตรวจสอบสิทธิ์ ให้ redirect ไปที่หน้า login
    const url = new URL("/login", request.url)
    return NextResponse.redirect(url)
  }
}

// ฟังก์ชันสำหรับจัดการ CORS
function handleCors(request: NextRequest) {
  const response = new NextResponse(null, { status: 204 })
  addCorsHeaders(response)
  return response
}

// ฟังก์ชันสำหรับเพิ่ม CORS headers
function addCorsHeaders(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*")
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
  response.headers.set("Access-Control-Max-Age", "86400")
  return response
}

// ระบุ paths ที่ต้องการให้ middleware ทำงาน
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}

