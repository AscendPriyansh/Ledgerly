import { afterAll, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../src/app";
import { prisma } from "../src/lib/prisma";

describe("Protected Routes Authentication", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("returns 401 for GET /api/summary when no authorization header is provided", async () => {
    const res = await request(app).get("/api/summary");
    expect(res.status).toBe(401);
  });

  it("returns 401 for GET /api/summary/analytics when unauthorized", async () => {
    const res = await request(app).get("/api/summary/analytics");
    expect(res.status).toBe(401);
  });

  it("returns 401 for GET /api/loans when unauthorized", async () => {
    const res = await request(app).get("/api/loans");
    expect(res.status).toBe(401);
  });

  it("returns 401 for GET /api/user/profile when unauthorized", async () => {
    const res = await request(app).get("/api/user/profile");
    expect(res.status).toBe(401);
  });

  it("returns 401 for PATCH /api/user/profile when unauthorized", async () => {
    const res = await request(app).patch("/api/user/profile").send({ name: "Alex" });
    expect(res.status).toBe(401);
  });
});
