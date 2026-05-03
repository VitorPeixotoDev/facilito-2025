import { redirect } from "next/navigation";
import { PurchasesPageClient } from "@/components/applicant/purchases/PurchasesPageClient";
import { createClient } from "@/utils/supabase/server";
import { isValidUserApp } from "@/utils/auth/appType";

export const metadata = {
  title: "Minhas compras | Facilitô! Vagas",
  description: "Histórico de compras confirmadas do usuário.",
};

export default async function PurchasesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isValidUserApp(user)) {
    redirect("/login");
  }

  return <PurchasesPageClient />;
}
