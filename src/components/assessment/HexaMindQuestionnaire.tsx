"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { AssessmentComponentProps, HexaMindResult } from '@/types/assessments';

interface Question {
    id: number;
    text: string;
    factor: 'honesty' | 'emotional_stability' | 'extraversion' | 'agreeableness' | 'conscientiousness' | 'openness' | 'consistency';
    reverseScored?: boolean;
}

const QUESTIONS: Question[] = [
    // FATOR 1 — HONESTIDADE / HUMILDADE (6 itens)
    { id: 1, text: "Procuro agir com integridade, mesmo quando ninguém está observando.", factor: 'honesty' },
    { id: 2, text: "Evito tirar vantagem de situações, mesmo quando seria fácil.", factor: 'honesty' },
    { id: 3, text: "Prefiro ser reconhecido pelo meu trabalho, não por autopromoção.", factor: 'honesty' },
    { id: 4, text: "Acredito que honestidade é mais importante do que resultados imediatos.", factor: 'honesty' },
    { id: 5, text: "Sou humilde ao falar sobre minhas conquistas.", factor: 'honesty' },
    { id: 6, text: "Evito manipular pessoas para obter o que desejo.", factor: 'honesty' },

    // FATOR 2 — EMOÇÕES / ESTABILIDADE (6 itens)
    { id: 7, text: "Mantenho a calma mesmo sob forte pressão.", factor: 'emotional_stability' },
    { id: 8, text: "Lido bem com críticas, mesmo quando são duras.", factor: 'emotional_stability' },
    { id: 9, text: "Não costumo me abalar facilmente por contratempos.", factor: 'emotional_stability' },
    { id: 10, text: "Costumo me recuperar rapidamente após frustrações.", factor: 'emotional_stability' },
    { id: 11, text: "Me sinto seguro ao lidar com mudanças inesperadas.", factor: 'emotional_stability' },
    { id: 12, text: "Raramente deixo a ansiedade me impedir de agir.", factor: 'emotional_stability' },

    // FATOR 3 — EXTROVERSÃO (6 itens)
    { id: 13, text: "Gosto de conhecer e conversar com pessoas novas.", factor: 'extraversion' },
    { id: 14, text: "Costumo assumir o papel de liderança quando necessário.", factor: 'extraversion' },
    { id: 15, text: "Transmito energia positiva no ambiente de trabalho.", factor: 'extraversion' },
    { id: 16, text: "Tomo iniciativa em situações sociais ou coletivas.", factor: 'extraversion' },
    { id: 17, text: "Me sinto confortável sendo o centro das atenções.", factor: 'extraversion' },
    { id: 18, text: "Tenho facilidade para me expressar verbalmente.", factor: 'extraversion' },

    // FATOR 4 — AMABILIDADE (6 itens)
    { id: 19, text: "Busco ouvir atentamente a opinião das pessoas.", factor: 'agreeableness' },
    { id: 20, text: "Costumo agir de forma paciente, mesmo sob tensão.", factor: 'agreeableness' },
    { id: 21, text: "Evito conflitos desnecessários.", factor: 'agreeableness' },
    { id: 22, text: "Acredito que gentileza ajuda a resolver problemas.", factor: 'agreeableness' },
    { id: 23, text: "Sou colaborativo em equipes de diferentes perfis.", factor: 'agreeableness' },
    { id: 24, text: "Procuro compreender o ponto de vista dos outros antes de julgar.", factor: 'agreeableness' },

    // FATOR 5 — CONSCIENCIOSIDADE (6 itens)
    { id: 25, text: "Gosto de cumprir metas e prazos com consistência.", factor: 'conscientiousness' },
    { id: 26, text: "Me esforço para entregar meu trabalho da melhor forma possível.", factor: 'conscientiousness' },
    { id: 27, text: "Sou organizado com minhas tarefas e compromissos.", factor: 'conscientiousness' },
    { id: 28, text: "Planejo minhas atividades antes de executá-las.", factor: 'conscientiousness' },
    { id: 29, text: "Evito procrastinar sempre que posso.", factor: 'conscientiousness' },
    { id: 30, text: "Tenho disciplina para concluir tarefas mesmo quando são difíceis.", factor: 'conscientiousness' },

    // FATOR 6 — ABERTURA À EXPERIÊNCIA (6 itens)
    { id: 31, text: "Gosto de aprender coisas novas constantemente.", factor: 'openness' },
    { id: 32, text: "Tenho facilidade para gerar novas ideias.", factor: 'openness' },
    { id: 33, text: "Aprecio explorar abordagens diferentes para resolver problemas.", factor: 'openness' },
    { id: 34, text: "Me interesso por assuntos fora da minha área habitual.", factor: 'openness' },
    { id: 35, text: "Gosto de imaginar possibilidades e cenários futuros.", factor: 'openness' },
    { id: 36, text: "Busco inovação em tudo o que faço.", factor: 'openness' },

    // ITENS ADICIONAIS (Controle e consistência) - 4 itens
    { id: 37, text: "Raramente respondo impulsivamente sem refletir.", factor: 'consistency' },
    { id: 38, text: "Mantenho coerência entre o que digo e o que faço.", factor: 'consistency' },
    { id: 39, text: "Costumo revisar meu trabalho antes de finalizar.", factor: 'consistency' },
    { id: 40, text: "Busco aprender com meus erros para melhorar continuamente.", factor: 'consistency' },
];

const SCALE_OPTIONS = [
    { value: 1, label: 'Discordo totalmente', emoji: '🙅', description: 'Não se aplica a mim' },
    { value: 2, label: 'Discordo', emoji: '👎', description: 'Raramente se aplica' },
    { value: 3, label: 'Neutro', emoji: '😐', description: 'Às vezes se aplica' },
    { value: 4, label: 'Concordo', emoji: '👍', description: 'Frequentemente se aplica' },
    { value: 5, label: 'Concordo totalmente', emoji: '💯', description: 'Sempre se aplica' },
];

interface HexaMindQuestionnaireProps extends AssessmentComponentProps {
    assessmentId?: string;
    assessmentName?: string;
    questions?: Array<{ id: string; text: string; factor: string; reverse?: boolean }>;
    scaleOptions?: Array<{ value: number; label: string; emoji?: string; description?: string }>;
}

function getQuestionId(q: { id: string | number }): string {
    return typeof q.id === 'number' ? String(q.id) : q.id;
}

export default function HexaMindQuestionnaire({ assessmentId, assessmentName, onComplete, onCancel, questions: questionsProp, scaleOptions: scaleOptionsProp }: HexaMindQuestionnaireProps) {
    const questions = (questionsProp && questionsProp.length > 0) ? questionsProp : QUESTIONS.map(q => ({ id: q.id, text: q.text, factor: q.factor, reverse: q.reverseScored }));
    const scaleOptions = (scaleOptionsProp && scaleOptionsProp.length > 0) ? scaleOptionsProp : SCALE_OPTIONS;

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<Record<string, number>>({});

    const question = questions[currentQuestion];
    const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;
    const isLastQuestion = currentQuestion === questions.length - 1;
    const questionId = question ? getQuestionId(question) : '';
    const canProceed = question ? answers[questionId] !== undefined : false;

    const handleAnswer = (value: number) => {
        if (!question) return;
        setAnswers(prev => ({ ...prev, [getQuestionId(question)]: value }));
    };

    const handleNext = () => {
        if (isLastQuestion) {
            calculateResults(questions, answers);
        } else {
            setCurrentQuestion(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(prev => prev - 1);
        }
    };

    const calculateResults = (qList: Array<{ id: string; text?: string; factor: string; reverse?: boolean }>, ans: Record<string, number>) => {
        const factors: Record<string, number[]> = {
            honesty: [],
            emotional_stability: [],
            extraversion: [],
            agreeableness: [],
            conscientiousness: [],
            openness: [],
            consistency: [],
        };

        qList.forEach(q => {
            const id = getQuestionId(q as { id: string | number });
            let value = ans[id] ?? 3;
            if (q.reverse) {
                value = 6 - value;
            }
            if (factors[q.factor]) factors[q.factor].push(value);
        });

        const calculateAverage = (values: number[]) =>
            values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;

        const honesty = Math.round(calculateAverage(factors.honesty) * 10) / 10;
        const emotional_stability = Math.round(calculateAverage(factors.emotional_stability) * 10) / 10;
        const extraversion = Math.round(calculateAverage(factors.extraversion) * 10) / 10;
        const agreeableness = Math.round(calculateAverage(factors.agreeableness) * 10) / 10;
        const conscientiousness = Math.round(calculateAverage(factors.conscientiousness) * 10) / 10;
        const openness = Math.round(calculateAverage(factors.openness) * 10) / 10;
        const consistency = Math.round(calculateAverage(factors.consistency) * 10) / 10;

        // Calcular consistência de resposta (baseado nos itens 37-40)
        const consistencyAnswers = factors.consistency;
        const responseConsistency = consistencyAnswers.length > 0
            ? Math.round((calculateAverage(consistencyAnswers) / 5) * 100)
            : 0;

        // Calcular score geral (média dos 6 fatores principais, exceto consistência)
        const factorsWithoutConsistency = [honesty, emotional_stability, extraversion, agreeableness, conscientiousness, openness];
        const overallScore = Math.round(
            (factorsWithoutConsistency.reduce((sum, val) => sum + val, 0) / factorsWithoutConsistency.length) * 20
        );

        const results: HexaMindResult = {
            assessmentId: assessmentId ?? '',
            assessmentSlug: 'hexa-mind',
            assessmentName: assessmentName ?? 'HexaMind',
            completedAt: new Date(),
            results: {
                honesty,
                emotional_stability,
                extraversion,
                agreeableness,
                conscientiousness,
                openness,
                consistency,
                overallScore,
                responseConsistency,
            },
        };

        console.log('📋 [HexaMindQuestionnaire] Resultados calculados:', results);
        console.log('📤 [HexaMindQuestionnaire] Chamando onComplete...');
        onComplete(results);
        console.log('✅ [HexaMindQuestionnaire] onComplete chamado');
    };

    if (!question) {
        return (
            <div className="p-4 text-center text-slate-600">
                Nenhuma questão disponível para esta avaliação.
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] sm:h-[calc(100vh-120px)] lg:h-auto lg:max-h-[600px]">
            {/* Barra de progresso - compacta */}
            <div className="mb-2 sm:mb-3 flex-shrink-0">
                <div className="w-full bg-slate-200 rounded-full h-1 sm:h-1.5 mb-1">
                    <div
                        className="bg-gradient-to-r from-amber-500 to-orange-500 h-1 sm:h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="text-xs text-slate-600 text-center">
                    Questão {currentQuestion + 1} de {questions.length} ({Math.round(progress)}% completo)
                </div>
            </div>

            {/* Fator atual */}
            <div className="mb-2 flex-shrink-0">
                <span className="inline-block px-2 py-1 bg-gradient-to-r from-amber-100 to-indigo-100 text-amber-800 text-xs font-semibold rounded-full border border-amber-200">
                    {question.factor === 'honesty' ? 'Honestidade/Humildade' :
                        question.factor === 'emotional_stability' ? 'Estabilidade Emocional' :
                            question.factor === 'extraversion' ? 'Extroversão' :
                                question.factor === 'agreeableness' ? 'Amabilidade' :
                                    question.factor === 'conscientiousness' ? 'Conscienciosidade' :
                                        question.factor === 'openness' ? 'Abertura à Experiência' :
                                            'Consistência'}
                </span>
            </div>

            {/* Afirmação - compacta no topo */}
            <div className="mb-3 sm:mb-4 flex-shrink-0">
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 leading-tight">
                    {question.text}
                </h3>
            </div>

            {/* Opções de resposta - ocupam o espaço disponível */}
            <div className="flex-1 overflow-y-auto space-y-2 mb-3 sm:mb-4 min-h-0">
                {scaleOptions.map((option) => {
                    const isSelected = answers[questionId] === option.value;
                    return (
                        <button
                            key={option.value}
                            onClick={() => handleAnswer(option.value)}
                            className={`w-full p-2.5 sm:p-3 rounded-lg border-2 transition-all text-left active:scale-[0.98] ${isSelected
                                ? 'border-amber-500 bg-gradient-to-r from-amber-50 to-indigo-50'
                                : 'border-slate-200 active:border-slate-300 bg-white'
                                }`}
                        >
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div
                                    className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-md font-semibold text-xs sm:text-sm flex-shrink-0 ${isSelected
                                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                                        : 'bg-slate-100 text-slate-600'
                                        }`}
                                >
                                    {option.value}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        {option.emoji && <span className="text-lg sm:text-xl">{option.emoji}</span>}
                                        <span className="text-xs sm:text-sm font-medium text-slate-700">
                                            {option.label}
                                        </span>
                                    </div>
                                    {option.description && (
                                        <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">
                                            {option.description}
                                        </p>
                                    )}
                                </div>
                                {isSelected && (
                                    <div className="text-amber-600 text-base sm:text-lg flex-shrink-0">✓</div>
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
                    className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-90 text-white h-10 sm:h-11 text-xs sm:text-sm"
                >
                    {isLastQuestion ? 'Finalizar' : 'Próxima'}
                </Button>
            </div>
        </div>
    );
}

