import { NextRequest } from "next/server";

type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [key: string]: JsonValue };

export function makeNextRequest(
  url: string,
  init?: Omit<RequestInit, "body"> & { body?: JsonValue }
) {
  const headers = new Headers(init?.headers);
  if (init?.body !== undefined && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  const body =
    init?.body === undefined ? undefined : JSON.stringify(init.body);

  return new NextRequest(url, {
    ...init,
    headers,
    body,
  });
}

