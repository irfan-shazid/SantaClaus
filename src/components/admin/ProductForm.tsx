"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { toast } from "sonner";
import ImageUploader from "./ImageUploader";

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  images: string[];
  variants: string[];
  stock: number;
  type: "CLOTHING" | "TOY";
  featured: boolean;
  isUpcoming: boolean;
  categoryId: string;
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function ProductForm({ categories, existing }: { categories: Category[]; existing?: Product }) {
  const router = useRouter();
  const [name, setName] = useState(existing?.name ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [price, setPrice] = useState(existing?.price?.toString() ?? "");
  const [images, setImages] = useState<string[]>(existing?.images ?? []);
  const [variantInput, setVariantInput] = useState("");
  const [variants, setVariants] = useState<string[]>(existing?.variants ?? []);
  const [stock, setStock] = useState(existing?.stock?.toString() ?? "0");
  const [type, setType] = useState<"CLOTHING" | "TOY">(existing?.type ?? "CLOTHING");
  const [featured, setFeatured] = useState(existing?.featured ?? false);
  const [isUpcoming, setIsUpcoming] = useState(existing?.isUpcoming ?? false);
  const [categoryId, setCategoryId] = useState(existing?.categoryId ?? categories[0]?.id ?? "");
  const [saving, setSaving] = useState(false);

  function addVariant() {
    const v = variantInput.trim();
    if (v && !variants.includes(v)) setVariants([...variants, v]);
    setVariantInput("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (images.length === 0) {
      toast.error("Please add at least one product image.");
      return;
    }
    if (!categoryId) {
      toast.error("Please select a category.");
      return;
    }
    setSaving(true);
    const payload = {
      name,
      slug: slugify(name),
      description,
      price: Number(price),
      images,
      variants,
      stock: Number(stock),
      type,
      featured,
      isUpcoming,
      categoryId,
    };
    const res = await fetch(existing ? `/api/products/${existing.id}` : "/api/products", {
      method: existing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      toast.error(typeof data.error === "string" ? data.error : "Could not save product.");
      return;
    }
    toast.success("Product saved.");
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
      <div>
        <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-fuchsia-400"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Description</label>
        <textarea
          required
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-fuchsia-400"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Price (Tk)</label>
          <input
            required
            type="number"
            min={1}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-fuchsia-400"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Stock</label>
          <input
            required
            type="number"
            min={0}
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-fuchsia-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "CLOTHING" | "TOY")}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-fuchsia-400"
          >
            <option value="CLOTHING">Clothing</option>
            <option value="TOY">Toy</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Category</label>
          <select
            required
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-fuchsia-400"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
          Variants (size / color) — optional
        </label>
        <div className="flex flex-wrap gap-2">
          {variants.map((v) => (
            <span key={v} className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {v}
              <button type="button" onClick={() => setVariants(variants.filter((x) => x !== v))}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <input
            value={variantInput}
            onChange={(e) => setVariantInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addVariant();
              }
            }}
            placeholder="e.g. 2-3Y, Red"
            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-fuchsia-400"
          />
          <button type="button" onClick={addVariant} className="rounded-xl bg-slate-800 px-3 py-2 text-sm font-semibold text-white">
            Add
          </button>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Images</label>
        <ImageUploader images={images} onChange={setImages} max={6} />
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
        <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
        Show in featured picks on homepage
      </label>

      <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
        <input type="checkbox" checked={isUpcoming} onChange={(e) => setIsUpcoming(e.target.checked)} />
        Publish as an Upcoming product (hidden from shop; users can wishlist it)
      </label>

      <button
        type="submit"
        disabled={saving}
        className="rounded-full bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save product"}
      </button>
    </form>
  );
}
