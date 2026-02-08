import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  const users = db.prepare("SELECT id, username, created_at FROM users ORDER BY created_at DESC").all();
  return NextResponse.json(users);
}
