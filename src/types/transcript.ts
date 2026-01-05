// FILE: src/types/transcript.ts
import { ObjectId } from "mongodb";

export interface Transcript {
  _id?: ObjectId;
  userId: string | ObjectId;
  fileName: string;
  recommendationType: 'course' | 'career';
  
  fileUrl: string;       
  filePublicId?: string; 
  
  // TAMBAHKAN BARIS INI (Tanda tanya ? artinya opsional)
  fileData?: string; 

  recommendations?: any;
  createdAt: Date;
  updatedAt?: Date;
}