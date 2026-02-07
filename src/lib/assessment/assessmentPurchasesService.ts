import type { SupabaseClient } from "@supabase/supabase-js";

const TABLE = "assessment_purchases";

/**
 * Retorna os IDs das avaliações que o usuário já comprou.
 */
export async function getPurchasedAssessmentIds(
  supabase: SupabaseClient,
  userId: string
): Promise<string[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("assessment_id")
    .eq("user_id", userId);

  if (error) {
    console.error("[assessmentPurchasesService] getPurchasedAssessmentIds:", error);
    return [];
  }

  return (data ?? []).map((row) => row.assessment_id);
}

/**
 * Registra uma compra após pagamento confirmado no Stripe.
 * Idempotente: se já existir (user_id, assessment_id), atualiza stripe_session_id.
 */
export async function recordPurchase(
  supabase: SupabaseClient,
  userId: string,
  assessmentId: string,
  stripeSessionId: string
): Promise<boolean> {
  const { error } = await supabase.from(TABLE).upsert(
    {
      user_id: userId,
      assessment_id: assessmentId,
      stripe_session_id: stripeSessionId,
    },
    { onConflict: "user_id,assessment_id" }
  );

  if (error) {
    console.error("[assessmentPurchasesService] recordPurchase:", error);
    return false;
  }
  return true;
}

/**
 * Verifica se o usuário já comprou uma avaliação específica.
 */
export async function hasPurchasedAssessment(
  supabase: SupabaseClient,
  userId: string,
  assessmentId: string
): Promise<boolean> {
  const ids = await getPurchasedAssessmentIds(supabase, userId);
  return ids.includes(assessmentId);
}
