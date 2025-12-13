/**
 * Configuração centralizada de todas as avaliações disponíveis
 */

import type { AssessmentConfig } from '@/types/assessments';
import { ClipboardCheck } from 'lucide-react';

export const ASSESSMENTS_CONFIG: AssessmentConfig[] = [
    {
        id: 'five-mind',
        name: 'FiveMind',
        image: '/blue_head_lito.png',
        description: 'Teste de Fit Cultural.',
        estimatedTime: '5-7 minutos',
        questionCount: 20,
        category: 'avaliacoes',
    },
    {
        id: 'hexa-mind',
        name: 'HexaMind',
        image: '/orange_head_lito.png',
        description: 'Teste de 6 Fatores de Personalidade para fit profissional.',
        estimatedTime: '10 minutos',
        questionCount: 40,
        category: 'avaliacoes',
    },
    // Adicione mais avaliações aqui no futuro
];

/**
 * Busca uma avaliação por ID
 */
export function getAssessmentById(id: string): AssessmentConfig | undefined {
    return ASSESSMENTS_CONFIG.find(assessment => assessment.id === id);
}

/**
 * Busca avaliações por categoria
 */
export function getAssessmentsByCategory(category: string): AssessmentConfig[] {
    return ASSESSMENTS_CONFIG.filter(assessment => assessment.category === category);
}

