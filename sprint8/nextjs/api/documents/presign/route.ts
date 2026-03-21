import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase";

const Schema = z.object({
  filename: z.string().min(1).max(255),
  mimeType: z.enum([
    "application/pdf",
    "text/plain",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ]),
  sizeBytes: z.number().max(10 * 1024 * 1024), // 10MB max
});

/**
 * POST /api/documents/presign
 * Returns a presigned S3 URL for direct client upload.
 * After upload, client calls POST /api/documents/confirm.
 *
 * NOTE: Requires AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET in .env.local
 * For local development without S3, use the local upload route instead.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { filename, mimeType, sizeBytes } = parsed.data;

  // Check if S3 is configured
  const awsKey = process.env.AWS_ACCESS_KEY_ID;
  const awsSecret = process.env.AWS_SECRET_ACCESS_KEY;
  const bucket = process.env.S3_BUCKET;

  if (!awsKey || !awsSecret || !bucket) {
    // Return a flag so the client falls back to client-side parsing
    return NextResponse.json(
      { useClientSide: true, message: "S3 not configured — use client-side parsing" },
      { status: 200 }
    );
  }

  try {
    const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
    const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");

    const s3 = new S3Client({
      region: process.env.AWS_REGION ?? "ap-south-1",
      credentials: { accessKeyId: awsKey, secretAccessKey: awsSecret },
    });

    const key = `uploads/${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: mimeType,
      ContentLength: sizeBytes,
    });

    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 300 }); // 5 min

    return NextResponse.json({ presignedUrl, s3Key: key });
  } catch (err) {
    console.error("Presign error:", err);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/documents/confirm
 * Called after successful S3 upload.
 * Creates a DB record and triggers the Celery processing pipeline.
 */
export async function PUT(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.s3Key || !body?.filename) {
    return NextResponse.json({ error: "Missing s3Key or filename" }, { status: 400 });
  }

  const supabase = createServerClient();

  // Create document record in DB
  const { data: doc, error } = await supabase
    .from("documents")
    .insert({
      name: body.filename,
      original_filename: body.filename,
      mime_type: body.mimeType ?? "application/pdf",
      size_bytes: body.sizeBytes ?? 0,
      status: "uploading",
      s3_key: body.s3Key,
      is_preloaded: false,
      language: "en",
    })
    .select("id")
    .single();

  if (error || !doc) {
    return NextResponse.json({ error: "Failed to create document record" }, { status: 500 });
  }

  // Trigger Celery processing task via FastAPI backend
  const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8000";
  try {
    await fetch(`${backendUrl}/documents/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        document_id: doc.id,
        s3_key: body.s3Key,
        mime_type: body.mimeType,
        document_name: body.filename,
      }),
    });
  } catch {
    console.warn("Could not trigger backend processing — will process client-side");
  }

  return NextResponse.json({ documentId: doc.id });
}
