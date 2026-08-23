import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { uploadImageFromBuffer, uploadImageFromUrl } from "@/lib/cloudinary";
import { checkRateLimit, uploadLimiter, getClientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { success } = await checkRateLimit(uploadLimiter, `upload:${getClientIp(req)}`);
  if (!success) {
    return NextResponse.json({ error: "Too many uploads, slow down." }, { status: 429 });
  }

  const contentType = req.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("application/json")) {
      const { url } = (await req.json()) as { url?: string };
      if (!url || !/^https?:\/\//.test(url)) {
        return NextResponse.json({ error: "A valid image URL is required" }, { status: 400 });
      }
      const secureUrl = await uploadImageFromUrl(url, "santa-claus");
      return NextResponse.json({ url: secureUrl });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: "Image must be under 8MB" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const secureUrl = await uploadImageFromBuffer(buffer, "santa-claus");
    return NextResponse.json({ url: secureUrl });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
