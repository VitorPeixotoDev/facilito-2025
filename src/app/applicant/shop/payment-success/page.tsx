import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import Stripe from "stripe";
import { recordPurchase } from "@/lib/assessment/assessmentPurchasesService";
import { getAssessmentByIdFromCatalog } from "@/lib/assessment/assessmentCatalogService";
import { getAssessmentPriceCents } from "@/lib/assessment/assessmentPricesService";
export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  if (!session_id) {
    redirect("/applicant/shop");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) {
    redirect("/applicant/shop?payment=error");
  }

  const stripe = new Stripe(stripeSecret);

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["payment_intent"],
    });
  } catch (e) {
    console.error("[payment-success] Stripe retrieve error:", e);
    redirect("/applicant/shop?payment=error");
  }

  if (session.payment_status !== "paid") {
    redirect("/applicant/shop?payment=cancelled");
  }

  const userId = session.metadata?.user_id ?? session.client_reference_id;
  const assessmentId = session.metadata?.assessment_id;

  if (!userId || userId !== user.id || !assessmentId) {
    redirect("/applicant/shop?payment=error");
  }

  const assessment = await getAssessmentByIdFromCatalog(supabase, assessmentId);
  const fallbackAmountCents = await getAssessmentPriceCents(supabase, assessmentId);
  const amountCents = session.amount_total ?? fallbackAmountCents;

  const ok = await recordPurchase(
    supabase,
    userId,
    assessmentId,
    session.id,
    {
      productName: assessment?.name ?? "Avaliação Facilitô",
      amountCents,
      paymentMethod: "card",
      paymentProvider: "stripe",
      paymentReference: session.id,
    }
  );

  if (!ok) {
    redirect("/applicant/shop?payment=error");
  }

  // Sempre redirecionar para a página da avaliação (não para carreiras)
  redirect(`/applicant/shop/assessment/${assessmentId}?view=instructions&payment=success`);
}
