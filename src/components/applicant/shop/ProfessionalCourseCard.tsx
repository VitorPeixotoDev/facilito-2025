'use client';

import { Card } from '@/components/ui/card';
import type { ProfessionalCourseConfig } from '@/lib/constants/professional_courses';

interface ProfessionalCourseCardProps {
    course: ProfessionalCourseConfig;
    onSelect: (course: ProfessionalCourseConfig) => void;
}

export function ProfessionalCourseCard({ course, onSelect }: ProfessionalCourseCardProps) {
    return (
        <Card
            className="flex h-full cursor-pointer flex-col p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow duration-300"
            onClick={() => onSelect(course)}
        >
            <div className="flex flex-1 flex-col gap-4">
                <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden border border-slate-200 bg-white p-1.5">
                        <img
                            src={course.imageSrc}
                            alt={course.courseName}
                            className="h-full w-full object-contain"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="text-base font-bold text-slate-900 line-clamp-2">
                            {course.courseName}
                        </h3>
                        <p className="mt-1 text-sm text-slate-600 line-clamp-2">
                            {course.shortDescription}
                        </p>
                    </div>
                </div>

                {course.partner.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5" aria-label="Tags do curso">
                        {course.partner.tags.map((tag) => (
                            <span
                                key={tag}
                                className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                <div className="mt-auto flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#5e9ea0]/10 px-2.5 py-1 text-xs font-semibold text-[#3d7678]">
                        Parceiro {course.partner.name}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                        {course.estimatedTime}
                    </span>
                </div>
            </div>
        </Card>
    );
}

