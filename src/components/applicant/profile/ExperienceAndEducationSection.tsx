import type { Json } from "@/types/supabase";
import {
    hasMeaningfulWorkExperienceFromDb,
    parseExperienceFromDb,
    type WorkExperienceEntry,
} from "@/lib/workExperience";

interface ExperienceAndEducationSectionProps {
    experience: Json | null;
    academicBackground: string | null;
}

function formatPeriod(start: string | null, end: string | null): string {
    if (!start && !end) {
        return "";
    }
    if (start && !end) {
        return `${start} — atual`;
    }
    if (start && end) {
        return `${start} — ${end}`;
    }
    return end ?? start ?? "";
}

function entryHasDisplayContent(e: WorkExperienceEntry): boolean {
    return Boolean(
        e.company.trim() ||
            e.role.trim() ||
            e.description.trim() ||
            e.start_date ||
            e.end_date
    );
}

export default function ExperienceAndEducationSection({
    experience,
    academicBackground,
}: ExperienceAndEducationSectionProps) {
    const entries = parseExperienceFromDb(experience).filter(entryHasDisplayContent);
    const hasXp = hasMeaningfulWorkExperienceFromDb(experience);

    if (!hasXp && !academicBackground) {
        return null;
    }

    return (
        <section className="space-y-3">
            {hasXp && entries.length > 0 && (
                <div className="space-y-4">
                    <p className="text-xs text-[#5f9ea0] font-medium uppercase tracking-wide">
                        Experiência Profissional
                    </p>
                    {entries.map((e, i) => {
                        const head = [e.company.trim(), e.role.trim()].filter(Boolean).join(" — ");
                        const period = formatPeriod(e.start_date, e.end_date);
                        return (
                            <div
                                key={e.id}
                                className="border-l-[3px] border-[#5f9ea0] pl-4 py-2.5"
                            >
                                {entries.length > 1 ? (
                                    <p className="text-xs text-slate-500 mb-1">Experiência {i + 1}</p>
                                ) : null}
                                {head ? (
                                    <p className="text-sm font-semibold text-[#111]">{head}</p>
                                ) : null}
                                {period ? (
                                    <p className="text-xs text-slate-600 mt-0.5">{period}</p>
                                ) : null}
                                {e.description.trim() ? (
                                    <p className="text-sm text-[#111] leading-relaxed whitespace-pre-line mt-1.5">
                                        {e.description.trim()}
                                    </p>
                                ) : null}
                            </div>
                        );
                    })}
                </div>
            )}
            {academicBackground && (
                <div className="border-l-[3px] border-[#5f9ea0] pl-4 py-2.5">
                    <p className="text-xs text-[#5f9ea0] mb-1.5 font-medium uppercase tracking-wide">
                        Formação Acadêmica
                    </p>
                    <p className="text-sm text-[#111] leading-relaxed whitespace-pre-line">
                        {academicBackground}
                    </p>
                </div>
            )}
        </section>
    );
}
