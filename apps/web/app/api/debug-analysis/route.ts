import { NextResponse } from "next/server";
import { db } from "@repo/database";
import { aiAnalyses } from "@repo/database/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * Debug endpoint to check:
 * 1. Database connection
 * 2. AI analyses in database
 * 3. Environment variables
 */
export async function GET() {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    databaseUrl: process.env.DATABASE_URL ? "✓ Set" : "✗ Not set",
    databaseUrlHost: process.env.DATABASE_URL
      ? new URL(process.env.DATABASE_URL).host
      : "N/A",
  };

  try {
    // Test 1: Database connection
    const allAnalyses = await db
      .select()
      .from(aiAnalyses)
      .orderBy(desc(aiAnalyses.createdAt))
      .limit(10);

    diagnostics.databaseConnection = "✓ Connected";
    diagnostics.totalAnalyses = allAnalyses.length;
    diagnostics.analyses = allAnalyses.map((a) => ({
      id: a.id,
      userId: a.userId,
      reportId: a.reportId,
      status: a.status,
      createdAt: a.createdAt,
      overallAssessment: a.overallAssessment?.substring(0, 100) + "...",
    }));

    // Test 2: Check for mock user analyses
    const mockUserId = "00000000-0000-0000-0000-000000000000";
    const mockUserAnalyses = allAnalyses.filter((a) => a.userId === mockUserId);
    diagnostics.mockUserAnalyses = mockUserAnalyses.length;

    return NextResponse.json(diagnostics, { status: 200 });
  } catch (error) {
    diagnostics.databaseConnection = "✗ Failed";
    diagnostics.error = error instanceof Error ? error.message : String(error);
    diagnostics.errorStack =
      error instanceof Error ? error.stack : undefined;

    return NextResponse.json(diagnostics, { status: 500 });
  }
}
