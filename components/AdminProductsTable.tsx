"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Product, Category } from "@/lib/types";

type Props = {
  products: Product[];
  categories: Category[];
};

type EditableProduct = {
  product_id: number;
  name: string;
  price: string;
  stock_quantity: string;
  is_active: boolean;
  category_id: string;
  description: string;
};

export default function AdminProductsTable({ products, categories }: Props) {
  const router = useRouter();
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<EditableProduct | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showCategoryEditor, setShowCategoryEditor] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [categoryErrorMessage, setCategoryErrorMessage] = useState("");
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<number, boolean>>({});
  const [newCategory, setNewCategory] = useState({
    category_id:
      categories.length > 0
        ? Math.max(...categories.map((c) => c.category_id)) + 1
        : 1,
    category_name: "",
    description: "",
  });
  function openEditor(product: Product) {
  setErrorMessage("");
  setCategoryErrorMessage("");
  setShowCategoryEditor(false);
  setIsCreating(false);

  setSelectedProduct({
    product_id: product.product_id,
    name: product.name,
    price: String(product.price),
    stock_quantity: String(product.stock_quantity),
    is_active: product.is_active,
    category_id: String(product.category_id ?? ""),
    description: product.description ?? "",
  });

  setTimeout(() => {
      editorRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  }

  function openCreateCategoryEditor() {
    setErrorMessage("");
    setCategoryErrorMessage("");
    setSelectedProduct(null);  
    setIsCreating(false); 
    setShowCategoryEditor(true);
    setNewCategory({
      category_id:
        categories.length > 0
          ? Math.max(...categories.map((c) => c.category_id)) + 1
          : 1,
      category_name: "",
      description: "",
    });

    setTimeout(() => {
      editorRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  }

  function openCreateEditor() {
  setErrorMessage("");
  setCategoryErrorMessage("");
  setShowCategoryEditor(false);
  setIsCreating(true);

  setSelectedProduct({
    product_id: products.length > 0 ? Math.max(...products.map((p) => p.product_id)) + 1 : 1,
    name: "",
    price: "",
    stock_quantity: "",
    is_active: true,
    category_id: "",
    description: "",
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
    if (isCreating) {
      if (!selectedProduct.category_id) {
        setErrorMessage("Please select a category.");
        setSaving(false);
        return;
      }

      if (!selectedProduct.description.trim()) {
        setErrorMessage("Description cannot be empty.");
        setSaving(false);
        return;
      }
    }
    try {
      let res: Response;

      if (isCreating) {
        res = await fetch(`/api/admin/product/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            product_id: selectedProduct.product_id,
            category_id: Number(selectedProduct.category_id),
            name: selectedProduct.name.trim(),
            description: selectedProduct.description.trim(),
            price: parsedPrice,
            stock_quantity: parsedStock,
            is_active: selectedProduct.is_active,
          }),
        });
      } else {
        res = await fetch(`/api/admin/product/update`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            product_id: selectedProduct.product_id,
            category_id: Number(selectedProduct.category_id),
            name: selectedProduct.name.trim(),
            description: selectedProduct.description.trim(),
            price: parsedPrice,
            stock_quantity: parsedStock,
            is_active: selectedProduct.is_active,
          }),
        });
      }

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          data?.message ||
            (isCreating
              ? "Failed to create product."
              : "Failed to update product.")
        );
      }

      if (isCreating) {
        setIsCreating(false);
        closeEditor();
      }

      router.refresh();
      setErrorMessage("");
    } catch (err) {
      console.error(err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : isCreating
          ? "Failed to create product."
          : "Failed to update product."
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
    async function handleCreateCategory() {
    setCreatingCategory(true);
    setCategoryErrorMessage("");

    if (!newCategory.category_name.trim()) {
      setCategoryErrorMessage("Category name cannot be empty.");
      setCreatingCategory(false);
      return;
    }

    try {
      const res = await fetch(`/api/admin/category/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category_id: newCategory.category_id,
          category_name: newCategory.category_name.trim(),
          description: newCategory.description.trim() || null,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Failed to create category.");
      }

      setShowCategoryEditor(false);
      setCategoryErrorMessage("");
      router.refresh();
    } catch (err) {
      console.error(err);
      setCategoryErrorMessage(
        err instanceof Error ? err.message : "Failed to create category."
      );
    } finally {
      setCreatingCategory(false);
    }
  }

  return (
    <div  className="space-y-8">
      <div style={{justifyContent:'flex-end'}} className="mb-6 flex w-full gap-3">
          <button type="button" onClick={openCreateEditor} className=" rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800">
          + Add Product
        </button>
        <button type="button" onClick={openCreateCategoryEditor} className=" rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800">
          + Add Category
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white mb-8">
        <table className="w-full min-w-[760px] text-left text-sm md:text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-3 py-2 md:px-3 md:py-3 text-center font-semibold">Product ID</th>
              <th className="px-2 py-2 md:px-3 md:py-3 text-center font-semibold">Name</th>
              <th className="px-2 py-2 md:px-3 md:py-3 text-center font-semibold">Category</th>
              <th className="px-2 py-2 md:px-3 md:py-3 text-center font-semibold">Description</th>
              <th className="px-2 py-2 md:px-3 md:py-3 text-center font-semibold">Price</th>
              <th className="px-2 py-2 md:px-3 md:py-3 text-center font-semibold">Stock</th>
              <th className="px-2 py-2 md:px-3 md:py-3 text-center font-semibold">Status</th>
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
               const isExpanded = expandedDescriptions[p.product_id];

                const categoryName =
                  categories.find((c) => c.category_id === p.category_id)?.category_name || "—";

                const description = p.description || "";
                const shortText = description.slice(0, 80);
                const shouldTruncate = description.length > 80;

                return (
                  <tr
                    key={p.product_id}
                    onClick={() => openEditor(p)}
                    title="Click to edit product"
                    className={`cursor-pointer border-b border-gray-100 transition ${
                      isSelected ? "bg-gray-100" : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="px-4 py-3 text-center">{p.product_id}</td>
                    <td className="px-4 py-3 text-center font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-center">{categoryName}</td>
                    <td className="w-[180px] px-2 py-2 text-left align-top md:w-[240px] md:px-3 md:py-3">
                    <div className="whitespace-normal break-words leading-snug">
                      {isExpanded || !shouldTruncate ? description : `${shortText}...`}

                      {shouldTruncate && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedDescriptions((prev) => ({
                              ...prev,
                              [p.product_id]: !prev[p.product_id],
                            }));
                          }}
                          className="ml-2 text-xs text-blue-600 hover:underline">
                            {isExpanded ? "less" : "more"}
                          </button>
                        )}
                      </div>
                    </td>
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

      {showCategoryEditor && (
            <div
              ref={editorRef}
              className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm mb-8"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                    Create Category
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-gray-900">
                    New Category
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCategoryEditor(false)}
                  className="rounded-xl border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                >
                  Close
                </button>
              </div>

              <div className="mt-8 grid gap-6">
                <div>
                  <label
                    htmlFor="category-name"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Category Name
                  </label>
                  <input
                    id="category-name"
                    type="text"
                    value={newCategory.category_name}
                    onChange={(e) =>
                      setNewCategory({
                        ...newCategory,
                        category_name: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
                  />
                </div>

                <div>
                  <label
                    htmlFor="category-description"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Description
                  </label>
                  <textarea
                    id="category-description"
                    rows={4}
                    value={newCategory.description}
                    onChange={(e) =>
                      setNewCategory({
                        ...newCategory,
                        description: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
                  />
                </div>
              </div>

              {categoryErrorMessage && (
                <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {categoryErrorMessage}
                </div>
              )}

              <div className="mt-8 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCategoryEditor(false)}
                  disabled={creatingCategory}
                  className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleCreateCategory}
                  disabled={creatingCategory}
                  className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creatingCategory ? "Saving..." : "Save Category"}
                </button>
              </div>
            </div>
          )}

          {selectedProduct && (
            <div
              ref={editorRef}
              className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm mb-8"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                    {isCreating ? "Create Product" : "Edit Product"}
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-gray-900">
                    {isCreating ? "New Product" : `Product #${selectedProduct.product_id}`}
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
                    htmlFor="product-category"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Category
                  </label>
                  <select
                    id="product-category"
                    value={selectedProduct.category_id}
                    onChange={(e) => updateField("category_id", e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option
                        key={category.category_id}
                        value={String(category.category_id)}
                      >
                        {category.category_name}
                      </option>
                    ))}
                  </select>
                </div>

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

                <div className="md:col-span-2">
                  <label
                    htmlFor="product-description"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Description
                  </label>
                  <textarea
                    id="product-description"
                    rows={4}
                    value={selectedProduct.description}
                    onChange={(e) => updateField("description", e.target.value)}
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
                {!isCreating ? (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={saving || deleting}
                    className="rounded-xl border border-red-300 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deleting ? "Deleting..." : "Delete Product"}
                  </button>
                ) : (
                  <div />
                )}

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