import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";

/**
 * GET /api/events/[slug]
 * Fetch a single event by slug
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }  // ✅ Promise type
): Promise<NextResponse> {
  try {
    await connectDB();

    const { slug } = await params;  // ✅ await it

    if (!slug || slug.trim() === "") {
      return NextResponse.json(
        { message: "Invalid or missing slug parameter" },
        { status: 400 }
      );
    }

    const sanitizedSlug = slug.trim().toLowerCase();

    const event = await Event.findOne({ slug: sanitizedSlug }).lean();

    if (!event) {
      return NextResponse.json(
        { message: `Event with slug '${sanitizedSlug}' not found` },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Event fetched successfully", event },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/events/[slug] error:", error);

    return NextResponse.json(
      { message: "Failed to fetch event" },
      { status: 500 }
    );
  }
}