import { NextResponse } from 'next/server';
import clientPromise from '@/src/lib/mongodb';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { Transcript } from '@/src/types/transcript';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const DB_NAME = 'aspire_db';
const COLLECTION_NAME = 'transcripts';
const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET);

// Helper: Ambil User ID
async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload.userId as string;
  } catch (error) { return null; }
}

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    
    const transcripts = await db
      .collection<Transcript>(COLLECTION_NAME)
      .find({ userId }) 
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ data: transcripts }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed' }, { status: 500 });
  }
}

// POST: UPLOAD KE CLOUDINARY
export async function POST(req: Request) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as 'course' | 'career';

    if (!file || !type) return NextResponse.json({ message: 'Missing data' }, { status: 400 });

    console.log("📤 Uploading file:", file.name);

    // 1. Ubah File menjadi Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 2. PENTING: Gunakan 'raw' untuk SEMUA file (PDF dan gambar)
    // Kenapa? Karena 'image' di Cloudinary akan transformasi file,
    // sedangkan kita butuh file original untuk AI processing
    const resourceType = 'raw';

    console.log("🔧 Using resource_type:", resourceType);
    console.log("🔧 File type:", file.type);

    // 3. Upload ke Cloudinary dengan konfigurasi yang benar
    const uploadResult: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'aspire_transcripts',
          resource_type: resourceType, // ✅ Selalu 'raw' untuk dokumen
          type: 'upload',               // ✅ Pastikan ini 'upload', bukan 'private'
          access_mode: 'public',        // ✅ Set sebagai public
          use_filename: true,           // ✅ Pertahankan nama file asli
          unique_filename: true,        // ✅ Tambahkan suffix unik
        },
        (error, result) => {
          if (error) {
            console.error("❌ Cloudinary Upload Error:", error);
            reject(error);
          } else {
            console.log("✅ Upload Success:", result?.public_id);
            resolve(result);
          }
        }
      );
      uploadStream.end(buffer);
    });

    // 4. DEBUGGING - Pastikan public_id benar
    console.log("📋 Upload Result:");
    console.log("  - public_id:", uploadResult.public_id);
    console.log("  - secure_url:", uploadResult.secure_url);
    console.log("  - resource_type:", uploadResult.resource_type);

    // 5. Simpan ke MongoDB dengan public_id yang benar
    const newTranscript: Transcript = {
      userId,
      fileName: file.name,
      recommendationType: type,
      fileUrl: uploadResult.secure_url,
      filePublicId: uploadResult.public_id, // ✅ Pastikan ini dari uploadResult
      createdAt: new Date(),
    };

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const result = await db.collection<Transcript>(COLLECTION_NAME).insertOne(newTranscript as any);

    console.log("✅ Saved to MongoDB with ID:", result.insertedId);

    return NextResponse.json({ 
      message: 'Uploaded successfully', 
      id: result.insertedId,
      publicId: uploadResult.public_id, // Return untuk debugging
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Upload Error:', error);
    return NextResponse.json({ 
      message: 'Internal Server Error',
      error: error.message 
    }, { status: 500 });
  }
}