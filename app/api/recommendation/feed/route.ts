import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization");
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get("limit") || "20";

    const response = await fetch(
      `${BACKEND_URL}/api/recommendation/feed?limit=${limit}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: token } : {}),
        },
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Feed API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch feed" },
      { status: 500 }
    );
  }
}
