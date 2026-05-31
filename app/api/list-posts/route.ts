import { NextRequest, NextResponse } from "next/server";

const BASE = "https://safebooru.org/index.php";

export async function POST(req: NextRequest) {
  const params = await req.json();
  const qs = new URLSearchParams(
    Object.fromEntries(
      Object.entries({ page: "dapi", s: "post", q: "index", ...params, json: 1 })
        .filter(([, v]) => v != null)
        .map(([k, v]) => [k, String(v)])
    )
  );
  const res = await fetch(`${BASE}?${qs}`);
  if (!res.ok) return NextResponse.json({ error: res.statusText }, { status: res.status });
  const text = await res.text();
  if (!text.trim()) return NextResponse.json([]);
  try {
    const data = JSON.parse(text);
    return NextResponse.json(Array.isArray(data) ? data : []);
  } catch {
    return NextResponse.json([]);
  }
}
