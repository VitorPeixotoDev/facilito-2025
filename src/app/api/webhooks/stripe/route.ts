import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceRoleClient } from "@/utils/supabase/admin";
import { recordPurchase } from "@/lib/assessment/assessmentPurchasesService";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  if (!webhookSecret) {
    console.error("[webhooks/stripe] STRIPE_WEBHOOK_SECRET não configurada");
    return NextResponse.json(
      { error: "Webhook não configurado" },
      { status: 500 }
    );
  }

  let body: string;
  try {
    body = await request.text();
  } catch (e) {
    console.error("[webhooks/stripe] Erro ao ler body:", e);
    return NextResponse.json(
      { error: "Body inválido" },
      { status: 400 }
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature" },
      { status: 400 }
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[webhooks/stripe] Assinatura inválida:", message);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 }
    );
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  if (session.payment_status !== "paid") {
    return NextResponse.json({ received: true });
  }

  const userId = session.metadata?.user_id ?? session.client_reference_id;
  const assessmentId = session.metadata?.assessment_id;

  if (!userId || !assessmentId) {
    console.error("[webhooks/stripe] metadata incompleto:", session.metadata);
    return NextResponse.json(
      { error: "Metadata incompleto" },
      { status: 400 }
    );
  }

  const supabase = createServiceRoleClient();
  const ok = await recordPurchase(
    supabase,
    userId,
    assessmentId,
    session.id
  );

  if (!ok) {
    console.error("[webhooks/stripe] recordPurchase falhou para", { userId, assessmentId });
    return NextResponse.json(
      { error: "Falha ao registrar compra" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
