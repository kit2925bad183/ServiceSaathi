import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const timestamp = new Date().toISOString();
  let dbStatus = "healthy";

  try {
    // Quick probe
    await prisma.$queryRaw`SELECT 1`;
  } catch (err: unknown) {
    dbStatus = `offline (${err instanceof Error ? err.message : "connection error"})`;
  }

  return NextResponse.json({
    status: "ok",
    app: "ServiceSaathi",
    timestamp,
    database: dbStatus,
    version: "1.0.0",
  });
}
