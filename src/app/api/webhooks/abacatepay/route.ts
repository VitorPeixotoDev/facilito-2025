import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/utils/supabase/admin";
import { recordTransparentPurchase } from "@/lib/assessment/assessmentPurchasesService";
import { getAssessmentByIdFromCatalog } from "@/lib/assessment/assessmentCatalogService";
import { getAssessmentPriceCents } from "@/lib/assessment/assessmentPricesService";

type GenericPayload = {
  event?: string;
  data?: {
    id?: string;
    status?: string;
    metadata?: {
      assessmentId?: string;
      userId?: string;
    };
  };
};

function getSignature(request: NextRequest): string | null {
  return (
    request.headers.get("x-abacatepay-signature") ||
    request.headers.get("abacatepay-signature") ||
    request.headers.get("x-signature")
  );
}

function isValidSignature(rawBody: string, signature: string, secret: string): boolean {
  const digest = createHmac("sha256", secret).update(rawBody).digest("hex");
  const received = signature.trim();
  if (digest.length !== received.length) return false;
  return timingSafeEqual(Buffer.from(digest), Buffer.from(received));
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.ABACATEPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook não configurado" }, { status: 500 });
  }

  const signature = getSignature(request);
  if (!signature) {
    return NextResponse.json({ error: "Assinatura ausente" }, { status: 400 });
  }

  const rawBody = await request.text();
  if (!isValidSignature(rawBody, signature, webhookSecret)) {
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 });
  }

  let payload: GenericPayload;
  try {
    payload = JSON.parse(rawBody) as GenericPayload;
  } catch {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  const eventName = String(payload.event ?? "");
  const status = String(payload.data?.status ?? "").toUpperCase();
  const isPaidEvent =
    eventName === "transparent.completed" || eventName === "pixQrCode.completed" || status === "PAID";

  if (!isPaidEvent) {
    return NextResponse.json({ received: true });
  }

  const userId = payload.data?.metadata?.userId;
  const assessmentId = payload.data?.metadata?.assessmentId;
  const paymentId = payload.data?.id;

  if (!userId || !assessmentId || !paymentId) {
    return NextResponse.json({ error: "Metadata incompleto no webhook" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  const assessment = await getAssessmentByIdFromCatalog(supabase, assessmentId);
  const amountCents = await getAssessmentPriceCents(supabase, assessmentId);
  const ok = await recordTransparentPurchase(
    supabase,
    userId,
    assessmentId,
    paymentId,
    {
      productName: assessment?.name ?? "Avaliação Facilitô",
      amountCents,
    }
  );
  if (!ok) {
    return NextResponse.json({ error: "Falha ao registrar compra" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
