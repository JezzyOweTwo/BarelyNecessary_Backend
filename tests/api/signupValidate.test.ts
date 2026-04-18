import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/(public)/signup/validate/route";
import { makeNextRequest } from "../utils/nextRequest";

describe("POST /api/(public)/signup/validate", () => {
  it("returns 400 when email/code missing", async () => {
    const req = makeNextRequest(
      "http://localhost/api/(public)/signup/validate",
      { method: "POST", body: {} }
    );

    const res = await POST(req);
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({
      data: "Missing email or verification code.",
    });
  });
});

