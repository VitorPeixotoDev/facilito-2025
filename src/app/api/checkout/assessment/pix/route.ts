import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getAssessmentByIdFromCatalog } from "@/lib/assessment/assessmentCatalogService";
import { hasPurchasedAssessment } from "@/lib/assessment/assessmentPurchasesService";
import { getAssessmentPriceCents } from "@/lib/assessment/assessmentPricesService";

const ABACATEPAY_BASE_URL = process.env.ABACATEPAY_BASE_URL || "https://api.abacatepay.com/v1";

interface AbacatePayEnvelope<T> {
  data: T;
  success: boolean;
  error: unknown;
}

interface TransparentCreateData {
  id: string;
  brCode: string;
  brCodeBase64: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const assessmentId = body?.assessmentId as string | undefined;
    const taxIdRaw = body?.taxId as string | undefined;
    const taxId = (taxIdRaw ?? "").replace(/\D/g, "");

    if (!assessmentId) {
      return NextResponse.json(
        { error: "assessmentId é obrigatório" },
        { status: 400 }
      );
    }

    if (!taxId) {
      return NextResponse.json(
        { error: "CPF é obrigatório para pagamento via Pix" },
        { status: 400 }
      );
    }
    if (taxId.length !== 11) {
      return NextResponse.json(
        { error: "CPF inválido. Informe 11 dígitos." },
        { status: 400 }
      );
    }

    const assessment = await getAssessmentByIdFromCatalog(supabase, assessmentId);
    if (!assessment) {
      return NextResponse.json(
        { error: "Avaliação não encontrada" },
        { status: 404 }
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

    const apiKey = process.env.ABACATEPAY_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ABACATEPAY_API_KEY não configurada" },
        { status: 500 }
      );
    }

    const { data: accountUser } = await supabase
      .from("users")
      .select("full_name, email, whatsapp")
      .eq("id", user.id)
      .maybeSingle();

    const customerName =
      accountUser?.full_name || user.user_metadata?.full_name || "Cliente Facilitô";
    const customerEmail = accountUser?.email || user.email;
    const customerCellphone = (accountUser?.whatsapp ?? "").replace(/\D/g, "");

    if (!customerEmail) {
      return NextResponse.json(
        { error: "Email do usuário não encontrado para gerar o Pix" },
        { status: 400 }
      );
    }

    if (!customerCellphone) {
      return NextResponse.json(
        { error: "Telefone do usuário não encontrado para gerar o Pix" },
        { status: 400 }
      );
    }
    const amount = await getAssessmentPriceCents(supabase, assessmentId);
    const externalId = `${assessmentId}:${user.id}`;

    const abacateResponse = await fetch(
      `${ABACATEPAY_BASE_URL}/pixQrCode/create`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          amount,
          description: `Teste de Fit Cultural ${assessment.name} - Facilitô!`,
          customer: {
            name: customerName,
            email: customerEmail,
            cellphone: customerCellphone,
            taxId,
          },
          metadata: {
            assessmentId,
            userId: user.id,
          },
          externalId,
        }),
      }
    );

    const payload =
      (await abacateResponse.json().catch(() => null)) as AbacatePayEnvelope<TransparentCreateData> | null;

    if (!abacateResponse.ok || !payload?.success || !payload?.data?.id) {
      console.error("[abacatepay/pixQrCode/create] falha", {
        status: abacateResponse.status,
        error: payload?.error ?? null,
      });
      return NextResponse.json(
        {
          error: "Falha ao criar cobrança PIX",
          details: payload?.error ?? null,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      id: payload.data.id,
      brCode: payload.data.brCode,
      brCodeBase64: payload.data.brCodeBase64,
      assessmentId,
    });
  } catch (error) {
    console.error("[checkout/assessment/pix]", error);
    return NextResponse.json(
      { error: "Erro ao iniciar checkout Pix" },
      { status: 500 }
    );
  }
}
