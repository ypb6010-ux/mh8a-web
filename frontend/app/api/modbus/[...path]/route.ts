import { NextRequest, NextResponse } from "next/server";

const TARGET = process.env.NEXT_PUBLIC_BACKEND_ORIGIN || "http://localhost:8088";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  const url = `${TARGET}/api/${params.path.join("/")}${req.nextUrl.search}`;
  const res = await fetch(url, { headers: { "Content-Type": "application/json" } });
  const body = await res.text();
  return NextResponse.json(body ? JSON.parse(body) : {}, { status: res.status });
}

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  const url = `${TARGET}/api/${params.path.join("/")}${req.nextUrl.search}`;
  const init: RequestInit = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: await req.text(),
  };
  const res = await fetch(url, init);
  const body = await res.text();
  return NextResponse.json(body ? JSON.parse(body) : {}, { status: res.status });
}
