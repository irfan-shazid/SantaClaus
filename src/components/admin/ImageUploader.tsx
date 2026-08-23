"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { uploadFile, uploadFromUrl } from "@/lib/upload-client";

interface Props {
  images: string[];
  onChange: (images: string[]) => void;
  max?: number;
}

export default function ImageUploader({ images, onChange, max = 6 }: Props) {
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file);
      onChange([...images, url]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleUrlAdd() {
    if (!urlInput.trim()) return;
    setUploading(true);
    try {
      const url = await uploadFromUrl(urlInput.trim());
      onChange([...images, url]);
      setUrlInput("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function removeImage(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {images.map((img, i) => (
          <div key={img + i} className="relative h-20 w-20 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200">
            <Image src={img} alt="" fill sizes="80px" className="object-cover" />
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="absolute right-0.5 top-0.5 rounded-full bg-slate-900/70 p-0.5 text-white"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {images.length < max && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-300 text-slate-400 hover:border-fuchsia-400 hover:text-fuchsia-500"
          >
            {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
            <span className="text-[10px] font-semibold">Upload</span>
          </button>
        )}
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

      <div className="mt-3 flex gap-2">
        <input
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="Paste an image URL"
          className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-fuchsia-400"
        />
        <button
          type="button"
          onClick={handleUrlAdd}
          disabled={uploading || !urlInput.trim()}
          className="rounded-xl bg-slate-800 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          Add
        </button>
      </div>
    </div>
  );
}
