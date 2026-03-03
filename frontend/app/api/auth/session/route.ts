import { type NextRequest, NextResponse } from "next/server";

const COOKIE_OPTS = {
  httpOnly: true,
  secure: true,
  sameSite: "lax" as const,
  maxAge: 86400,
  path: "/",
};

export async function POST(req: NextRequest) {
  const { role } = (await req.json()) as { role: string };
  const res = NextResponse.json({ ok: true });
  res.cookies.set("session", "1", COOKIE_OPTS);
  res.cookies.set("role", role, COOKIE_OPTS);
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete("session");
  res.cookies.delete("role");
  return res;
}
