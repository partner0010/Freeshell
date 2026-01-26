import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization");
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get("page") || "1";
    const page_size = searchParams.get("page_size") || "20";
    const is_active = searchParams.get("is_active");

    const params = new URLSearchParams();
    params.append("page", page);
    params.append("page_size", page_size);
    if (is_active) params.append("is_active", is_active);

    const response = await fetch(`${BACKEND_URL}/api/coupon/list?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: token } : {}),
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Coupon list API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch coupons" },
      { status: 500 }
    );
  }
}
