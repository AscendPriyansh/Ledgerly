import { afterAll, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../src/app";
import { prisma } from "../src/lib/prisma";

describe("GET /api/health", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("returns the service health status", async () => {
    const response = await request(app).get("/api/health");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok", service: "miniledger-api" });
  });
});
