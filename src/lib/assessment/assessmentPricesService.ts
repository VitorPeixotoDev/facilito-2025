import type { SupabaseClient } from "@supabase/supabase-js";

const TABLE = "assessment_prices";
const DEFAULT_PRICE_CENTS = 2000; // R$ 20,00

/**
 * Retorna o preço em centavos da avaliação. Se não existir no banco, retorna o padrão.
 */
export async function getAssessmentPriceCents(
  supabase: SupabaseClient,
  assessmentId: string
): Promise<number> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("price_cents")
    .eq("assessment_id", assessmentId)
    .maybeSingle();

  if (error) {
    console.warn("[assessmentPricesService] getAssessmentPriceCents:", error);
    return DEFAULT_PRICE_CENTS;
  }

  if (data?.price_cents != null && data.price_cents > 0) {
    return data.price_cents;
  }

  return DEFAULT_PRICE_CENTS;
}

/**
 * Retorna um mapa assessment_id -> price_cents para todas as avaliações com preço no banco.
 * Útil para exibir preços na loja sem uma request por card.
 */
export async function getAllAssessmentPrices(
  supabase: SupabaseClient
): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("assessment_id, price_cents");

  if (error) {
    console.warn("[assessmentPricesService] getAllAssessmentPrices:", error);
    return {};
  }

  const map: Record<string, number> = {};
  for (const row of data ?? []) {
    if (row.price_cents > 0) {
      map[row.assessment_id] = row.price_cents;
    }
  }
  return map;
}
