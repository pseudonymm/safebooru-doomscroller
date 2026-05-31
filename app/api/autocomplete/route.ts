import { NextRequest, NextResponse } from "next/server";

const URL = "https://safebooru.org/autocomplete.php";

export async function POST(req: NextRequest) {
  const { q } = await req.json();
  const res = await fetch(`${URL}?${new URLSearchParams({ q })}`);
  if (!res.ok) return NextResponse.json({ error: "upstream error" }, { status: res.status });
  const text = await res.text();
  if (!text.trim()) return NextResponse.json([]);
  try {
    return NextResponse.json(JSON.parse(text));
  } catch {
    return NextResponse.json([]);
  }
}
