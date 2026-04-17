"use client";

import Link from "next/link";
import AssessmentModal from "@/components/assessment/AssessmentModal";
import type { AssessmentConfig } from "@/types/assessments";

interface AssessmentInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    assessment: AssessmentConfig | null;
}

type AssessmentInfo = {
    about: string;
    purpose: string;
    dimensions: string[];
    note: string;
    ctaLabel: string;
};

/**
 * Padrao de privacidade para testes:
 * em contextos com restricao de acesso a resultados de terceiros, usar modal estatico
 * com informacoes institucionais do teste + CTA para a pagina oficial do teste.
 * Este padrao deve ser replicado para qualquer novo teste com a mesma restricao.
 */
const ASSESSMENT_INFO: Record<string, AssessmentInfo> = {
    "five-mind": {
        about:
            "O FiveMind e um teste comportamental de fit cultural que ajuda a identificar o estilo predominante de trabalho e convivencia profissional.",
        purpose:
            "Ele e usado para apoiar autoconhecimento e alinhamento com ambientes e oportunidades profissionais.",
        dimensions: [
            "Abertura a experiencias",
            "Conscienciosidade",
            "Extroversao",
            "Amabilidade",
            "Estabilidade emocional",
        ],
        note:
            "Este modal apresenta apenas informacoes gerais sobre o teste, sem exibir resultados individuais de outros usuarios.",
        ctaLabel: "Fazer teste FiveMind",
    },
    "hexa-mind": {
        about:
            "O HexaMind e uma avaliacao de personalidade com seis fatores, voltada para entendimento de preferencias comportamentais em contexto profissional.",
        purpose:
            "Ele auxilia na leitura de perfil para desenvolvimento pessoal e melhor direcionamento de carreira.",
        dimensions: [
            "Honestidade/Humildade",
            "Estabilidade emocional",
            "Extroversao",
            "Amabilidade",
            "Conscienciosidade",
            "Abertura a experiencias",
        ],
        note:
            "Este modal apresenta apenas informacoes gerais sobre o teste, sem exibir resultados individuais de outros usuarios.",
        ctaLabel: "Fazer teste HexaMind",
    },
};

const DEFAULT_INFO: AssessmentInfo = {
    about:
        "Esta avaliacao mede caracteristicas comportamentais para apoiar autoconhecimento e desenvolvimento profissional.",
    purpose:
        "Seu objetivo e oferecer uma visao estruturada sobre preferencias e tendencias de comportamento no trabalho.",
    dimensions: ["Dimensoes comportamentais especificas da avaliacao"],
    note:
        "Este modal apresenta apenas informacoes gerais sobre o teste, sem exibir resultados individuais de outros usuarios.",
    ctaLabel: "Ver avaliacao na loja",
};

export default function AssessmentInfoModal({
    isOpen,
    onClose,
    assessment,
}: AssessmentInfoModalProps) {
    if (!assessment) return null;

    const info = ASSESSMENT_INFO[assessment.id] ?? DEFAULT_INFO;

    return (
        <AssessmentModal isOpen={isOpen} onClose={onClose} title={assessment.name}>
            <div className="space-y-5">
                <div className="rounded-2xl border border-[#dbe8e8] bg-gradient-to-br from-[#f9fcfc] to-[#f4f9f9] p-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#3f787a]">O que e</p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-700 sm:text-base">{info.about}</p>
                </div>

                <div className="rounded-2xl border border-[#dbe8e8] bg-white p-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#3f787a]">Para que serve</p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-700 sm:text-base">{info.purpose}</p>
                </div>

                <div className="rounded-2xl border border-[#dbe8e8] bg-white p-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#3f787a]">Dimensoes avaliadas</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {info.dimensions.map((dimension) => (
                            <span
                                key={dimension}
                                className="inline-flex items-center rounded-full border border-[#5f9ea0]/25 bg-[#5f9ea0]/10 px-3 py-1.5 text-xs font-medium text-[#1f2b2c] sm:text-sm"
                            >
                                {dimension}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-800 sm:text-sm">
                    {info.note}
                </div>

                <Link
                    href={`/applicant/shop?tab=avaliacoes&q=${encodeURIComponent(assessment.name)}`}
                    className="group flex items-center gap-3 rounded-2xl border border-[#5f9ea0]/25 bg-gradient-to-br from-[#f9fcfc] to-[#edf5f5] p-3 transition-colors hover:border-[#5f9ea0]/45"
                >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#5f9ea0]/20 bg-white">
                        {assessment.image ? (
                            <img
                                src={assessment.image}
                                alt={assessment.name}
                                className="h-full w-full object-contain"
                                onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                }}
                            />
                        ) : (
                            <span className="text-sm font-bold text-[#4f8789]">
                                {assessment.name.charAt(0)}
                            </span>
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#3f787a]">
                            Continue por aqui
                        </p>
                        <p className="text-sm font-semibold text-[#1f2b2c] group-hover:text-[#2d595b] sm:text-base">
                            {info.ctaLabel}
                        </p>
                    </div>
                </Link>
            </div>
        </AssessmentModal>
    );
}
