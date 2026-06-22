import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";

export async function POST(req: NextRequest) {
  try {
    console.log("=================================");
    console.log("EVENT CREATION STARTED");
    console.log("=================================");

    await connectDB();
    console.log("1. MongoDB Connected");

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
      api_key: process.env.CLOUDINARY_API_KEY!,
      api_secret: process.env.CLOUDINARY_API_SECRET!,
    });

    console.log({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
    });

    const result = await cloudinary.api.ping();
    console.log(result);

    const formData = await req.formData();
    console.log("2. FormData Parsed");

    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json(
        { message: "Image file is required" },
        { status: 400 }
      );
    }

    console.log("3. File Found:", file.name);

    let tags: string[] = [];
    let agenda: string[] = [];

    try {
      tags = JSON.parse((formData.get("tags") as string) || "[]");
      agenda = JSON.parse((formData.get("agenda") as string) || "[]");
    } catch (error) {
      console.error("JSON Parse Error:", error);

      return NextResponse.json(
        {
          message: "Invalid JSON in tags or agenda",
        },
        { status: 400 }
      );
    }

    console.log("4. Tags:", tags);
    console.log("5. Agenda:", agenda);

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const overview = formData.get("overview") as string;
    const venue = formData.get("venue") as string;
    const location = formData.get("location") as string;
    const date = formData.get("date") as string;
    const time = formData.get("time") as string;
    const mode = formData.get("mode") as string;
    const audience = formData.get("audience") as string;
    const organizer = formData.get("organizer") as string;

    console.log("6. Event Data:", {
      title,
      venue,
      location,
      date,
      time,
      mode,
      audience,
      organizer,
    });

    console.log("7. Uploading Image to Cloudinary...");

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise<{ secure_url: string }>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              resource_type: "image",
              folder: "DevEvent",
            },
            (error, result) => {
              if (error || !result) {
                return reject(error);
              }

              resolve({
                secure_url: result.secure_url,
              });
            }
          )
          .end(buffer);
      }
    );

    console.log(
      "8. Cloudinary Upload Success:",
      uploadResult.secure_url
    );

    console.log("9. Creating Event Document...");

    const createdEvent = await Event.create({
      title,
      description,
      overview,
      venue,
      location,
      date,
      time,
      mode,
      audience,
      organizer,
      image: uploadResult.secure_url,
      tags,
      agenda,
    });

    console.log("10. Event Created Successfully");
    console.log(createdEvent._id);

    return NextResponse.json(
      {
        message: "Event created successfully",
        event: createdEvent,
      },
      { status: 201 }
    );
  } catch (e: any) {
    console.error("=================================");
    console.error("EVENT CREATION ERROR");
    console.error("=================================");

    console.error("Name:", e?.name);
    console.error("Message:", e?.message);

    if (e?.errors) {
      console.error("Validation Errors:");
      console.error(e.errors);
    }

    console.error("Full Error:", e);

    return NextResponse.json(
      {
        message: "Event Creation Failed",
        error: e?.message || String(e),
        validationErrors: e?.errors || null,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();

    const events = await Event.find().sort({
      createdAt: -1,
    });

    return NextResponse.json(
      {
        message: "Events fetched successfully",
        events,
      },
      { status: 200 }
    );
  } catch (e) {
    console.error("GET /api/events error:", e);

    return NextResponse.json(
      {
        message: "Event fetching failed",
        error: e,
      },
      { status: 500 }
    );
  }
}