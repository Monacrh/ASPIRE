import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(request: NextRequest) {
  // 1. Ambil token dari cookies
  const token = request.cookies.get('session_token')?.value;

  // 2. Tentukan halaman yang ingin dilindungi
  // User mencoba akses dashboard atau result TANPA token
  if (!token) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  try {
    // 3. Verifikasi Token (apakah palsu atau expired?)
    await jwtVerify(token, SECRET_KEY);
    
    // Jika valid, izinkan lanjut
    return NextResponse.next();
  } catch (error) {
    // Jika token tidak valid/expired, tendang ke login
    console.log("Token invalid:", error);
    return NextResponse.redirect(new URL('/auth', request.url));
  }
}

// Konfigurasi: Middleware ini HANYA berjalan di rute berikut
export const config = {
  matcher: [
    '/dashboard/:path*', // Lindungi dashboard dan sub-halamannya
    '/result/:path*',    // Lindungi halaman result
  ],
};