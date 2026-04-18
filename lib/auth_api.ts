/**
 * Public auth API paths. Route groups like `(public)` are not part of the URL —
 * e.g. `app/api/(public)/login/route.ts` → `/api/login`.
 */
export const AUTH_API = {
  login: "/api/login",
  signup: "/api/signup",
  signupValidate: "/api/signup/validate",
} as const;
