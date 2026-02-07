import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
  getAssessmentByIdFromCatalog,
  getAssessmentQuestionsFromCatalog,
  getAssessmentScaleOptionsFromCatalog,
} from "@/lib/assessment/assessmentCatalogService";

/**
 * GET /api/assessments/[id]
 * Retorna uma avaliação com questões e opções de escala (para o questionário).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "id obrigatório" }, { status: 400 });
  }

  const supabase = await createClient();

  const [assessment, questions, scaleOptions] = await Promise.all([
    getAssessmentByIdFromCatalog(supabase, id),
    getAssessmentQuestionsFromCatalog(supabase, id),
    getAssessmentScaleOptionsFromCatalog(supabase, id),
  ]);

  if (!assessment) {
    return NextResponse.json({ error: "Avaliação não encontrada" }, { status: 404 });
  }

  return NextResponse.json({
    assessment,
    questions,
    scaleOptions,
  });
}
