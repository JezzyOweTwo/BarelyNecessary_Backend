import { api_get } from "@/lib/http_methods";
import { User } from "@/lib/types";
import BackButton from "@/components/BackButton";


export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  let users: User[] = [];

  try {
    users = await api_get<User[]>("/api/admin/user");
  } catch (err) {
    console.error("Failed to fetch users:", err);
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Admin
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">
            User Management
          </h1>
          <p className="mt-4 text-gray-600">
            View registered users.
          </p>
        </div>
      </section>

 <section className="mx-auto max-w-6xl px-6 py-10 lg:px-8">
  <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
    <table className="min-w-[720px] w-full text-sm">
      <thead className="border-b border-gray-200 bg-gray-50">
        <tr>
          <th className="px-4 py-3 text-center font-semibold">Role</th>
          <th className="px-4 py-3 text-center font-semibold">Name</th>
          <th className="px-4 py-3 text-center font-semibold">Email</th>
          <th className="px-4 py-3 text-center font-semibold">ID</th>
        </tr>
      </thead>

      <tbody>
        {users.length === 0 ? (
          <tr>
            <td colSpan={4} className="px-4 py-10 text-center text-gray-500">
              No users found or access restricted.
            </td>
          </tr>
        ) : (
          users.map((u) => (
            <tr key={u.user_id} className="border-b border-gray-100 align-top">
              
              <td className="px-4 py-3 text-center capitalize">
                {u.role}
              </td>

              <td className="px-4 py-3 text-center">
                {u.first_name} {u.last_name}
              </td>

              <td
                className="max-w-[220px] truncate px-4 py-3 text-center"
                title={u.email}
              >
                {u.email}
              </td>

              <td
                className="max-w-[200px] break-words px-4 py-3 text-center text-xs text-gray-500"
              >
                {u.user_id}
              </td>

            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
  <div className= "py-2" >
    <BackButton />
  </div>
</section>
    </main>
  );
}