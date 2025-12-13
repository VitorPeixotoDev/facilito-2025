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
            className="p-2 cursor-pointer hover:shadow-lg transition-all duration-200 active:scale-95 bg-white border border-slate-200"
            onClick={onClick}
        >
            <div className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden bg-slate-100">
                    {assessment.image ? (
                        <img
                            src={assessment.image}
                            alt={assessment.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                            <span className="text-lg font-bold text-blue-600">{assessment.name.charAt(0)}</span>
                        </div>
                    )}
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-slate-900 text-center px-1">
                    {assessment.name}
                </h3>
            </div>
        </Card>
    );
}

