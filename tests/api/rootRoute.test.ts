import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/route";

describe("GET /api", () => {
  it("returns 404 JSON for root api route", async () => {
    const res = await GET();
    expect(res.status).toBe(404);
    await expect(res.json()).resolves.toEqual({
      message: "This route does not exist.",
    });
  });
});

