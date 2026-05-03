import type { SupabaseClient } from "@supabase/supabase-js";

const TABLE = "assessment_purchases";

export type PaymentMethod = "card" | "pix" | "unknown";
export type PaymentProvider = "stripe" | "abacatepay" | "unknown";

export interface PurchaseMetadata {
  productName?: string | null;
  amountCents?: number | null;
  paymentMethod?: PaymentMethod | null;
  paymentProvider?: PaymentProvider | null;
  paymentReference?: string | null;
}

export interface UserAssessmentPurchase {
  id: string;
  userId: string;
  assessmentId: string;
  stripeSessionId: string;
  productName: string | null;
  amountCents: number | null;
  paymentMethod: PaymentMethod | null;
  paymentProvider: PaymentProvider | null;
  paymentReference: string | null;
  createdAt: string;
}

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
 * Idempotente: se já existir (user_id, assessment_id), atualiza a referência e metadados.
 */
export async function recordPurchase(
  supabase: SupabaseClient,
  userId: string,
  assessmentId: string,
  stripeSessionId: string,
  metadata: PurchaseMetadata = {}
): Promise<boolean> {
  const paymentReference = metadata.paymentReference ?? stripeSessionId;
  const { error } = await supabase.from(TABLE).upsert(
    {
      user_id: userId,
      assessment_id: assessmentId,
      stripe_session_id: stripeSessionId,
      product_name: metadata.productName ?? null,
      amount_cents: metadata.amountCents ?? null,
      payment_method: metadata.paymentMethod ?? null,
      payment_provider: metadata.paymentProvider ?? null,
      payment_reference: paymentReference,
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
 * Registra compra confirmada via Checkout Transparente (AbacatePay PIX).
 * Reutiliza a mesma coluna de referência de pagamento para manter compatibilidade.
 */
export async function recordTransparentPurchase(
  supabase: SupabaseClient,
  userId: string,
  assessmentId: string,
  transparentId: string,
  metadata: Omit<PurchaseMetadata, "paymentMethod" | "paymentProvider" | "paymentReference"> = {}
): Promise<boolean> {
  return recordPurchase(supabase, userId, assessmentId, transparentId, {
    ...metadata,
    paymentMethod: "pix",
    paymentProvider: "abacatepay",
    paymentReference: transparentId,
  });
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

/**
 * Lista compras confirmadas do usuário com metadados para histórico e recibo.
 */
export async function getUserAssessmentPurchases(
  supabase: SupabaseClient,
  userId: string
): Promise<UserAssessmentPurchase[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select(
      "id, user_id, assessment_id, stripe_session_id, product_name, amount_cents, payment_method, payment_provider, payment_reference, created_at"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[assessmentPurchasesService] getUserAssessmentPurchases:", error);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    assessmentId: row.assessment_id,
    stripeSessionId: row.stripe_session_id,
    productName: row.product_name ?? null,
    amountCents: row.amount_cents ?? null,
    paymentMethod: normalizePaymentMethod(row.payment_method),
    paymentProvider: normalizePaymentProvider(row.payment_provider),
    paymentReference: row.payment_reference ?? row.stripe_session_id ?? null,
    createdAt: row.created_at,
  }));
}

function normalizePaymentMethod(value: string | null): PaymentMethod | null {
  if (value === "card" || value === "pix" || value === "unknown") return value;
  return value ? "unknown" : null;
}

function normalizePaymentProvider(value: string | null): PaymentProvider | null {
  if (value === "stripe" || value === "abacatepay" || value === "unknown") return value;
  return value ? "unknown" : null;
}
