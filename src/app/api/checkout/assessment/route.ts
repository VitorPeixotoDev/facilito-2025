import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/utils/supabase/server";
import { getAssessmentByIdFromCatalog } from "@/lib/assessment/assessmentCatalogService";
import { getURL } from "@/utils/get-url";
import { hasPurchasedAssessment } from "@/lib/assessment/assessmentPurchasesService";
import { getAssessmentPriceCents } from "@/lib/assessment/assessmentPricesService";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const assessmentId = body?.assessmentId as string | undefined;

    if (!assessmentId) {
      return NextResponse.json(
        { error: "assessmentId é obrigatório" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const assessment = await getAssessmentByIdFromCatalog(supabase, assessmentId);
    if (!assessment) {
      return NextResponse.json(
        { error: "Avaliação não encontrada" },
        { status: 404 }
      );
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Faça login para comprar uma avaliação" },
        { status: 401 }
      );
    }

    const alreadyPurchased = await hasPurchasedAssessment(
      supabase,
      user.id,
      assessmentId
    );
    if (alreadyPurchased) {
      return NextResponse.json(
        { error: "Você já possui esta avaliação", alreadyPurchased: true },
        { status: 400 }
      );
    }

    const priceCents = await getAssessmentPriceCents(supabase, assessmentId);

    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) {
      console.error("STRIPE_SECRET_KEY não configurada");
      return NextResponse.json(
        { error: "Pagamento temporariamente indisponível" },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeSecret);
    const baseUrl = getURL().replace(/\/$/, "");

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "brl",
            unit_amount: priceCents,
            product_data: {
              name: assessment.name,
              description: assessment.description || "Avaliação paga - Facilitô! Vagas",
              images: assessment.image ? [`${baseUrl}${assessment.image}`] : undefined,
            },
          },
        },
      ],
      success_url: `${baseUrl}/applicant/shop/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/applicant/shop`,
      client_reference_id: user.id,
      metadata: {
        user_id: user.id,
        assessment_id: assessmentId,
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Erro ao criar sessão de pagamento" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[checkout/assessment]", error);
    return NextResponse.json(
      { error: "Erro ao processar solicitação" },
      { status: 500 }
    );
  }
}
