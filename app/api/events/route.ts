import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
      api_key: process.env.CLOUDINARY_API_KEY!,
      api_secret: process.env.CLOUDINARY_API_SECRET!,
    });

    const formData = await req.formData();

    /* ---------- Validate image ---------- */
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json(
        { message: "Image file is required" },
        { status: 400 }
      );
    }

    /* ---------- Safe JSON parsing ---------- */
    let tags: string[] = [];
    let agenda: string[] = [];

    try {
      tags = JSON.parse((formData.get("tags") as string) || "[]");
      agenda = JSON.parse((formData.get("agenda") as string) || "[]");
    } catch {
      return NextResponse.json(
        { message: "Invalid JSON in tags or agenda" },
        { status: 400 }
      );
    }

    /* ---------- Upload to Cloudinary ---------- */
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise<{ secure_url: string }>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            { resource_type: "image", folder: "DevEvent" },
            (error, result) => {
              if (error || !result) return reject(error);
              resolve({ secure_url: result.secure_url });
            }
          )
          .end(buffer);
      }
    );

    /* ---------- Save event ---------- */
    const createdEvent = await Event.create({
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      overview: formData.get("overview") as string,
      venue: formData.get("venue") as string,
      location: formData.get("location") as string,
      date: formData.get("date") as string,
      time: formData.get("time") as string,
      mode: formData.get("mode") as string,
      audience: formData.get("audience") as string,
      organizer: formData.get("organizer") as string,
      image: uploadResult.secure_url,
      tags,
      agenda,
    });

    return NextResponse.json(
      { message: "Event created successfully", event: createdEvent },
      { status: 201 }
    );
  } catch (e) {
    console.error("POST /api/events error:", e);

    return NextResponse.json(
      {
        message: "Event Creation Failed",
        error: e instanceof Error ? e.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();

    const events = await Event.find().sort({ createdAt: -1 });

    return NextResponse.json(
      { message: "Events fetched successfully", events },
      { status: 200 }
    );
  } catch (e) {
    console.error("GET /api/events error:", e);

    return NextResponse.json(
      { message: "Event fetching failed", error: e },
      { status: 500 }
    );
  }
}