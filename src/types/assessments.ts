/**
 * Tipos e interfaces para o sistema de avaliações
 */

export interface AssessmentResult {
    assessmentId: string;
    assessmentName: string;
    completedAt: Date;
    score?: number;
    results: Record<string, any>;
}

export interface AssessmentQuestion {
    id: string;
    text: string;
    category?: string;
    required?: boolean;
}

export interface AssessmentConfig {
    id: string;
    name: string;
    description: string;
    icon?: string;
    image?: string;
    estimatedTime: string;
    questionCount: number;
    category: string;
}

export interface FiveMindResult extends AssessmentResult {
    assessmentId: 'five-mind';
    assessmentName: 'FiveMind';
    results: {
        openness: number;
        conscientiousness: number;
        extraversion: number;
        agreeableness: number;
        neuroticism: number;
        overallScore: number;
    };
}

export interface HexaMindResult extends AssessmentResult {
    assessmentId: 'hexa-mind';
    assessmentName: 'HexaMind';
    results: {
        honesty: number;
        emotional_stability: number;
        extraversion: number;
        agreeableness: number;
        conscientiousness: number;
        openness: number;
        consistency: number;
        overallScore: number;
        responseConsistency: number;
    };
}

export interface AssessmentComponentProps {
    onComplete: (result: AssessmentResult) => void;
    onCancel?: () => void;
}

