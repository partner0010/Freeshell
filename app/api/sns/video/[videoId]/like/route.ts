import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(
  request: NextRequest,
  { params }: { params: { videoId: string } }
) {
  try {
    const token = request.headers.get("authorization");
    const { videoId } = params;

    const response = await fetch(
      `${BACKEND_URL}/api/sns/video/${videoId}/like`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: token } : {}),
        },
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Like API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to like video" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { videoId: string } }
) {
  try {
    const token = request.headers.get("authorization");
    const { videoId } = params;

    const response = await fetch(
      `${BACKEND_URL}/api/sns/video/${videoId}/like`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: token } : {}),
        },
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Unlike API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to unlike video" },
      { status: 500 }
    );
  }
}
