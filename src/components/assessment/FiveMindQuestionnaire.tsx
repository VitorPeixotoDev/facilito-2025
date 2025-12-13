"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { AssessmentComponentProps, FiveMindResult } from '@/types/assessments';

interface Question {
    id: string;
    text: string;
    factor: 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism';
    reverse?: boolean;
}

const QUESTIONS: Question[] = [
    // Openness (4 questões)
    { id: 'o1', text: 'Tenho uma imaginação vívida', factor: 'openness' },
    { id: 'o2', text: 'Tenho pouco interesse em ideias abstratas', factor: 'openness', reverse: true },
    { id: 'o3', text: 'Não sou uma pessoa criativa', factor: 'openness', reverse: true },
    { id: 'o4', text: 'Tenho facilidade para entender ideias complexas', factor: 'openness' },

    // Conscientiousness (4 questões)
    { id: 'c1', text: 'Sou sempre preparado', factor: 'conscientiousness' },
    { id: 'c2', text: 'Deixo minhas coisas espalhadas', factor: 'conscientiousness', reverse: true },
    { id: 'c3', text: 'Presto atenção aos detalhes', factor: 'conscientiousness' },
    { id: 'c4', text: 'Esqueço de devolver as coisas ao lugar', factor: 'conscientiousness', reverse: true },

    // Extraversion (4 questões)
    { id: 'e1', text: 'Sou a vida da festa', factor: 'extraversion' },
    { id: 'e2', text: 'Não falo muito', factor: 'extraversion', reverse: true },
    { id: 'e3', text: 'Sinto-me confortável com as pessoas', factor: 'extraversion' },
    { id: 'e4', text: 'Mantenho-me em segundo plano', factor: 'extraversion', reverse: true },

    // Agreeableness (4 questões)
    { id: 'a1', text: 'Interesso-me pelas pessoas', factor: 'agreeableness' },
    { id: 'a2', text: 'Sinto pouco interesse pelos outros', factor: 'agreeableness', reverse: true },
    { id: 'a3', text: 'Tenho um coração mole', factor: 'agreeableness' },
    { id: 'a4', text: 'Não estou interessado nos problemas dos outros', factor: 'agreeableness', reverse: true },

    // Neuroticism (4 questões)
    { id: 'n1', text: 'Fico estressado facilmente', factor: 'neuroticism' },
    { id: 'n2', text: 'Raramente fico triste', factor: 'neuroticism', reverse: true },
    { id: 'n3', text: 'Preocupo-me com as coisas', factor: 'neuroticism' },
    { id: 'n4', text: 'Sou relaxado na maior parte do tempo', factor: 'neuroticism', reverse: true },
];

const SCALE_OPTIONS = [
    { value: 1, label: 'Discordo totalmente', emoji: '🙅' },
    { value: 2, label: 'Discordo', emoji: '👎' },
    { value: 3, label: 'Neutro', emoji: '😐' },
    { value: 4, label: 'Concordo', emoji: '👍' },
    { value: 5, label: 'Concordo totalmente', emoji: '💯' },
];

export default function FiveMindQuestionnaire({ onComplete, onCancel }: AssessmentComponentProps) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<Record<string, number>>({});

    const question = QUESTIONS[currentQuestion];
    const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;
    const isLastQuestion = currentQuestion === QUESTIONS.length - 1;
    const canProceed = answers[question.id] !== undefined;

    const handleAnswer = (value: number) => {
        setAnswers(prev => ({ ...prev, [question.id]: value }));
    };

    const handleNext = () => {
        if (isLastQuestion) {
            calculateResults();
        } else {
            setCurrentQuestion(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(prev => prev - 1);
        }
    };

    const calculateResults = () => {
        const factors = {
            openness: [] as number[],
            conscientiousness: [] as number[],
            extraversion: [] as number[],
            agreeableness: [] as number[],
            neuroticism: [] as number[],
        };

        QUESTIONS.forEach(q => {
            let value = answers[q.id] || 3;
            if (q.reverse) {
                value = 6 - value; // Inverter escala 1-5
            }
            factors[q.factor].push(value);
        });

        const calculateAverage = (values: number[]) =>
            values.reduce((sum, val) => sum + val, 0) / values.length;

        const results: FiveMindResult = {
            assessmentId: 'five-mind',
            assessmentName: 'FiveMind',
            completedAt: new Date(),
            results: {
                openness: Math.round(calculateAverage(factors.openness) * 10) / 10,
                conscientiousness: Math.round(calculateAverage(factors.conscientiousness) * 10) / 10,
                extraversion: Math.round(calculateAverage(factors.extraversion) * 10) / 10,
                agreeableness: Math.round(calculateAverage(factors.agreeableness) * 10) / 10,
                neuroticism: Math.round(calculateAverage(factors.neuroticism) * 10) / 10,
                overallScore: Math.round(
                    (calculateAverage(factors.openness) +
                        calculateAverage(factors.conscientiousness) +
                        calculateAverage(factors.extraversion) +
                        calculateAverage(factors.agreeableness) +
                        (5 - calculateAverage(factors.neuroticism))) / 5 * 10
                ) / 10,
            },
        };

        console.log('📋 [FiveMindQuestionnaire] Resultados calculados:', results);
        console.log('📤 [FiveMindQuestionnaire] Chamando onComplete...');
        onComplete(results);
        console.log('✅ [FiveMindQuestionnaire] onComplete chamado');
    };

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] sm:h-[calc(100vh-120px)] lg:h-auto lg:max-h-[600px]">
            {/* Barra de progresso - compacta */}
            <div className="mb-2 sm:mb-3 flex-shrink-0">
                <div className="w-full bg-slate-200 rounded-full h-1 sm:h-1.5 mb-1">
                    <div
                        className="bg-[#5e9ea0] h-1 sm:h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="text-xs text-slate-600 text-center">
                    {currentQuestion + 1} de {QUESTIONS.length}
                </div>
            </div>

            {/* Afirmação - compacta no topo */}
            <div className="mb-3 sm:mb-4 flex-shrink-0">
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 leading-tight">
                    {question.text}
                </h3>
            </div>

            {/* Opções de resposta - ocupam o espaço disponível */}
            <div className="flex-1 overflow-y-auto space-y-2 mb-3 sm:mb-4 min-h-0">
                {SCALE_OPTIONS.map((option) => {
                    const isSelected = answers[question.id] === option.value;
                    return (
                        <button
                            key={option.value}
                            onClick={() => handleAnswer(option.value)}
                            className={`w-full p-2.5 sm:p-3 rounded-lg border-2 transition-all text-left active:scale-[0.98] ${isSelected
                                ? 'border-[#5e9ea0] bg-[#f0f7f8]'
                                : 'border-slate-200 active:border-slate-300 bg-white'
                                }`}
                        >
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div
                                    className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-md font-semibold text-xs sm:text-sm flex-shrink-0 ${isSelected
                                        ? 'bg-[#5e9ea0] text-white'
                                        : 'bg-slate-100 text-slate-600'
                                        }`}
                                >
                                    {option.value}
                                </div>
                                <div className="flex-1 min-w-0 flex items-center gap-2">
                                    <span className="text-lg sm:text-xl">{option.emoji}</span>
                                    <span className="text-xs sm:text-sm font-medium text-slate-700">
                                        {option.label}
                                    </span>
                                </div>
                                {isSelected && (
                                    <div className="text-[#5e9ea0] text-base sm:text-lg flex-shrink-0">✓</div>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Botões de navegação - fixos na parte inferior */}
            <div className="flex justify-between gap-2 sm:gap-3 flex-shrink-0 pt-2 border-t border-slate-200">
                <Button
                    variant="outline"
                    onClick={currentQuestion > 0 ? handlePrevious : onCancel}
                    disabled={currentQuestion === 0 && !onCancel}
                    className="flex-1 h-10 sm:h-11 text-xs sm:text-sm"
                >
                    {currentQuestion > 0 ? 'Anterior' : onCancel ? 'Cancelar' : ''}
                </Button>
                <Button
                    onClick={handleNext}
                    disabled={!canProceed}
                    className="flex-1 bg-[#5e9ea0] hover:bg-[#4a8b8f] text-white h-10 sm:h-11 text-xs sm:text-sm"
                >
                    {isLastQuestion ? 'Finalizar' : 'Próxima'}
                </Button>
            </div>
        </div>
    );
}

