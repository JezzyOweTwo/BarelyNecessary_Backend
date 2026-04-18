import type { NextRequest } from "next/server";
import { AsyncLocalStorage } from "node:async_hooks";

const proxyRequestStore = new AsyncLocalStorage<NextRequest>();

/**
 * Run async work with the current proxy request available to `requireAuth` / `getAuthClaims`.
 * The callback must return a Promise so the store stays active for the whole chain (Node ALS + async).
 */
export function runWithProxyRequest<T>(
  request: NextRequest,
  fn: () => Promise<T>
): Promise<T> {
  return proxyRequestStore.run(request, fn);
}

export function getProxyRequest(): NextRequest | undefined {
  return proxyRequestStore.getStore();
}
