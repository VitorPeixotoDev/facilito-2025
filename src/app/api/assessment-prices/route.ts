import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getAllAssessmentPrices } from "@/lib/assessment/assessmentPricesService";
import { getAssessmentsFromCatalog } from "@/lib/assessment/assessmentCatalogService";

const DEFAULT_PRICE_CENTS = 2000;

/**
 * GET /api/assessment-prices
 * Retorna preços em centavos por assessment_id (baseado no catálogo do banco).
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const [assessments, dbPrices] = await Promise.all([
      getAssessmentsFromCatalog(supabase),
      getAllAssessmentPrices(supabase),
    ]);

    const prices: Record<string, number> = {};
    for (const a of assessments) {
      prices[a.id] = dbPrices[a.id] ?? DEFAULT_PRICE_CENTS;
    }

    return NextResponse.json({ prices });
  } catch (error) {
    console.error("[assessment-prices]", error);
    return NextResponse.json(
      { error: "Erro ao carregar preços" },
      { status: 500 }
    );
  }
}
