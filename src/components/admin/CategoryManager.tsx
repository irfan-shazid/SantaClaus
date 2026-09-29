"use client";

import { useState } from "react";
import Image from "next/image";
import { AlertTriangle, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import ImageUploader from "./ImageUploader";

interface Category {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  order: number;
  productCount: number;
}

type SavedCategory = Omit<Category, "productCount">;

const plural = (n: number) => `${n} product${n === 1 ? "" : "s"}`;

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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  function handleCreated(category: SavedCategory) {
    setCategories((prev) => [...prev, { ...category, productCount: 0 }].sort((a, b) => a.order - b.order));
    setShowForm(false);
  }

  function handleUpdated(category: SavedCategory) {
    // The API returns the category without its count; keep the one we have.
    setCategories((prev) => prev.map((c) => (c.id === category.id ? { ...c, ...category } : c)));
    setEditingId(null);
  }

  function handleDeleted(id: string, movedTo: string | null) {
    setCategories((prev) => {
      const removed = prev.find((c) => c.id === id);
      return prev
        .filter((c) => c.id !== id)
        .map((c) => (movedTo && c.id === movedTo && removed ? { ...c, productCount: c.productCount + removed.productCount } : c));
    });
    setDeletingId(null);
  }

  async function handleDeleteClick(cat: Category) {
    setEditingId(null);
    // Categories with products need a decision about those products first.
    if (cat.productCount > 0) {
      setDeletingId(cat.id);
      return;
    }
    if (!confirm(`Delete the "${cat.name}" category?`)) return;
    const res = await fetch(`/api/categories/${cat.id}`, { method: "DELETE" });
    const data = await res.json().catch(() => null);
    if (res.status === 409 && typeof data?.productCount === "number") {
      // Products were added since this page loaded - ask what to do with them.
      setCategories((prev) => prev.map((c) => (c.id === cat.id ? { ...c, productCount: data.productCount } : c)));
      setDeletingId(cat.id);
      return;
    }
    if (!res.ok) {
      toast.error(typeof data?.error === "string" ? data.error : "Could not delete category.");
      return;
    }
    handleDeleted(cat.id, null);
    toast.success("Category deleted.");
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-1.5 rounded-full bg-santa-600 px-4 py-2 text-sm font-bold text-white"
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
          ) : deletingId === cat.id ? (
            <div key={cat.id} className="sm:col-span-2 lg:col-span-3">
              <DeleteCategoryPanel
                category={cat}
                others={categories.filter((c) => c.id !== cat.id)}
                onDeleted={handleDeleted}
                onCancel={() => setDeletingId(null)}
              />
            </div>
          ) : (
            <div key={cat.id} className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-stone-100">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-stone-100">
                <Image src={cat.logoUrl} alt={cat.name} fill sizes="48px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-stone-800">{cat.name}</p>
                <p className="truncate text-xs text-stone-400">
                  /{cat.slug} · {plural(cat.productCount)}
                </p>
              </div>
              <button
                onClick={() => {
                  setDeletingId(null);
                  setEditingId(cat.id);
                }}
                aria-label={`Edit ${cat.name}`}
                className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDeleteClick(cat)}
                aria-label={`Delete ${cat.name}`}
                className="rounded-full p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-500"
              >
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
  onSaved: (c: SavedCategory) => void;
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
    <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl bg-stone-50 p-4">
      <input
        required
        placeholder="Category name (e.g. Baby Boy)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-santa-400"
      />
      <ImageUploader images={logo} onChange={setLogo} max={1} />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-santa-600 px-5 py-2 text-sm font-bold text-white disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="rounded-full border border-stone-200 px-5 py-2 text-sm font-semibold">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

function DeleteCategoryPanel({
  category,
  others,
  onDeleted,
  onCancel,
}: {
  category: Category;
  others: Category[];
  onDeleted: (id: string, movedTo: string | null) => void;
  onCancel: () => void;
}) {
  const canMove = others.length > 0;
  // Moving is the safe default; deleting products is the destructive choice.
  const [mode, setMode] = useState<"move" | "delete">(canMove ? "move" : "delete");
  const [targetId, setTargetId] = useState(others[0]?.id ?? "");
  const [busy, setBusy] = useState(false);

  const count = category.productCount;
  const target = others.find((c) => c.id === targetId);

  async function confirmDelete() {
    if (mode === "move" && !targetId) {
      toast.error("Pick a category to move the products to.");
      return;
    }
    setBusy(true);
    const query = mode === "move" ? `moveTo=${encodeURIComponent(targetId)}` : "deleteProducts=true";
    const res = await fetch(`/api/categories/${category.id}?${query}`, { method: "DELETE" });
    const data = await res.json().catch(() => null);
    setBusy(false);
    if (!res.ok) {
      toast.error(typeof data?.error === "string" ? data.error : "Could not delete category.");
      return;
    }
    toast.success(
      mode === "move"
        ? `"${category.name}" deleted. ${plural(data?.moved ?? count)} moved to ${target?.name ?? "the new category"}.`
        : `"${category.name}" deleted along with ${plural(data?.deleted ?? count)}.`
    );
    onDeleted(category.id, mode === "move" ? targetId : null);
  }

  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-santa-200">
      <p className="text-sm font-bold text-stone-800">Delete &ldquo;{category.name}&rdquo;?</p>
      <p className="mt-0.5 text-xs text-stone-500">
        This category has {plural(count)}. Every product needs a category, so choose what happens to them.
      </p>

      <div className="mt-3 space-y-2">
        <label
          className={`flex gap-3 rounded-xl p-3 ring-1 transition ${
            !canMove
              ? "cursor-not-allowed opacity-50 ring-stone-100"
              : mode === "move"
                ? "cursor-pointer bg-santa-50 ring-santa-300"
                : "cursor-pointer ring-stone-200 hover:bg-stone-50"
          }`}
        >
          <input
            type="radio"
            name={`delete-mode-${category.id}`}
            checked={mode === "move"}
            disabled={!canMove}
            onChange={() => setMode("move")}
            className="mt-0.5 accent-santa-600"
          />
          <div className="min-w-0 flex-1 text-sm">
            <p className="font-semibold text-stone-800">Move the products to another category</p>
            {canMove ? (
              <select
                value={targetId}
                onChange={(e) => {
                  setTargetId(e.target.value);
                  setMode("move");
                }}
                className="mt-2 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm outline-none focus:border-santa-400"
              >
                {others.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({plural(c.productCount)})
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-xs text-stone-400">Create another category first to move them there.</p>
            )}
          </div>
        </label>

        <label
          className={`flex cursor-pointer gap-3 rounded-xl p-3 ring-1 transition ${
            mode === "delete" ? "bg-red-50 ring-red-300" : "ring-stone-200 hover:bg-stone-50"
          }`}
        >
          <input
            type="radio"
            name={`delete-mode-${category.id}`}
            checked={mode === "delete"}
            onChange={() => setMode("delete")}
            className="mt-0.5 accent-red-600"
          />
          <div className="text-sm">
            <p className="font-semibold text-stone-800">Delete the {plural(count)} too</p>
            <p className="text-xs text-stone-500">
              They&apos;ll be removed from the shop. Past orders keep their item details.
            </p>
          </div>
        </label>
      </div>

      {mode === "delete" && (
        <p className="mt-3 flex items-start gap-1.5 text-xs font-medium text-red-600">
          <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0" />
          This permanently deletes {plural(count)}. It can&apos;t be undone.
        </p>
      )}

      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={onCancel}
          disabled={busy}
          className="rounded-full px-4 py-2 text-sm font-semibold text-stone-500 transition hover:bg-stone-100 disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          onClick={confirmDelete}
          disabled={busy || (mode === "move" && !targetId)}
          className={`rounded-full px-5 py-2 text-sm font-bold text-white transition disabled:opacity-50 ${
            mode === "delete" ? "bg-red-600 hover:bg-red-700" : "bg-santa-600 hover:bg-santa-700"
          }`}
        >
          {busy ? "Deleting…" : mode === "move" ? "Move products & delete" : "Delete everything"}
        </button>
      </div>
    </div>
  );
}
