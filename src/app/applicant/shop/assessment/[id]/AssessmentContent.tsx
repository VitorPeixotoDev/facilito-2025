"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthClientProvider";
import { getLatestResult, saveResults } from "@/lib/assessment/resultsStorage";
import { AssessmentHeader } from "@/components/applicant/shop/assessment/AssessmentHeader";
import { AssessmentViewRouter } from "@/components/applicant/shop/assessment/AssessmentViewRouter";
import CompetencySuggestionModal from "@/components/assessment/CompetencySuggestionModal";
import NoCompetenciesSuggestionsMessage from "@/components/assessment/NoCompetenciesSuggestionsMessage";
import { mapFiveMindToCompetencies, mapHexaMindToCompetencies } from "@/lib/assessment/competencyMapper";
import { saveAuthorizedCompetencies, getAuthorizedCompetencies, clearAuthorizedCompetencies } from "@/lib/assessment/authorizedCompetenciesService";
import { updateAssessmentAuthorization } from "@/lib/assessment/assessmentService";
import type { AssessmentResult, FiveMindResult, HexaMindResult } from "@/types/assessments";

type AssessmentView = "instructions" | "questionnaire" | "results";

function AssessmentContentInner() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const { user, loading: authLoading } = useAuth();
    const assessmentId = params.id as string;
    const viewParam = searchParams.get("view") as AssessmentView | null;
    const fromPaymentSuccess = searchParams.get("payment") === "success";

    const [currentView, setCurrentView] = useState<AssessmentView>("instructions");
    const [results, setResults] = useState<AssessmentResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
    const [suggestedCompetencies, setSuggestedCompetencies] = useState<string[]>([]);
    const [pendingResult, setPendingResult] = useState<AssessmentResult | null>(null);
    const [hasAuthorizedCompetencies, setHasAuthorizedCompetencies] = useState(false);
    const [isCheckingCompetencies, setIsCheckingCompetencies] = useState(false);
    const [showNoSuggestionsMessage, setShowNoSuggestionsMessage] = useState(false);
    const [assessmentData, setAssessmentData] = useState<{
        assessment: { id: string; slug: string; name: string; image?: string; description: string; estimatedTime: string; questionCount: number; category: string };
        questions: Array<{ id: string; text: string; factor: string; reverse?: boolean }>;
        scaleOptions: Array<{ value: number; label: string; emoji?: string; description?: string }>;
    } | null>(null);

    const assessment = assessmentData?.assessment ?? null;

    useEffect(() => {
        const loadAssessment = async () => {
            // Esperar auth estar pronto antes de checar usuário/compra (evita redirect para shop ao voltar do Stripe)
            if (authLoading) return;

            const res = await fetch(`/api/assessments/${assessmentId}`);
            if (!res.ok) {
                router.push("/applicant/shop");
                return;
            }
            const data = await res.json();
            setAssessmentData({
                assessment: data.assessment,
                questions: data.questions ?? [],
                scaleOptions: data.scaleOptions ?? [],
            });

            // Usuário precisa estar logado para acessar avaliação paga
            if (!user?.id) {
                router.push("/applicant/shop");
                return;
            }

            // Verificar se o usuário comprou esta avaliação (todas são pagas)
            // Se veio do payment-success, dar algumas tentativas (evitar race com a gravação da compra)
            const maxAttempts = fromPaymentSuccess ? 5 : 1;
            const delayMs = fromPaymentSuccess ? 800 : 0;
            let purchased = false;
            try {
                for (let attempt = 0; attempt < maxAttempts; attempt++) {
                    if (attempt > 0) await new Promise((r) => setTimeout(r, delayMs));
                    const purchaseRes = await fetch("/api/assessment-purchases");
                    const purchaseData = purchaseRes.ok ? await purchaseRes.json() : { assessmentIds: [] };
                    const ids = (purchaseData.assessmentIds ?? []) as string[];
                    if (ids.includes(assessmentId)) {
                        purchased = true;
                        break;
                    }
                }
                if (!purchased) {
                    router.push("/applicant/shop");
                    return;
                }
            } catch {
                router.push("/applicant/shop");
                return;
            }

            // Verificar se há view na URL e aplicar
            if (viewParam && ["instructions", "questionnaire", "results"].includes(viewParam)) {
                setCurrentView(viewParam);
            }

            // Se estiver na view de instructions ou questionnaire, não precisa carregar resultado
            if (viewParam === "instructions" || viewParam === "questionnaire") {
                setIsLoading(false);
                return;
            }

            // view=results ou sem view: carregar resultado mais recente do banco
            if (user?.id) {
                try {
                    const latestResult = await getLatestResult(assessmentId, user.id, data.assessment?.slug);
                    if (latestResult) {
                        setResults(latestResult);
                        if (!viewParam) setCurrentView("results");
                    }
                    if (viewParam === "results" && latestResult) {

                        // Se estiver na view de results, verificar se já tem competências autorizadas
                        setIsCheckingCompetencies(true);
                        const authorized = await getAuthorizedCompetencies(user.id);
                        const hasCompetencies = authorized && authorized.length > 0;
                        setHasAuthorizedCompetencies(hasCompetencies);
                        setIsCheckingCompetencies(false);

                        // Se não tiver competências autorizadas, abrir modal automaticamente
                        if (!hasCompetencies) {
                            // Calcular sugestões e abrir modal (usar slug para branching)
                            let suggestions: string[] = [];
                            const slug = latestResult.assessmentSlug ?? (latestResult.assessmentId === 'five-mind' ? 'five-mind' : latestResult.assessmentId === 'hexa-mind' ? 'hexa-mind' : null);
                            if (slug === 'five-mind') {
                                const fiveMindResult = latestResult as FiveMindResult;
                                suggestions = mapFiveMindToCompetencies(fiveMindResult.results);
                            } else if (slug === 'hexa-mind') {
                                const hexaMindResult = latestResult as HexaMindResult;
                                suggestions = mapHexaMindToCompetencies(hexaMindResult.results);
                            }

                            if (suggestions.length > 0) {
                                setSuggestedCompetencies(suggestions);
                                setPendingResult(latestResult);
                                setShowSuggestionsModal(true);
                            } else {
                                // Se não houver sugestões, mostrar mensagem
                                setShowNoSuggestionsMessage(true);
                            }
                        }
                    }
                } catch (error) {
                    console.error("Erro ao carregar resultado:", error);
                    setIsCheckingCompetencies(false);
                }
            }

            setIsLoading(false);
        };

        loadAssessment();
    }, [assessmentId, viewParam, router, user?.id, authLoading]);

    const handleStartQuestionnaire = async () => {
        // Limpar competências autorizadas ao iniciar um novo teste
        // Isso permite que o usuário selecione novas competências após completar o teste
        if (user?.id) {
            try {
                await clearAuthorizedCompetencies(user.id);
                console.log('🧹 [AssessmentContent] Competências autorizadas limpas ao iniciar novo teste');
                setHasAuthorizedCompetencies(false); // Resetar estado local
            } catch (error) {
                console.error('⚠️ [AssessmentContent] Erro ao limpar competências (não crítico):', error);
                // Não bloquear o início do questionário se houver erro ao limpar
            }
        }

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
        // Por enquanto, salva sem autorização (padrão: authorizedForSuggestions = true)
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

    const handleViewSuggestions = () => {
        if (!results) return;

        // Calcular sugestões baseadas no tipo de avaliação (usar slug para branching)
        let suggestions: string[] = [];
        const slug = results.assessmentSlug ?? (results.assessmentId === 'five-mind' ? 'five-mind' : results.assessmentId === 'hexa-mind' ? 'hexa-mind' : null);
        if (slug === 'five-mind') {
            const fiveMindResult = results as FiveMindResult;
            suggestions = mapFiveMindToCompetencies(fiveMindResult.results);
        } else if (slug === 'hexa-mind') {
            const hexaMindResult = results as HexaMindResult;
            suggestions = mapHexaMindToCompetencies(hexaMindResult.results);
        }

        if (suggestions.length === 0) {
            // Mostrar mensagem de que não há sugestões ao invés de alert
            setShowNoSuggestionsMessage(true);
            return;
        }

        setSuggestedCompetencies(suggestions);
        setPendingResult(results);
        setShowSuggestionsModal(true);
    };

    const handleAcceptSuggestions = async (selectedCompetencies: string[]) => {
        if (!user?.id || !pendingResult) return;

        try {
            console.log('💾 [AssessmentContent] Salvando competências autorizadas...');

            // Salvar competências autorizadas no perfil do usuário
            await saveAuthorizedCompetencies(user.id, selectedCompetencies);

            // Atualizar apenas os campos de autorização do resultado existente (evita duplicação)
            const expiresAt = new Date(pendingResult.completedAt.getTime() + 365 * 24 * 60 * 60 * 1000);
            const slug = pendingResult.assessmentSlug ?? (pendingResult.assessmentId === 'five-mind' ? 'five-mind' : pendingResult.assessmentId === 'hexa-mind' ? 'hexa-mind' : 'five-mind');
            const success = await updateAssessmentAuthorization(
                user.id,
                slug,
                {
                    authorizedForSuggestions: true,
                    authorizedToShowResults: false,
                    expiresAt,
                }
            );

            if (!success) {
                throw new Error('Falha ao atualizar autorização do resultado');
            }

            console.log('✅ [AssessmentContent] Competências autorizadas salvas com sucesso');

            setShowSuggestionsModal(false);
            setPendingResult(null);
            setSuggestedCompetencies([]);
            setHasAuthorizedCompetencies(true); // Marcar como tendo competências autorizadas

            // Recarregar a página para atualizar o perfil
            router.refresh();
        } catch (error) {
            console.error('❌ [AssessmentContent] Erro ao salvar competências:', error);
            alert('Erro ao salvar competências. Tente novamente.');
        }
    };

    const handleCancelSuggestions = () => {
        setShowSuggestionsModal(false);
        setPendingResult(null);
        setSuggestedCompetencies([]);
    };

    const handleRetakeTest = async () => {
        // Limpar competências autorizadas e mensagem, então redirecionar para instructions
        if (user?.id) {
            try {
                await clearAuthorizedCompetencies(user.id);
                setHasAuthorizedCompetencies(false);
            } catch (error) {
                console.error('⚠️ [AssessmentContent] Erro ao limpar competências (não crítico):', error);
            }
        }

        setShowNoSuggestionsMessage(false);
        setResults(null);
        setCurrentView("instructions");
        router.replace(`/applicant/shop/assessment/${assessmentId}?view=instructions`, {
            scroll: false,
        });
    };

    const handleRestart = async () => {
        // Limpar competências autorizadas ao reiniciar o teste
        // Isso permite que o usuário selecione novas competências após completar o teste novamente
        if (user?.id) {
            try {
                await clearAuthorizedCompetencies(user.id);
                console.log('🧹 [AssessmentContent] Competências autorizadas limpas ao reiniciar teste');
                setHasAuthorizedCompetencies(false); // Resetar estado local
            } catch (error) {
                console.error('⚠️ [AssessmentContent] Erro ao limpar competências (não crítico):', error);
                // Não bloquear o reinício se houver erro ao limpar
            }
        }

        setCurrentView("instructions");
        setResults(null);
        router.replace(`/applicant/shop/assessment/${assessmentId}?view=instructions`, {
            scroll: false,
        });
    };

    const handleBack = () => {
        // Bloquear navegação se estiver em results sem competências autorizadas
        if (currentView === "results" && !hasAuthorizedCompetencies && !isCheckingCompetencies) {
            return;
        }
        router.push("/applicant/shop");
    };

    // Prevenir navegação do browser quando estiver em results sem competências autorizadas ou mostrando mensagem
    useEffect(() => {
        if ((currentView === "results" && !hasAuthorizedCompetencies && !isCheckingCompetencies) || showNoSuggestionsMessage) {
            const handlePopState = (e: PopStateEvent) => {
                e.preventDefault();
                window.history.pushState(null, '', window.location.href);
            };

            window.history.pushState(null, '', window.location.href);
            window.addEventListener('popstate', handlePopState);

            return () => {
                window.removeEventListener('popstate', handlePopState);
            };
        }
    }, [currentView, hasAuthorizedCompetencies, isCheckingCompetencies, showNoSuggestionsMessage]);

    // Mostrar loading: sem assessment, ou carregando (e não é view=results), ou pediu view=results e ainda não tem resultado
    const waitingForResults = viewParam === "results" && results === null && isLoading;
    if (!assessment || (isLoading && !viewParam) || waitingForResults) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-[#5e9ea0]" />
                    <p className="text-sm text-slate-600">{waitingForResults ? "Carregando resultados..." : "Carregando..."}</p>
                </div>
            </div>
        );
    }

    // Determinar se deve desabilitar navegação
    // Desabilitar quando: estiver em results sem competências OU quando mostrar mensagem de sem sugestões
    const disableNavigation = (currentView === "results" && !hasAuthorizedCompetencies && !isCheckingCompetencies) || showNoSuggestionsMessage;

    return (
        <div className="min-h-screen bg-slate-50">
            <AssessmentHeader
                title={assessment.name}
                onBack={handleBack}
                disableBack={disableNavigation}
            />

            <div
                className={
                    currentView === "questionnaire" ? "p-3 sm:p-4" : "p-4 lg:p-6"
                }
            >
                {showNoSuggestionsMessage ? (
                    <NoCompetenciesSuggestionsMessage onRetakeTest={handleRetakeTest} />
                ) : currentView === "results" && !results ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                        <p className="text-slate-600">Nenhum resultado encontrado. Faça a avaliação para ver seus resultados.</p>
                        <Button onClick={handleStartQuestionnaire} className="bg-[#5e9ea0] hover:bg-[#4a8b8f] text-white">
                            Iniciar avaliação
                        </Button>
                    </div>
                ) : (
                    <AssessmentViewRouter
                        assessmentId={assessmentId}
                        assessmentSlug={assessment.slug}
                        assessmentName={assessment.name}
                        currentView={currentView}
                        results={results}
                        assessmentImage={assessment.image}
                        onStart={handleStartQuestionnaire}
                        onComplete={handleComplete}
                        onRestart={handleRestart}
                        onCancel={handleBack}
                        onViewSuggestions={currentView === 'results' && !hasAuthorizedCompetencies ? handleViewSuggestions : undefined}
                        hasAuthorizedCompetencies={currentView === 'results' ? hasAuthorizedCompetencies : false}
                        onBackToShop={handleBack}
                        questionnaireData={assessmentData ? { questions: assessmentData.questions, scaleOptions: assessmentData.scaleOptions } : undefined}
                    />
                )}
            </div>

            {/* Modal de Sugestões de Competências */}
            <CompetencySuggestionModal
                isOpen={showSuggestionsModal}
                suggestions={suggestedCompetencies}
                onAccept={handleAcceptSuggestions}
                onCancel={handleCancelSuggestions}
                disableCancel={currentView === "results" && !hasAuthorizedCompetencies}
            />
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
