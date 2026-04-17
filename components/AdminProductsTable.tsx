"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/lib/types";

type Props = {
  products: Product[];
};

type EditableProduct = {
  product_id: number;
  name: string;
  price: string;
  stock_quantity: string;
  is_active: boolean;
};

export default function AdminProductsTable({ products }: Props) {
  const router = useRouter();
  const editorRef = useRef<HTMLDivElement | null>(null);

  const [selectedProduct, setSelectedProduct] = useState<EditableProduct | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function openEditor(product: Product) {
    setErrorMessage("");

    setSelectedProduct({
      product_id: product.product_id,
      name: product.name,
      price: String(product.price),
      stock_quantity: String(product.stock_quantity),
      is_active: product.is_active,
    });

    setTimeout(() => {
      editorRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  }

  function closeEditor() {
    if (saving || deleting) return;
    setSelectedProduct(null);
    setErrorMessage("");
  }

  function updateField<K extends keyof EditableProduct>(
    field: K,
    value: EditableProduct[K]
  ) {
    if (!selectedProduct) return;

    setSelectedProduct({
      ...selectedProduct,
      [field]: value,
    });
  }

  async function handleSave() {
    if (!selectedProduct) return;

    setSaving(true);
    setErrorMessage("");

    const parsedPrice = Number(selectedProduct.price);
    const parsedStock = Number(selectedProduct.stock_quantity);

    if (!selectedProduct.name.trim()) {
      setErrorMessage("Product name cannot be empty.");
      setSaving(false);
      return;
    }

    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      setErrorMessage("Price must be a valid non-negative number.");
      setSaving(false);
      return;
    }

    if (!Number.isInteger(parsedStock) || parsedStock < 0) {
      setErrorMessage("Stock must be a valid non-negative whole number.");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(`/api/admin/product/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: selectedProduct.product_id,
          name: selectedProduct.name.trim(),
          price: parsedPrice,
          stock_quantity: parsedStock,
          is_active: selectedProduct.is_active,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Failed to update product.");
      }

      router.refresh();
      setErrorMessage("");
    } catch (err) {
      console.error(err);
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to update product."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedProduct) return;

    const confirmed = window.confirm(
      `Delete product #${selectedProduct.product_id}? This cannot be undone.`
    );

    if (!confirmed) return;

    setDeleting(true);
    setErrorMessage("");

    try {
      const res = await fetch(`/api/admin/product/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: selectedProduct.product_id,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Failed to delete product.");
      }

      closeEditor();
      router.refresh();
    } catch (err) {
      console.error(err);
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to delete product."
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white mb-8">
        <table className="w-full table-fixed text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-center font-semibold">ID</th>
              <th className="px-4 py-3 text-center font-semibold">Name</th>
              <th className="px-4 py-3 text-center font-semibold">Price</th>
              <th className="px-4 py-3 text-center font-semibold">Stock</th>
              <th className="px-4 py-3 text-center font-semibold">Status</th>
            </tr>
          </thead>

          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                  No products found.
                </td>
              </tr>
            ) : (
              products.map((p) => {
                const isSelected = selectedProduct?.product_id === p.product_id;

                return (
                  <tr
                    key={p.product_id}
                    onClick={() => openEditor(p)}
                    title="Click to edit product"
                    className={`cursor-pointer border-b border-gray-100 transition ${
                      isSelected
                        ? "bg-gray-100"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="px-4 py-3 text-center">{p.product_id}</td>
                    <td className="px-4 py-3 text-center font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-center">
                      ${Number(p.price).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">{p.stock_quantity}</td>
                    <td className="px-4 py-3 text-center">
                      {p.is_active ? "Active" : "Hidden"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {selectedProduct && (
        <div
          ref={editorRef}
          className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                Edit Product
              </p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900">
                Product #{selectedProduct.product_id}
              </h2>
            </div>

            <button
              type="button"
              onClick={closeEditor}
              className="rounded-xl border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Close
            </button>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <label
                htmlFor="product-name"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <input
                id="product-name"
                type="text"
                value={selectedProduct.name}
                onChange={(e) => updateField("name", e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
              />
            </div>

            <div>
              <label
                htmlFor="product-price"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Price
              </label>
              <input
                id="product-price"
                type="number"
                min="0"
                step="0.01"
                value={selectedProduct.price}
                onChange={(e) => updateField("price", e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
              />
            </div>

            <div>
              <label
                htmlFor="product-stock"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Stock Quantity
              </label>
              <input
                id="product-stock"
                type="number"
                min="0"
                step="1"
                value={selectedProduct.stock_quantity}
                onChange={(e) => updateField("stock_quantity", e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="product-status"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Status
              </label>
              <select
                id="product-status"
                value={selectedProduct.is_active ? "active" : "hidden"}
                onChange={(e) =>
                  updateField("is_active", e.target.value === "active")
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
              >
                <option value="active">Active</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>
          </div>

          {errorMessage && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving || deleting}
              className="rounded-xl border border-red-300 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleting ? "Deleting..." : "Delete Product"}
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={closeEditor}
                disabled={saving || deleting}
                className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving || deleting}
                className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}