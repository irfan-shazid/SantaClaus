"use client";

import { useState } from "react";
import Image from "next/image";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import ImageUploader from "./ImageUploader";

interface Category {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  order: number;
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function CategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  function handleCreated(category: Category) {
    setCategories((prev) => [...prev, category].sort((a, b) => a.order - b.order));
    setShowForm(false);
  }

  function handleUpdated(category: Category) {
    setCategories((prev) => prev.map((c) => (c.id === category.id ? category : c)));
    setEditingId(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this category?")) return;
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Could not delete category.");
      return;
    }
    setCategories((prev) => prev.filter((c) => c.id !== id));
    toast.success("Category deleted.");
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-1.5 rounded-full bg-fuchsia-600 px-4 py-2 text-sm font-bold text-white"
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancel" : "Add category"}
        </button>
      </div>

      {showForm && (
        <div className="mb-5">
          <CategoryForm onSaved={handleCreated} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) =>
          editingId === cat.id ? (
            <div key={cat.id} className="sm:col-span-2 lg:col-span-3">
              <CategoryForm existing={cat} onSaved={handleUpdated} onCancel={() => setEditingId(null)} />
            </div>
          ) : (
            <div key={cat.id} className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-slate-100">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-slate-100">
                <Image src={cat.logoUrl} alt={cat.name} fill sizes="48px" className="object-cover" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">{cat.name}</p>
                <p className="text-xs text-slate-400">/{cat.slug}</p>
              </div>
              <button onClick={() => setEditingId(cat.id)} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100">
                <Pencil className="h-4 w-4" />
              </button>
              <button onClick={() => handleDelete(cat.id)} className="rounded-full p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}

function CategoryForm({
  existing,
  onSaved,
  onCancel,
}: {
  existing?: Category;
  onSaved: (c: Category) => void;
  onCancel?: () => void;
}) {
  const [name, setName] = useState(existing?.name ?? "");
  const [logo, setLogo] = useState<string[]>(existing?.logoUrl ? [existing.logoUrl] : []);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!logo[0]) {
      toast.error("Please add a category logo.");
      return;
    }
    setSaving(true);
    const payload = { name, slug: slugify(name), logoUrl: logo[0] };
    const res = await fetch(existing ? `/api/categories/${existing.id}` : "/api/categories", {
      method: existing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      toast.error(typeof data.error === "string" ? data.error : "Could not save category.");
      return;
    }
    toast.success("Category saved.");
    onSaved(data);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl bg-slate-50 p-4">
      <input
        required
        placeholder="Category name (e.g. Baby Boy)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-fuchsia-400"
      />
      <ImageUploader images={logo} onChange={setLogo} max={1} />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-fuchsia-600 px-5 py-2 text-sm font-bold text-white disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
