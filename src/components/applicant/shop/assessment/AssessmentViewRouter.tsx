"use client";

import FiveMindInstructions from "@/components/assessment/FiveMindInstructions";
import FiveMindQuestionnaire from "@/components/assessment/FiveMindQuestionnaire";
import FiveMindResults from "@/components/assessment/FiveMindResults";
import HexaMindInstructions from "@/components/assessment/HexaMindInstructions";
import HexaMindQuestionnaire from "@/components/assessment/HexaMindQuestionnaire";
import HexaMindResults from "@/components/assessment/HexaMindResults";
import type { AssessmentResult, FiveMindResult, HexaMindResult } from "@/types/assessments";

type AssessmentView = "instructions" | "questionnaire" | "results";

export interface QuestionnaireData {
    questions: Array<{ id: string; text: string; factor: string; reverse?: boolean }>;
    scaleOptions: Array<{ value: number; label: string; emoji?: string; description?: string }>;
}

interface AssessmentViewRouterProps {
    assessmentId: string;
    /** Slug para rotear FiveMind vs HexaMind ('five-mind' | 'hexa-mind'). */
    assessmentSlug: string;
    assessmentName?: string;
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
    questionnaireData?: QuestionnaireData;
}

/**
 * Componente que roteia as diferentes views da avaliação
 * baseado no assessmentId e currentView
 */
export function AssessmentViewRouter({
    assessmentId,
    assessmentSlug,
    assessmentName,
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
    questionnaireData,
}: AssessmentViewRouterProps) {
    // FiveMind Views
    if (assessmentSlug === "five-mind") {
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
            return (
                <FiveMindQuestionnaire
                    assessmentId={assessmentId}
                    assessmentName={assessmentName ?? "FiveMind"}
                    onComplete={onComplete}
                    onCancel={onCancel}
                    questions={questionnaireData?.questions}
                    scaleOptions={questionnaireData?.scaleOptions}
                />
            );
        }

        if (currentView === "results") {
            if (results) {
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
            return null;
        }
    }

    // HexaMind Views
    if (assessmentSlug === "hexa-mind") {
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
            return (
                <HexaMindQuestionnaire
                    assessmentId={assessmentId}
                    assessmentName={assessmentName ?? "HexaMind"}
                    onComplete={onComplete}
                    onCancel={onCancel}
                    questions={questionnaireData?.questions}
                    scaleOptions={questionnaireData?.scaleOptions}
                />
            );
        }

        if (currentView === "results") {
            if (results) {
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
            return null;
        }
    }

    return null;
}

