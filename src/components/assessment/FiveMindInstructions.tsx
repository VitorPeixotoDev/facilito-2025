"use client";

import { CheckCircle2, ClipboardList, Clock3, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FiveMindInstructionsProps {
    onStart: () => void;
    onCancel?: () => void;
    image?: string;
}

const responseScale = [
    { value: 1, label: 'Discordo totalmente', emoji: '🙅' },
    { value: 2, label: 'Discordo', emoji: '👎' },
    { value: 3, label: 'Neutro', emoji: '😐' },
    { value: 4, label: 'Concordo', emoji: '👍' },
    { value: 5, label: 'Concordo totalmente', emoji: '💯' },
];

const answerGuidelines = [
    'Leia cada afirmação cuidadosamente',
    'Responda com sinceridade',
    'Escolha a opção que melhor representa você',
    'Não há respostas certas ou erradas',
];

const timingDetails = [
    '20 questões (4 por fator)',
    'Aproximadamente 5 a 7 minutos',
    'Escala Likert de 1 a 5',
];

export default function FiveMindInstructions({ onStart, onCancel, image }: FiveMindInstructionsProps) {
    return (
        <div className="space-y-5 sm:space-y-6">
            <div className="rounded-[1.75rem] border border-[#c6d7d8] bg-gradient-to-br from-[#f8fbfb] to-[#eef5f5] p-4 shadow-sm sm:p-6">
                <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#c6d7d8] bg-white/90 shadow-sm sm:h-14 sm:w-14">
                        {image ? (
                            <img
                                src={image}
                                alt="FiveMind"
                                className="h-full w-full object-contain"
                                onError={(e) => {
                                    console.error('Erro ao carregar imagem:', e);
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        ) : (
                            <img
                                src="/blue_head_lito.png"
                                alt="FiveMind"
                                className="h-full w-full object-contain"
                                onError={(e) => {
                                    console.error('Erro ao carregar imagem:', e);
                                }}
                            />
                        )}
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5f9ea0]">
                            Teste de Fit Cultural
                        </p>
                        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#111] sm:text-3xl">
                            FiveMind
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#111]/70 sm:text-base">
                            O <strong>FiveMind</strong> é baseado no modelo IPIP-NEO (Big Five) e foi
                            desenvolvido para avaliar o <strong>fit cultural</strong> em processos de
                            pré-seleção e recrutamento.
                        </p>
                    </div>
                </div>

                <div className="mt-5 rounded-2xl border border-[#5f9ea0]/20 bg-white/80 p-4 shadow-sm sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#5f9ea0]/25 to-[#5f9ea0]/10 sm:h-12 sm:w-12">
                            <Sparkles className="h-5 w-5 text-[#5f9ea0] sm:h-6 sm:w-6" />
                        </div>
                        <div className="flex-1">
                            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5f9ea0]">
                                Visão Geral
                            </p>
                            <h2 className="text-base font-semibold text-[#111] sm:text-lg">
                                Instruções do questionário
                            </h2>
                            <p className="mt-2 text-sm leading-relaxed text-[#111]/70 sm:text-base">
                                Este teste ajuda recrutadores e contratantes a identificar candidatos
                                cujos traços de personalidade se alinham melhor com a cultura
                                organizacional da empresa, deixando a leitura mais clara e objetiva
                                antes do início do questionário.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                    <div className="rounded-2xl border border-[#d6e3e4] bg-white p-4 shadow-sm sm:p-5">
                        <div className="mb-3 flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#5f9ea0]/20 to-[#5f9ea0]/10">
                                <ClipboardList className="h-4 w-4 text-[#5f9ea0]" />
                            </div>
                            <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5f9ea0]">
                                Como responder
                            </h3>
                        </div>
                        <ul className="space-y-2.5">
                            {answerGuidelines.map((item) => (
                                <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-[#111]/75">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#5f9ea0]" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="rounded-2xl border border-[#d6e3e4] bg-white p-4 shadow-sm sm:p-5">
                        <div className="mb-3 flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#5f9ea0]/20 to-[#5f9ea0]/10">
                                <Clock3 className="h-4 w-4 text-[#5f9ea0]" />
                            </div>
                            <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5f9ea0]">
                                Duração estimada
                            </h3>
                        </div>
                        <ul className="space-y-2.5">
                            {timingDetails.map((item) => (
                                <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-[#111]/75">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#5f9ea0]" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            <div className="rounded-[1.5rem] border border-[#d6e3e4] bg-white p-4 shadow-sm sm:p-6">
                <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#5f9ea0]/20 to-[#5f9ea0]/10">
                        <ShieldCheck className="h-5 w-5 text-[#5f9ea0]" />
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5f9ea0]">
                            Escala de respostas
                        </p>
                        <h3 className="text-sm font-semibold text-[#111] sm:text-base">
                            Escolha a intensidade que mais combina com você
                        </h3>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
                    {responseScale.map((item) => (
                        <div
                            key={item.value}
                            className="rounded-2xl border border-[#d6e3e4] bg-[#f8fbfb] p-3.5 shadow-sm"
                        >
                            <div className="flex items-start gap-3">
                                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#5f9ea0] text-sm font-bold text-white">
                                    {item.value}
                                </div>
                                <div className="min-w-0">
                                    <span className="block text-lg leading-none">{item.emoji}</span>
                                    <span className="mt-1 block text-sm font-semibold leading-snug text-[#111]">
                                        {item.label}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="rounded-[1.5rem] border border-[#d6e3e4] bg-white p-4 shadow-sm sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-center sm:text-left">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5f9ea0]">
                            Pronto para começar
                        </p>
                        <p className="mt-1 text-sm leading-relaxed text-[#111]/65 sm:text-base">
                            Confidencial e destinado somente para fins de avaliação.
                        </p>
                    </div>

                    <div className="flex w-full flex-col-reverse gap-3 sm:w-auto sm:flex-row sm:items-center">
                        {onCancel && (
                            <Button
                                variant="outline"
                                onClick={onCancel}
                                className="w-full rounded-xl border-[#c6d7d8] bg-white text-[#365d5f] hover:bg-[#f5f9f9] sm:w-auto"
                            >
                                Voltar
                            </Button>
                        )}
                        <Button
                            onClick={onStart}
                            className="w-full rounded-xl bg-gradient-to-r from-[#3f787a] to-[#5f9ea0] px-6 py-3 text-white shadow-sm transition-opacity hover:opacity-90 sm:w-auto"
                        >
                            Iniciar questionário
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

