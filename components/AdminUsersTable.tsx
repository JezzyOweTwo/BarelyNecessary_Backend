"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/lib/types";

type Props = {
  users: User[];
};

type EditableUser = {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  phone: string;
  role: string;
  is_active: boolean;
};

export default function AdminUsersTable({ users }: Props) {
  const router = useRouter();
  const editorRef = useRef<HTMLDivElement | null>(null);

  const [selectedUser, setSelectedUser] = useState<EditableUser | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function openEditor(user: User) {
    setErrorMessage("");

    setSelectedUser({
      user_id: user.user_id,
      first_name: user.first_name ?? "",
      last_name: user.last_name ?? "",
      email: user.email ?? "",
      username: user.username ?? "",
      phone: user.phone ?? "",
      role: user.role ?? "customer",
      is_active: !!user.is_active,
    });

    setTimeout(() => {
      editorRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  }

  function closeEditor() {
    if (saving) return;
    setSelectedUser(null);
    setErrorMessage("");
  }

  function updateField<K extends keyof EditableUser>(
    field: K,
    value: EditableUser[K]
  ) {
    if (!selectedUser) return;

    setSelectedUser({
      ...selectedUser,
      [field]: value,
    });
  }

  async function handleSave() {
    if (!selectedUser) return;

    setSaving(true);
    setErrorMessage("");

    if (!selectedUser.first_name.trim()) {
      setErrorMessage("First name cannot be empty.");
      setSaving(false);
      return;
    }

    if (!selectedUser.last_name.trim()) {
      setErrorMessage("Last name cannot be empty.");
      setSaving(false);
      return;
    }

    if (!selectedUser.email.trim()) {
      setErrorMessage("Email cannot be empty.");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(`/api/admin/user/${selectedUser.user_id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: selectedUser.first_name.trim(),
          last_name: selectedUser.last_name.trim(),
          email: selectedUser.email.trim(),
          username: selectedUser.username.trim(),
          phone: selectedUser.phone.trim(),
          role: selectedUser.role,
          is_active: selectedUser.is_active,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.data || "Failed to update user.");
      }

      router.refresh();
      setErrorMessage("");
    } catch (err) {
      console.error(err);
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to update user."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full min-w-[1100px] text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
                <th className="px-3 py-3 text-center font-semibold">Role</th>
                <th className="px-3 py-3 text-center font-semibold">Name</th>
                <th className="px-3 py-3 text-center font-semibold">Username</th>
                <th className="px-3 py-3 text-center font-semibold">Email</th>
                <th className="px-3 py-3 text-center font-semibold">Phone</th>
                <th className="hidden px-3 py-3 text-center font-semibold md:table-cell">ID</th>
                <th className="px-3 py-3 text-center font-semibold">Status</th>
            </tr>
          </thead>

          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                  No users found or access restricted.
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const isSelected = selectedUser?.user_id === u.user_id;

                return (
                  <tr
                    key={u.user_id}
                    onClick={() => openEditor(u)}
                    title="Click to edit user"
                    className={`cursor-pointer border-b border-gray-100 transition ${
                      isSelected ? "bg-gray-100" : "hover:bg-gray-50"
                    }`}
                  >
                   <td className="px-3 py-3 text-center capitalize">{u.role}</td>

                    <td className="px-3 py-3 text-center">
                        {u.first_name} {u.last_name}
                    </td>

                    <td className="px-3 py-3 text-center">
                        {u.username || "—"}
                    </td>

                    <td className="max-w-[220px] truncate px-3 py-3 text-center" title={u.email}>
                        {u.email}
                    </td>

                    <td className="px-3 py-3 text-center">
                        {u.phone || "—"}
                    </td>

                    <td className="hidden max-w-[220px] break-words px-3 py-3 text-center text-xs text-gray-500 md:table-cell">
                        {u.user_id}
                    </td>

                    <td className="px-3 py-3 text-center">
                        {u.is_active ? "Active" : "Inactive"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <div
          ref={editorRef}
          className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm mt-6 mb-6"
        >
          <div className="flex items-start justify-between gap-4 ">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                Edit User
              </p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900">
                {selectedUser.first_name} {selectedUser.last_name}
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
                    htmlFor="user-id"
                    className="mb-2 block text-sm font-medium text-gray-700"
                >
                    User ID
                </label>
                <input
                    id="user-id"
                    type="text"
                    value={selectedUser.user_id}
                    readOnly
                    className="w-full rounded-xl border border-gray-300 bg-gray-100 px-4 py-3 text-gray-500 outline-none"
                />
            </div>
            <div>
              <label
                htmlFor="user-first-name"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                First Name
              </label>
              <input
                id="user-first-name"
                type="text"
                value={selectedUser.first_name}
                onChange={(e) => updateField("first_name", e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
              />
            </div>

            <div>
              <label
                htmlFor="user-last-name"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Last Name
              </label>
              <input
                id="user-last-name"
                type="text"
                value={selectedUser.last_name}
                onChange={(e) => updateField("last_name", e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
              />
            </div>

            <div>
              <label
                htmlFor="user-username"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <input
                id="user-username"
                type="text"
                value={selectedUser.username}
                onChange={(e) => updateField("username", e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
              />
            </div>

            <div>
              <label
                htmlFor="user-email"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="user-email"
                type="email"
                value={selectedUser.email}
                onChange={(e) => updateField("email", e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
              />
            </div>

            <div>
              <label
                htmlFor="user-phone"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Phone
              </label>
              <input
                id="user-phone"
                type="text"
                value={selectedUser.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
              />
            </div>

            <div>
              <label
                htmlFor="user-role"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Role
              </label>
              <select
                id="user-role"
                value={selectedUser.role}
                onChange={(e) => updateField("role", e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
              >
                <option value="customer">customer</option>
                <option value="admin">admin</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="user-status"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Account Status
              </label>
              <select
                id="user-status"
                value={selectedUser.is_active ? "active" : "inactive"}
                onChange={(e) =>
                  updateField("is_active", e.target.value === "active")
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
              <h3 className="text-lg font-semibold text-gray-900">Addresses</h3>
              <p className="mt-3 text-sm text-gray-600">
                User address history.
              </p>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
              <h3 className="text-lg font-semibold text-gray-900">Order History</h3>
              <p className="mt-3 text-sm text-gray-600">
                User order history.
              </p>
            </section>
          </div>

          {errorMessage && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          <div className="mt-8 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeEditor}
              disabled={saving}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}