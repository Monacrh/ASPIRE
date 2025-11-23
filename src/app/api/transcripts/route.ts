import { NextResponse } from 'next/server';
import clientPromise from '@/src/lib/mongodb';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { Transcript } from '@/src/types/transcript';

const DB_NAME = 'aspire_db';
const COLLECTION_NAME = 'transcripts';
const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'rahasia-super-aman-aspire-2024');

// Helper: Ambil User ID dari Token
async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload.userId as string;
  } catch (error) {
    return null;
  }
}

// 1. GET ALL TRANSCRIPTS (Milik User yang Login)
export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    
    // Ambil data transcript milik user ini saja, urutkan dari yang terbaru
    const transcripts = await db
      .collection<Transcript>(COLLECTION_NAME)
      .find({ userId }) 
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ data: transcripts }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch transcripts' }, { status: 500 });
  }
}

// 2. POST TRANSCRIPT (Upload Baru)
export async function POST(req: Request) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    // Ambil FormData (File + Type)
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as 'course' | 'career';

    if (!file || !type) {
      return NextResponse.json({ message: 'File and type are required' }, { status: 400 });
    }

    // Konversi File ke Buffer/Base64 (Simpan sederhana untuk demo)
    // *Catatan: Untuk produksi, sebaiknya upload ke AWS S3 / Vercel Blob
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileBase64 = buffer.toString('base64');

    const newTranscript: Transcript = {
      userId,
      fileName: file.name,
      recommendationType: type,
      fileData: fileBase64, // Simpan konten file (hati-hati batas size MongoDB 16MB)
      createdAt: new Date(),
    };

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const result = await db.collection<Transcript>(COLLECTION_NAME).insertOne(newTranscript as any);

    return NextResponse.json({ 
      message: 'Transcript uploaded successfully', 
      id: result.insertedId 
    }, { status: 201 });

  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}