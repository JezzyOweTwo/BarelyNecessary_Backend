import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Admin
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">
            Admin Control Panel
          </h1>
          <p className="mt-4 max-w-2xl text-gray-600">
            Manage products, users, and store activity.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <Link
            href="/admin/products"
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <h2 className="text-xl font-semibold">Manage Products</h2>
            <p className="mt-2 text-sm text-gray-600">
              View and manage product inventory.
            </p>
          </Link>

          <Link
            href="/admin/users"
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <h2 className="text-xl font-semibold">Manage Users</h2>
            <p className="mt-2 text-sm text-gray-600">
              View registered users and account roles.
            </p>
          </Link>

          <Link
            href="/orders"
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <h2 className="text-xl font-semibold">View Orders</h2>
            <p className="mt-2 text-sm text-gray-600">
              Check order and purchase information.
            </p>
          </Link>
        </div>
      </section>
    </main>
  );
}