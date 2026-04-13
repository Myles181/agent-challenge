import { NextRequest, NextResponse } from "next/server";

const elizaUrl =
  process.env.ELIZA_BASE_URL ||
  process.env.NEXT_PUBLIC_ELIZA_URL ||
  "http://localhost:3002";

async function proxyRequest(req: NextRequest, method: string, context: { params: Promise<{ path: string[] }> }) {
  const params = await context.params;
  const path = params.path.join("/");

  const headers: Record<string, string> = { "Content-Type": "application/json" };

  const init: RequestInit = { method, headers };
  if (method !== "GET" && method !== "HEAD") {
    init.body = await req.text();
  }

  try {
    const res = await fetch(`${elizaUrl}/${path}`, init);

    if (!res.ok) {
      console.error(`ElizaOS error (${res.status}): ${res.statusText} for ${path}`);
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }
    const text = await res.text();
    return new NextResponse(text, { status: res.status });
  } catch (error) {
    console.error("Fetch to ElizaOS failed:", error);
    return NextResponse.json({ error: "Failed to connect to ElizaOS" }, { status: 500 });
  }
}

export async function GET(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, "GET", context);
}

export async function POST(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, "POST", context);
}

export async function PUT(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, "PUT", context);
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, "DELETE", context);
}
