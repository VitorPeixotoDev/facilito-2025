import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
  hasPurchasedAssessment,
  recordTransparentPurchase,
} from "@/lib/assessment/assessmentPurchasesService";

const ABACATEPAY_BASE_URL = process.env.ABACATEPAY_BASE_URL || "https://api.abacatepay.com/v1";

interface AbacatePayEnvelope<T> {
  data: T;
  success: boolean;
  error: unknown;
}

interface TransparentCheckData {
  status: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const transparentId = body?.transparentId as string | undefined;
    const assessmentId = body?.assessmentId as string | undefined;

    if (!transparentId || !assessmentId) {
      return NextResponse.json(
        { error: "transparentId e assessmentId são obrigatórios" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const alreadyPurchased = await hasPurchasedAssessment(
      supabase,
      user.id,
      assessmentId
    );
    if (alreadyPurchased) {
      return NextResponse.json({ status: "PAID", paid: true });
    }

    const apiKey = process.env.ABACATEPAY_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ABACATEPAY_API_KEY não configurada" },
        { status: 500 }
      );
    }

    const url = new URL(`${ABACATEPAY_BASE_URL}/pixQrCode/check`);
    url.searchParams.set("id", transparentId);

    const abacateResponse = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      cache: "no-store",
    });

    const payload =
      (await abacateResponse.json().catch(() => null)) as AbacatePayEnvelope<TransparentCheckData> | null;

    if (!abacateResponse.ok || !payload?.success || !payload?.data?.status) {
      return NextResponse.json(
        { error: "Falha ao verificar status do Pix", details: payload?.error ?? null },
        { status: 502 }
      );
    }

    const status = String(payload.data.status).toUpperCase();
    if (status === "PAID") {
      const persisted = await recordTransparentPurchase(
        supabase,
        user.id,
        assessmentId,
        transparentId
      );

      if (!persisted) {
        return NextResponse.json(
          { error: "Pagamento confirmado, mas falha ao registrar compra" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ status, paid: status === "PAID" });
  } catch (error) {
    console.error("[checkout/assessment/pix/check]", error);
    return NextResponse.json(
      { error: "Erro ao verificar pagamento Pix" },
      { status: 500 }
    );
  }
}
