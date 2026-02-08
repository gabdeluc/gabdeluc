import { NextResponse } from "next/server";
import { verifyUser, getUserId, createSession, setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  const { username, password } = await request.json();

  if (!username || !password) {
    return NextResponse.json({ error: "Username e password sono obbligatori." }, { status: 400 });
  }

  const valid = verifyUser(username, password);
  if (!valid) {
    return NextResponse.json({ error: "Credenziali non valide." }, { status: 401 });
  }

  const userId = getUserId(username);
  if (!userId) {
    return NextResponse.json({ error: "Errore interno." }, { status: 500 });
  }

  const token = createSession(username, userId);
  await setSessionCookie(token);

  return NextResponse.json({ success: true });
}
