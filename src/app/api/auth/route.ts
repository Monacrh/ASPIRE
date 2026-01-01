import { NextResponse } from 'next/server';
import clientPromise from '@/src/lib/mongodb';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose'; // Import jose
import { cookies } from 'next/headers'; // Import cookies
import { User } from '@/src/types/user';

const MONGODB_COLLECTION = 'users';
const DB_NAME = 'aspire_db';
const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'rahasia-super-aman-aspire-2024'); // Ganti dengan ENV di production

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, email, password, fullName } = body;

    if (action === 'logout') {
      const cookieStore = await cookies();
      cookieStore.delete('session_token'); // Hapus cookie
      return NextResponse.json({ message: 'Logout berhasil' }, { status: 200 });
    }

    if (!email || !password) {
      return NextResponse.json({ message: 'Email dan password wajib diisi' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const usersCollection = db.collection<User>(MONGODB_COLLECTION);

    let user: User | null = null;
    let userId: any;

    // --- LOGIKA REGISTER ---
    if (action === 'register') {
      if (!fullName) return NextResponse.json({ message: 'Nama lengkap wajib diisi' }, { status: 400 });
      if (password.length < 6) return NextResponse.json({ message: 'Password minimal 6 karakter' }, { status: 400 });

      const existingUser = await usersCollection.findOne({ email });
      if (existingUser) return NextResponse.json({ message: 'Email sudah terdaftar' }, { status: 409 });

      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await usersCollection.insertOne({
        fullName,
        email,
        password: hashedPassword,
        createdAt: new Date(),
      } as any);

      userId = result.insertedId;
      // Fetch user yang baru dibuat untuk payload
      user = { _id: userId, fullName, email, password: hashedPassword, createdAt: new Date() };
    }

    // --- LOGIKA LOGIN ---
    else if (action === 'login') {
      user = await usersCollection.findOne({ email });
      if (!user) return NextResponse.json({ message: 'Email atau password salah' }, { status: 401 });

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) return NextResponse.json({ message: 'Email atau password salah' }, { status: 401 });
    } 
    
    else {
      return NextResponse.json({ message: 'Action tidak valid' }, { status: 400 });
    }

    // --- PEMBUATAN SESSION (TOKEN) ---
    if (user) {
      // 1. Buat JWT Token
      const token = await new SignJWT({ 
        userId: user._id.toString(), 
        email: user.email, 
        fullName: user.fullName 
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('24h') // Token berlaku 24 jam
        .sign(SECRET_KEY);

      // 2. Simpan ke Cookies (HttpOnly agar tidak bisa dibaca JS browser)
      const cookieStore = await cookies();
      cookieStore.set('session_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 24 jam
        path: '/',
      });

      return NextResponse.json({
        message: action === 'register' ? 'Registrasi berhasil' : 'Login berhasil',
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
        },
      }, { status: 200 });
    }

  } catch (error) {
    console.error('Auth API Error:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan server internal' }, { status: 500 });
  }
}