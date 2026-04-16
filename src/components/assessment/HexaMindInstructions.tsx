"use client";

import { AlertTriangle, CheckCircle2, ClipboardList, Clock3, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HexaMindInstructionsProps {
    onStart: () => void;
    onCancel?: () => void;
    image?: string;
}

const factors = [
    { name: 'Honestidade/Humildade', color: 'border-amber-200 bg-amber-50 text-amber-800' },
    { name: 'Estabilidade Emocional', color: 'border-blue-200 bg-blue-50 text-blue-800' },
    { name: 'Extroversão', color: 'border-orange-200 bg-orange-50 text-orange-800' },
    { name: 'Amabilidade', color: 'border-green-200 bg-green-50 text-green-800' },
    { name: 'Conscienciosidade', color: 'border-purple-200 bg-purple-50 text-purple-800' },
    { name: 'Abertura à Experiência', color: 'border-indigo-200 bg-indigo-50 text-indigo-800' },
];

const answerGuidelines = [
    'Leia cada afirmação cuidadosamente',
    'Responda com sinceridade',
    'Escolha a opção que melhor representa você',
    'Não há respostas certas ou erradas',
    'Itens 37 a 40 são de controle de consistência',
];

const timingDetails = [
    '40 questões (6 a 7 por fator)',
    'Aproximadamente 10 minutos',
    'Escala Likert de 1 a 5',
];

const responseScale = [
    { value: 1, label: 'Discordo totalmente', emoji: '🙅', description: 'Não se aplica a mim' },
    { value: 2, label: 'Discordo', emoji: '👎', description: 'Raramente se aplica' },
    { value: 3, label: 'Neutro', emoji: '😐', description: 'Às vezes se aplica' },
    { value: 4, label: 'Concordo', emoji: '👍', description: 'Frequentemente se aplica' },
    { value: 5, label: 'Concordo totalmente', emoji: '💯', description: 'Sempre se aplica' },
];

const importantNotes = [
    'Não há respostas certas ou erradas, responda com sinceridade.',
    'Itens 37 a 40 são usados para controle de consistência da avaliação.',
    'Os resultados são confidenciais e destinados apenas para desenvolvimento profissional.',
];

export default function HexaMindInstructions({ onStart, onCancel, image }: HexaMindInstructionsProps) {
    return (
        <div className="space-y-5 sm:space-y-6">
            <div className="rounded-[1.75rem] border border-[#f0d7c4] bg-gradient-to-br from-[#fffaf6] to-[#fff1e7] p-4 shadow-sm sm:p-6">
                <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#f0d7c4] bg-white/90 shadow-sm sm:h-14 sm:w-14">
                        {image ? (
                            <img
                                src={image}
                                alt="HexaMind"
                                className="h-full w-full object-contain"
                                onError={(e) => {
                                    console.error('Erro ao carregar imagem:', e);
                                    e.currentTarget.style.display = 'none';
                                    const parent = e.currentTarget.parentElement;
                                    if (parent) {
                                        parent.innerHTML = '<span class="text-2xl font-bold text-amber-600">6</span>';
                                    }
                                }}
                            />
                        ) : (
                            <span className="text-2xl font-bold text-amber-600">6</span>
                        )}
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#b86a2d]">
                            Teste de 6 Fatores de Personalidade
                        </p>
                        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#111] sm:text-3xl">
                            HexaMind
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#111]/70 sm:text-base">
                            O <strong>HexaMind</strong> é um instrumento psicológico avançado que
                            avalia seis fatores fundamentais da personalidade humana, projetado
                            para contextos profissionais e organizacionais.
                        </p>
                    </div>
                </div>

                <div className="mt-5 rounded-2xl border border-[#f2c9ad] bg-white/80 p-4 shadow-sm sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#f6c7a4]/45 to-[#fff0e4] sm:h-12 sm:w-12">
                            <Sparkles className="h-5 w-5 text-[#c06b2e] sm:h-6 sm:w-6" />
                        </div>
                        <div className="flex-1">
                            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#b86a2d]">
                                Visão Geral
                            </p>
                            <h2 className="text-base font-semibold text-[#111] sm:text-lg">
                                Instruções do questionário
                            </h2>
                            <p className="mt-2 text-sm leading-relaxed text-[#111]/70 sm:text-base">
                                Este teste ajuda candidatos e empresas a identificar traços de
                                personalidade mais alinhados ao contexto organizacional, tornando a
                                leitura inicial mais clara e funcional no mobile.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-5 rounded-2xl border border-[#f0d7c4] bg-white p-4 shadow-sm sm:p-5">
                    <div className="mb-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#b86a2d]">
                            Fatores avaliados
                        </p>
                        <h3 className="mt-1 text-sm font-semibold text-[#111] sm:text-base">
                            Os 6 pilares analisados pelo HexaMind
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                        {factors.map((factor) => (
                            <div
                                key={factor.name}
                                className={`rounded-2xl border p-3.5 shadow-sm ${factor.color}`}
                            >
                                <p className="text-sm font-semibold leading-snug">{factor.name}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                    <div className="rounded-2xl border border-[#f0d7c4] bg-white p-4 shadow-sm sm:p-5">
                        <div className="mb-3 flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#f6c7a4]/45 to-[#fff0e4]">
                                <ClipboardList className="h-4 w-4 text-[#c06b2e]" />
                            </div>
                            <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#b86a2d]">
                                Como responder
                            </h3>
                        </div>
                        <ul className="space-y-2.5">
                            {answerGuidelines.map((item) => (
                                <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-[#111]/75">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#c06b2e]" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="rounded-2xl border border-[#f0d7c4] bg-white p-4 shadow-sm sm:p-5">
                        <div className="mb-3 flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#f6c7a4]/45 to-[#fff0e4]">
                                <Clock3 className="h-4 w-4 text-[#c06b2e]" />
                            </div>
                            <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#b86a2d]">
                                Duração estimada
                            </h3>
                        </div>
                        <ul className="space-y-2.5">
                            {timingDetails.map((item) => (
                                <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-[#111]/75">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#c06b2e]" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            <div className="rounded-[1.5rem] border border-[#f0d7c4] bg-white p-4 shadow-sm sm:p-6">
                <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#f6c7a4]/45 to-[#fff0e4]">
                        <ShieldCheck className="h-5 w-5 text-[#c06b2e]" />
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#b86a2d]">
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
                            className="rounded-2xl border border-[#f0d7c4] bg-[#fffaf6] p-3.5 shadow-sm"
                        >
                            <div className="flex items-start gap-3">
                                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-sm font-bold text-white">
                                    {item.value}
                                </div>
                                <div className="min-w-0">
                                    <span className="block text-lg leading-none">{item.emoji}</span>
                                    <span className="mt-1 block text-sm font-semibold leading-snug text-[#111]">
                                        {item.label}
                                    </span>
                                    <span className="mt-1 block text-[11px] leading-relaxed text-[#111]/55">
                                        {item.description}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="rounded-[1.5rem] border border-[#f0d7c4] bg-white p-4 shadow-sm sm:p-5">
                <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#f6c7a4]/45 to-[#fff0e4]">
                        <AlertTriangle className="h-5 w-5 text-[#c06b2e]" />
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#b86a2d]">
                            Informações importantes
                        </p>
                        <h3 className="text-sm font-semibold text-[#111] sm:text-base">
                            Pontos para considerar antes de iniciar
                        </h3>
                    </div>
                </div>

                <ul className="space-y-2.5">
                    {importantNotes.map((item) => (
                        <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-[#111]/75">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#c06b2e]" />
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="rounded-[1.5rem] border border-[#f0d7c4] bg-white p-4 shadow-sm sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-center sm:text-left">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#b86a2d]">
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
                                className="w-full rounded-xl border-[#f0d7c4] bg-white text-[#8f5427] hover:bg-[#fff7f1] sm:w-auto"
                            >
                                Voltar
                            </Button>
                        )}
                        <Button
                            onClick={onStart}
                            className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3 text-white shadow-sm transition-opacity hover:opacity-90 sm:w-auto"
                        >
                            Iniciar questionário
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

