import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getAssessmentsFromCatalog } from "@/lib/assessment/assessmentCatalogService";

/**
 * GET /api/assessments
 * Lista o catálogo de avaliações (do banco).
 */
export async function GET() {
  const supabase = await createClient();
  const assessments = await getAssessmentsFromCatalog(supabase);
  return NextResponse.json({ assessments });
}
