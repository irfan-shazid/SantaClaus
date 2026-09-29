import { randomUUID } from "node:crypto";
import { v2 as cloudinary, type UploadApiOptions, type UploadApiResponse } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Two upload modes:
 *
 * - Signed (preferred): uses the API key/secret. Requires the key to have the
 *   "create" permission - a read-only key returns 403 with
 *   `missing permissions (actions=["create"])`.
 * - Unsigned: used when CLOUDINARY_UPLOAD_PRESET is set, which works with a
 *   read-only key because the preset authorises the upload instead.
 *
 * Either way the upload happens server-side behind the admin-only route, so the
 * preset name is never exposed to the browser.
 */
const UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET?.trim() || null;

/**
 * Unsigned uploads don't get Cloudinary's automatic unique naming here - a
 * streamed upload with no filename lands on the fixed public id "file", so
 * every image would overwrite the last one. Always supply our own id.
 */
function uniqueId() {
  return randomUUID();
}

export async function uploadImageFromBuffer(buffer: Buffer, folder: string) {
  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    const handle = (error: unknown, res?: UploadApiResponse) =>
      error || !res ? reject(error ?? new Error("Upload failed")) : resolve(res);

    const stream = UPLOAD_PRESET
      ? cloudinary.uploader.unsigned_upload_stream(
          UPLOAD_PRESET,
          { folder, public_id: uniqueId(), resource_type: "image" },
          handle
        )
      : cloudinary.uploader.upload_stream({ folder, resource_type: "image" }, handle);

    stream.end(buffer);
  });
  return result.secure_url;
}

export async function uploadImageFromUrl(url: string, folder: string) {
  const options: UploadApiOptions = { folder, resource_type: "image" };
  const result = UPLOAD_PRESET
    ? await cloudinary.uploader.unsigned_upload(url, UPLOAD_PRESET, { ...options, public_id: uniqueId() })
    : await cloudinary.uploader.upload(url, options);
  return result.secure_url;
}

export { cloudinary };
