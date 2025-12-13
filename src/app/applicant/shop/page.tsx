import { ShopHeader } from "@/components/applicant/shop/ShopHeader";
import { AssessmentsList } from "@/components/assessment";

/**
 * Página de Carreira (Shop)
 * 
 * Exibe as avaliações disponíveis para o usuário completar.
 * As avaliações ajudam a descobrir o perfil profissional e melhorar o fit cultural.
 * 
 * @see /docs/ASSESSMENT/ASSESSMENTS_README.md para mais informações sobre o sistema de avaliações
 */
export default function ShopPage() {
    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            <ShopHeader />

            <div className="max-w-4xl mx-auto p-4 lg:p-6">
                <AssessmentsList category="avaliacoes" />
            </div>
        </div>
    );
}
