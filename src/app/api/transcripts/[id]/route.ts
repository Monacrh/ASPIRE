import { NextResponse } from 'next/server';
import clientPromise from '@/src/lib/mongodb';
import { ObjectId } from 'mongodb';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { Transcript } from '@/src/types/transcript';

const DB_NAME = 'aspire_db';
const COLLECTION_NAME = 'transcripts';
const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'rahasia-super-aman-aspire-2024');

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  // Await params (Next.js 15/16 style)
  const { id } = await context.params;

  try {
    // Validasi ID
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid ID format' }, { status: 400 });
    }

    // Auth Check
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    
    const { payload } = await jwtVerify(token, SECRET_KEY);
    const userId = payload.userId as string;

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    // Cari Transcript berdasarkan ID DAN UserId (agar user tidak bisa intip punya orang lain)
    const transcript = await db.collection<Transcript>(COLLECTION_NAME).findOne({
      _id: new ObjectId(id),
      userId: userId 
    });

    if (!transcript) {
      return NextResponse.json({ message: 'Transcript not found' }, { status: 404 });
    }

    return NextResponse.json({ data: transcript }, { status: 200 });

  } catch (error) {
    console.error("Get By ID Error:", error);
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  try {
    // 1. Validasi ID
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid ID format' }, { status: 400 });
    }

    // 2. Auth Check (Pastikan user yang login yang menghapus)
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    
    const { payload } = await jwtVerify(token, SECRET_KEY);
    const userId = payload.userId as string;

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    // 3. Eksekusi Delete
    const result = await db.collection<Transcript>(COLLECTION_NAME).deleteOne({
      _id: new ObjectId(id),
      userId: userId // Security: Hanya hapus jika userId cocok
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Transcript not found or access denied' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}