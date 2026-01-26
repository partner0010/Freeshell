import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get("limit") || "20";
    const time_window = searchParams.get("time_window") || "7";

    const response = await fetch(
      `${BACKEND_URL}/api/recommendation/trending?limit=${limit}&time_window=${time_window}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Trending API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch trending videos" },
      { status: 500 }
    );
  }
}
