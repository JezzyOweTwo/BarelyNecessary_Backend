"use client";

import { useMemo, useState } from "react";
import ProductCard from "@/components/ProductCard";
import {Product, Category} from "@/lib/types";
import {format_product_query} from "@/lib/image_store_handler";

type SortOption =
  | "default"
  | "price-asc"
  | "price-desc"
  | "name-asc"
  | "name-desc";

type CatalogClientProps = {
  products: Product[];
  categories: Category[];
};

export default function CatalogClient({
  products,
  categories,
}: CatalogClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("default");

  const brands = useMemo(() => {
    return Array.from(
      new Set(  products.map((product) => product.brand).filter(Boolean))
    ) as string[];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    const result = products.filter((product) => {
      const matchesSearch =
        search.length === 0 ||
        product.name.toLowerCase().includes(search) ||
        product.description.toLowerCase().includes(search) ||
        (product.brand ?? "").toLowerCase().includes(search) ||
        (product.model ?? "").toLowerCase().includes(search);

      const matchesCategory =
        selectedCategory === "all" ||
        String(product.category_id) === selectedCategory;

      const matchesBrand =
        selectedBrand === "all" || product.brand === selectedBrand;

      const isActive = Boolean(product.is_active);

      return matchesSearch && matchesCategory && matchesBrand && isActive;
    });

    switch (sortBy) {
      case "price-asc":
        return [...result].sort((a, b) => Number(a.price) - Number(b.price));
      case "price-desc":
        return [...result].sort((a, b) => Number(b.price) - Number(a.price));
      case "name-asc":
        return [...result].sort((a, b) => a.name.localeCompare(b.name));
      case "name-desc":
        return [...result].sort((a, b) => b.name.localeCompare(a.name));
      default:
        return result;
    }
  }, [products, searchTerm, selectedCategory, selectedBrand, sortBy]);

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Catalog
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">
            Browse Products
          </h1>
          <p className="mt-4 max-w-2xl text-gray-600">
            Browse products and use filters to search by category, brand, or price.          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="mb-8 grid gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:grid-cols-2 xl:grid-cols-4">
          <div>
            <label
              htmlFor="search-input"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Search
            </label>
            <input
              id="search-input"
              type="text"
              placeholder="Search by name, brand, model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
            />
          </div>

          <div>
            <label
              htmlFor="category-select"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Category
            </label>
            <select
              id="category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category.category_id} value={category.category_id}>
                  {category.category_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="brand-select"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Brand
            </label>
            <select
              id="brand-select"
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
            >
              <option value="all">All Brands</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="sort-select"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Sort By
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
            >
              <option value="default">Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
            </select>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing{" "}
            <span className="font-semibold">{filteredProducts.length}</span>{" "}
            product(s)
          </p>

          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("all");
              setSelectedBrand("all");
              setSortBy("default");
            }}
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-white"
          >
            Clear Filters
          </button>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
            <h2 className="text-xl font-semibold">No products found</h2>
            <p className="mt-2 text-sm text-gray-600">
              Try changing your search, category, brand, or sorting options.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.product_id}
                product={{
                    ...product,
                    brand: product.brand ?? undefined,
                    model: product.model ?? undefined,
                    short_tagline: product.short_tagline ?? undefined,
                    image_url: format_product_query(product.product_id) ?? undefined,
                    is_featured: Boolean(product.is_featured),
                    is_active: Boolean(product.is_active),
                    price: Number(product.price),
                }}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}