import { NextResponse } from "next/server";
import { createUser, getUserId, createSession, setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  const { username, password } = await request.json();

  if (!username || !password) {
    return NextResponse.json({ error: "Username e password sono obbligatori." }, { status: 400 });
  }
  if (username.length < 3) {
    return NextResponse.json({ error: "Lo username deve avere almeno 3 caratteri." }, { status: 400 });
  }
  if (password.length < 4) {
    return NextResponse.json({ error: "La password deve avere almeno 4 caratteri." }, { status: 400 });
  }

  const result = createUser(username, password);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }

  const userId = getUserId(username);
  if (userId) {
    const token = createSession(username, userId);
    await setSessionCookie(token);
  }

  return NextResponse.json({ success: true });
}
