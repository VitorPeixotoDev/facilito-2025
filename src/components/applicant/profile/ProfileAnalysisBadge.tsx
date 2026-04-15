"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import type { AssessmentConfig } from '@/types/assessments';

interface ProfileAnalysisBadgeProps {
    assessment: AssessmentConfig;
    onClick: () => void;
}

export default function ProfileAnalysisBadge({ assessment, onClick }: ProfileAnalysisBadgeProps) {
    return (
        <Card
            className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-[#5f9ea0]/25 hover:shadow-md active:scale-[0.99] sm:p-5"
            onClick={onClick}
        >
            <div className="flex items-center gap-4 sm:gap-5">
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-[#5f9ea0]/20 bg-white transition-transform duration-300 group-hover:scale-105 sm:h-20 sm:w-20">
                    {assessment.image ? (
                        <img
                            src={assessment.image}
                            alt={assessment.name}
                            className="h-full w-full rounded-2xl object-contain p-1.5 sm:p-2"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center rounded-2xl bg-gradient-to-br from-[#e7f2f2] to-[#d9ebec]">
                            <span className="text-xl font-bold text-[#4f8789]">{assessment.name.charAt(0)}</span>
                        </div>
                    )}
                </div>
                <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold leading-tight text-slate-900 sm:text-base">
                        {assessment.name}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                        Avaliação concluída
                    </p>
                    <p className="mt-2 text-sm font-medium text-[#5f9ea0]">
                        Toque para ver detalhes
                    </p>
                </div>
            </div>
        </Card>
    );
}

