import { ObjectId } from "mongodb";

export interface Transcript {
  _id?: ObjectId;
  userId: string | ObjectId; // Relasi ke User
  fileName: string;
  recommendationType: 'course' | 'career'; // Tipe rekomendasi yang dipilih
  fileData?: string; // Bisa diisi Base64 atau text content (jika file kecil)
  createdAt: Date;
}