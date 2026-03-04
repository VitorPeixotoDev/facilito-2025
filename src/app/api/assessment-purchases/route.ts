import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getPurchasedAssessmentIds } from "@/lib/assessment/assessmentPurchasesService";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    const assessmentIds = await getPurchasedAssessmentIds(supabase, user.id);
    return NextResponse.json({ assessmentIds });
  } catch (error) {
    console.error("[assessment-purchases]", error);
    return NextResponse.json(
      { error: "Erro ao carregar compras" },
      { status: 500 }
    );
  }
}
