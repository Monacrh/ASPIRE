import React from 'react';
import RetroSidebar from '../components/sidebar';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import clientPromise from '@/src/lib/mongodb';
import { ObjectId } from 'mongodb';

// --- Helper: Ambil User dari Session Token ---
async function getUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (!token) return null;

    const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, SECRET_KEY);
    const userId = payload.userId as string;

    const client = await clientPromise;
    const db = client.db('aspire_db'); 
    
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(userId) },
      { projection: { fullName: 1, email: 1 } } 
    );

    if (user) {
      return {
        ...user,
        _id: user._id.toString(),
      };
    }
    return null;
  } catch (error) {
    console.error("Layout Auth Error:", error);
    return null;
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser();

  return (
    <div className="flex min-h-screen bg-[#FFF8DC] overflow-x-hidden">
      <RetroSidebar user={user} />
      
      {/* Main Content: Padding top ditambah (pt-20) di mobile agar tidak tertutup tombol menu */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen w-full pt-20 md:pt-8">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}