import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/(public)/login/route";
import { makeNextRequest } from "../utils/nextRequest";

describe("POST /api/(public)/login", () => {
  it("returns 400 when email + password missing", async () => {
    const req = makeNextRequest("http://localhost/api/(public)/login", {
      method: "POST",
      body: {},
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({
      message: "Missing required field(s): email, password",
    });
  });

  it("returns 400 when password missing", async () => {
    const req = makeNextRequest("http://localhost/api/(public)/login", {
      method: "POST",
      body: { email: "someone@example.com" },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({
      message: "Missing required field(s): password",
    });
  });
});

