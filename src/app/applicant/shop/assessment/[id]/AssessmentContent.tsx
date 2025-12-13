"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/components/AuthClientProvider";
import { getAssessmentById } from "@/lib/assessment/assessmentsConfig";
import { getLatestResult, saveResults } from "@/lib/assessment/resultsStorage";
import { AssessmentHeader } from "@/components/applicant/shop/assessment/AssessmentHeader";
import { AssessmentViewRouter } from "@/components/applicant/shop/assessment/AssessmentViewRouter";
import type { AssessmentResult } from "@/types/assessments";

type AssessmentView = "instructions" | "questionnaire" | "results";

function AssessmentContentInner() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const { user, loading: authLoading } = useAuth();
    const assessmentId = params.id as string;
    const viewParam = searchParams.get("view") as AssessmentView | null;

    const [currentView, setCurrentView] = useState<AssessmentView>("instructions");
    const [results, setResults] = useState<AssessmentResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const assessment = useMemo(() => {
        return getAssessmentById(assessmentId);
    }, [assessmentId]);

    useEffect(() => {
        const loadAssessment = async () => {
            if (!assessment) {
                router.push("/applicant/shop");
                return;
            }

            // Verificar se há view na URL (não precisa esperar auth)
            if (viewParam && ["instructions", "questionnaire", "results"].includes(viewParam)) {
                setCurrentView(viewParam);
            }

            // Se estiver na view de instructions ou questionnaire, não precisa esperar auth
            if (viewParam === "instructions" || viewParam === "questionnaire") {
                setIsLoading(false);
                return;
            }

            // Verificar se já existe resultado no banco de dados (só se tiver user)
            if (user?.id) {
                try {
                    const latestResult = await getLatestResult(assessmentId, user.id);
                    if (latestResult && !viewParam) {
                        setResults(latestResult);
                        setCurrentView("results");
                    } else if (viewParam === "results" && latestResult) {
                        setResults(latestResult);
                    }
                } catch (error) {
                    console.error("Erro ao carregar resultado:", error);
                }
            }

            setIsLoading(false);
        };

        // Não bloquear por authLoading - carregar imediatamente
        loadAssessment();
    }, [assessment, assessmentId, viewParam, router, user?.id]);

    const handleStartQuestionnaire = () => {
        setCurrentView("questionnaire");
        router.replace(`/applicant/shop/assessment/${assessmentId}?view=questionnaire`, {
            scroll: false,
        });
    };

    const handleComplete = async (resultData: AssessmentResult) => {
        console.log("🔄 [AssessmentContent] handleComplete chamado");
        console.log("📊 Resultado recebido:", resultData);
        console.log("👤 User ID:", user?.id);

        if (!user?.id) {
            console.error("❌ [AssessmentContent] Usuário não autenticado!");
            alert("Erro: Você precisa estar autenticado para salvar os resultados.");
            return;
        }

        setResults(resultData);
        setCurrentView("results");

        // Salvar APENAS no banco de dados (tabelas específicas: five_mind_results ou hexa_mind_results)
        // O trigger SQL automaticamente atualiza users.profile_analysis com características convertidas
        try {
            console.log("💾 [AssessmentContent] Iniciando salvamento...");
            await saveResults(user.id, resultData);
            console.log("✅ [AssessmentContent] Salvamento concluído com sucesso");
            router.replace(`/applicant/shop/assessment/${assessmentId}?view=results`, {
                scroll: false,
            });
        } catch (error) {
            console.error("❌ [AssessmentContent] Erro ao salvar resultados:", error);
            console.error("❌ [AssessmentContent] Detalhes do erro:", {
                message: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
            });
            alert("Erro ao salvar resultados. Verifique o console para mais detalhes.");
        }
    };

    const handleRestart = () => {
        setCurrentView("instructions");
        setResults(null);
        router.replace(`/applicant/shop/assessment/${assessmentId}?view=instructions`, {
            scroll: false,
        });
    };

    const handleBack = () => {
        router.push("/applicant/shop");
    };

    // Mostrar loading apenas se não tiver assessment ou se estiver realmente carregando
    if (!assessment || (isLoading && !viewParam)) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-[#5e9ea0]" />
                    <p className="text-sm text-slate-600">Carregando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <AssessmentHeader title={assessment.name} onBack={handleBack} />

            <div
                className={
                    currentView === "questionnaire" ? "p-3 sm:p-4" : "p-4 lg:p-6"
                }
            >
                <AssessmentViewRouter
                    assessmentId={assessmentId}
                    currentView={currentView}
                    results={results}
                    assessmentImage={assessment.image}
                    onStart={handleStartQuestionnaire}
                    onComplete={handleComplete}
                    onRestart={handleRestart}
                    onCancel={handleBack}
                />
            </div>
        </div>
    );
}

export default function AssessmentContent() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-[#5e9ea0]" />
                        <p className="text-sm text-slate-600">Carregando...</p>
                    </div>
                </div>
            }
        >
            <AssessmentContentInner />
        </Suspense>
    );
}
