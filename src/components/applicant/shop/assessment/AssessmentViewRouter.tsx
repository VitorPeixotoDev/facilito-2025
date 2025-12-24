"use client";

import FiveMindInstructions from "@/components/assessment/FiveMindInstructions";
import FiveMindQuestionnaire from "@/components/assessment/FiveMindQuestionnaire";
import FiveMindResults from "@/components/assessment/FiveMindResults";
import HexaMindInstructions from "@/components/assessment/HexaMindInstructions";
import HexaMindQuestionnaire from "@/components/assessment/HexaMindQuestionnaire";
import HexaMindResults from "@/components/assessment/HexaMindResults";
import type { AssessmentResult, FiveMindResult, HexaMindResult } from "@/types/assessments";

type AssessmentView = "instructions" | "questionnaire" | "results";

interface AssessmentViewRouterProps {
    assessmentId: string;
    currentView: AssessmentView;
    results: AssessmentResult | null;
    assessmentImage?: string;
    onStart: () => void;
    onComplete: (result: AssessmentResult) => void;
    onRestart: () => void;
    onCancel: () => void;
    onViewSuggestions?: () => void;
    hasAuthorizedCompetencies?: boolean;
    onBackToShop?: () => void;
}

/**
 * Componente que roteia as diferentes views da avaliação
 * baseado no assessmentId e currentView
 */
export function AssessmentViewRouter({
    assessmentId,
    currentView,
    results,
    assessmentImage,
    onStart,
    onComplete,
    onRestart,
    onCancel,
    onViewSuggestions,
    hasAuthorizedCompetencies = false,
    onBackToShop,
}: AssessmentViewRouterProps) {
    // FiveMind Views
    if (assessmentId === "five-mind") {
        if (currentView === "instructions") {
            return (
                <FiveMindInstructions
                    onStart={onStart}
                    onCancel={onCancel}
                    image={assessmentImage}
                />
            );
        }

        if (currentView === "questionnaire") {
            return <FiveMindQuestionnaire onComplete={onComplete} onCancel={onCancel} />;
        }

        if (currentView === "results" && results) {
            return (
                <FiveMindResults
                    results={results as FiveMindResult}
                    onRestart={onRestart}
                    onViewSuggestions={onViewSuggestions}
                    hasAuthorizedCompetencies={hasAuthorizedCompetencies}
                    onBackToShop={onBackToShop}
                />
            );
        }
    }

    // HexaMind Views
    if (assessmentId === "hexa-mind") {
        if (currentView === "instructions") {
            return (
                <HexaMindInstructions
                    onStart={onStart}
                    onCancel={onCancel}
                    image={assessmentImage}
                />
            );
        }

        if (currentView === "questionnaire") {
            return <HexaMindQuestionnaire onComplete={onComplete} onCancel={onCancel} />;
        }

        if (currentView === "results" && results) {
            return (
                <HexaMindResults
                    results={results as HexaMindResult}
                    onRestart={onRestart}
                    onViewSuggestions={onViewSuggestions}
                    hasAuthorizedCompetencies={hasAuthorizedCompetencies}
                    onBackToShop={onBackToShop}
                />
            );
        }
    }

    return null;
}

