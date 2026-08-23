import ProductCard, { type ProductCardData } from "./ProductCard";

export default function ProductGrid({ products }: { products: ProductCardData[] }) {
  if (products.length === 0) {
    return <p className="py-16 text-center text-sm text-slate-500">No products found.</p>;
  }
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} index={i} />
      ))}
    </div>
  );
}
