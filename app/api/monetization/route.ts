import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization");
    const searchParams = request.nextUrl.searchParams;
    const endpoint = searchParams.get("endpoint") || "plan";

    const response = await fetch(`${BACKEND_URL}/api/monetization/${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: token } : {}),
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Monetization API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch monetization data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization");
    const body = await request.json();
    const searchParams = request.nextUrl.searchParams;
    const endpoint = searchParams.get("endpoint") || "subscribe";

    const response = await fetch(`${BACKEND_URL}/api/monetization/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: token } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Monetization API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process monetization request" },
      { status: 500 }
    );
  }
}
