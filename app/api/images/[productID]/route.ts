import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

const s3 = new S3Client({
  region: process.env.NEXT_PUBLIC_S3_REGION,
  // credentials are optional here if you're using env vars / IAM role
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET(
  _req: Request,
  context: { params: Promise<{ productID: string }> }
) {
  try {
    const { productID } = await context.params;

    const command = new GetObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
      Key: `product-images/${productID}.jpg`,
    });

    const result = await s3.send(command);

    if (!result.Body) {
      return new NextResponse("Image not found", { status: 404 });
    }

    return new NextResponse(result.Body as ReadableStream, {
      status: 200,
      headers: {
        "Content-Type": result.ContentType || "image/jpeg",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.error("S3 image fetch failed:", err);
    return new NextResponse("Failed to fetch image", { status: 500 });
  }
}