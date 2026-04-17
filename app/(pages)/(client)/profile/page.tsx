export const dynamic = "force-dynamic";

type ProfileData = {
  first_name?: string;
  last_name?: string;
  email?: string;
  username?: string;
  phone?: string;
  role?: string;
  is_active?: boolean;
};

async function getProfile(): Promise<ProfileData | null> {
  try {
    const res = await fetch(`${process.env.BACKEND_URL}/api/profile`, {
      cache: "no-store",
    });

    if (!res.ok) return null;

    const json = await res.json();
    return json?.data ?? json ?? null;
  } catch {
    return null;
  }
}

// function getInitials(profile: ProfileData | null) {
//   const first = profile?.first_name?.[0] ?? "";
//   const last = profile?.last_name?.[0] ?? "";
//   const initials = `${first}${last}`.trim();
//   return initials || "BN";
// }

export default async function ProfilePage() {
  const profile = await getProfile();

  const displayProfile: ProfileData = profile ?? {
    first_name: "Guest",
    last_name: "User",
    email: "Not available",
    username: "Not available",
    phone: "Not available",
    role: "Customer",
    is_active: false,
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Account
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">
            My Account
          </h1>
          <p className="mt-4 max-w-2xl text-gray-600">
            View your profile details, contact information, saved addresses,
            payment methods, and recent orders.
          </p>
        </div>
      </section>
      {/* <div className="items-center justify-center mt-8 grid gap-6 md:grid-cols-2">
        <div className="flex flex-wrap gap-6">
          <a
            href="#overview"
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Overview
          </a>
          <a
            href="#contact"
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Contact
          </a>
          <a
            href="#addresses"
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Addresses
          </a>
          <a
            href="#payments"
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Payment Methods
          </a>
          <a
            href="#orders"
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Orders
          </a>
        </div>
      </div> */}
      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8 space-y-10 gap-10">
        <div className="space-y-9">
          <div className="rounded-3xl border border-gray-200 bg-white p-8">
            <div className="flex flex-col items-center justify-center text-center">
                <div >
                  <p className=" text-m text-gray-500">Hi</p>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {displayProfile.first_name} {displayProfile.last_name}
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">
                    {displayProfile.email}
                  </p>
                </div>
            </div>
          </div>

          <div className="space-y-8 justify-center mt-8">
            <section
              id="overview"
              className="rounded-3xl border border-gray-200 bg-white p-8"
            >
              <h3 className="text-2xl font-semibold text-gray-900">
                Account Overview
              </h3>

              <div className="mt-5 grid gap-8 md:grid-cols-2">
                <div>
                  <p className="mt-2 text-xs uppercase tracking-wide text-gray-500">
                    Full Name
                  </p>
                  <p className=" mt-1 text-base font-medium text-gray-900">
                    {displayProfile.first_name} {displayProfile.last_name}
                  </p>
                </div>

                <div>
                  <p className="mt-3 text-xs uppercase tracking-wide text-gray-500">
                    Username
                  </p>
                  <p className="mt-1 text-base font-medium text-gray-900">
                    {displayProfile.username || "-"}
                  </p>
                </div>

                <div>
                  <p className="mt-3 text-xs uppercase tracking-wide text-gray-500">
                    Role
                  </p>
                  <p className="mt-1 text-base font-medium capitalize text-gray-900">
                    {displayProfile.role || "-"}
                  </p>
                </div>

                <div>
                  <p className="mt-3 text-xs uppercase tracking-wide text-gray-500">
                    Account Status
                  </p>
                  <p className="mt-1 text-base font-medium text-gray-900">
                    {displayProfile.is_active ? "Active" : "Unavailable"}
                  </p>
                </div>
              </div>
            </section>

            <section
              id="contact"
              className="mt-6 rounded-3xl border border-gray-200 bg-white p-8"
            >
              <h3 className="text-2xl font-semibold text-gray-900">
                Contact Information
              </h3>

              <div className="mt-5 grid gap-8 md:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Email
                  </p>
                  <p className="mt-2 text-base font-medium text-gray-900">
                    {displayProfile.email || "-"}
                  </p>
                </div>

                <div>
                  <p className="mt-3 text-xs uppercase tracking-wide text-gray-500">
                    Phone
                  </p>
                  <p className="mt-1 text-base font-medium text-gray-900">
                    {displayProfile.phone || "-"}
                  </p>
                </div>
              </div>
            </section>

            <section
              id="addresses"
              className="mt-6 rounded-3xl border border-gray-200 bg-white p-8"
            >
              <h3 className="text-2xl font-semibold text-gray-900">
                Addresses
              </h3>

              <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-6">
                <p className="text-sm font-medium text-gray-900">
                  No saved addresses yet.
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  Shipping and billing addresses will appear here once connected.
                </p>
              </div>
            </section>

            <section
              id="payments"
              className="mt-6 rounded-3xl border border-gray-200 bg-white p-8"
            >
              <h3 className="text-2xl font-semibold text-gray-900">
                Payment Methods
              </h3>

              <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-6">
                <p className="text-sm font-medium text-gray-900">
                  No saved payment methods yet.
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  Saved cards or other payment options will appear here once
                  connected.
                </p>
              </div>
            </section>

            <section
              id="orders"
              className="mt-6 rounded-3xl border border-gray-200 bg-white p-8"
            >
              <h3 className="text-2xl font-semibold text-gray-900">
                Recent Orders
              </h3>

              <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-6">
                <p className="text-sm font-medium text-gray-900">
                  No recent orders available.
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  Order history will show here when the orders route is connected.
                </p>
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}