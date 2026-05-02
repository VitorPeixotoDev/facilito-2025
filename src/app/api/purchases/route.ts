import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getAssessmentsFromCatalog } from "@/lib/assessment/assessmentCatalogService";
import { getAllAssessmentPrices } from "@/lib/assessment/assessmentPricesService";
import { getUserAssessmentPurchases } from "@/lib/assessment/assessmentPurchasesService";
import type { PurchaseHistoryItem } from "@/lib/purchases/types";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const [purchases, assessments, prices] = await Promise.all([
      getUserAssessmentPurchases(supabase, user.id),
      getAssessmentsFromCatalog(supabase),
      getAllAssessmentPrices(supabase),
    ]);

    const assessmentsById = new Map(assessments.map((assessment) => [assessment.id, assessment]));

    const items: PurchaseHistoryItem[] = purchases.map((purchase) => {
      const assessment = assessmentsById.get(purchase.assessmentId);
      return {
        id: purchase.id,
        productName: purchase.productName ?? assessment?.name ?? "Avaliação Facilitô",
        productType: "assessment",
        purchasedAt: purchase.createdAt,
        amountCents: purchase.amountCents ?? prices[purchase.assessmentId] ?? null,
        paymentMethod: purchase.paymentMethod ?? "unknown",
        paymentProvider: purchase.paymentProvider ?? "unknown",
        paymentReference: purchase.paymentReference,
        accessUrl: `/applicant/shop/assessment/${purchase.assessmentId}?view=instructions`,
      };
    });

    return NextResponse.json({ purchases: items });
  } catch (error) {
    console.error("[purchases]", error);
    return NextResponse.json(
      { error: "Erro ao carregar histórico de compras" },
      { status: 500 }
    );
  }
}
