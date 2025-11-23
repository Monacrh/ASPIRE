import { ObjectId } from "mongodb";

export interface User {
  _id: ObjectId;
  fullName: string;
  email: string;
  password: string; // Hashed password
  createdAt: Date;
}