import type { Json } from "@/types/supabase";
import {
    formatWorkExperienceBlockDurationPt,
    hasMeaningfulWorkExperienceFromDb,
    parseExperienceFromDb,
    type WorkExperienceEntry,
} from "@/lib/workExperience";

interface ExperienceAndEducationSectionProps {
    experience: Json | null;
    academicBackground: string | null;
}

/** Converte YYYY-MM-DD (ISO) para dd/mm/aaaa sem depender de fuso. */
function formatIsoDateBr(iso: string | null): string {
    if (!iso) return "";
    const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return iso;
    return `${m[3]}/${m[2]}/${m[1]}`;
}

function formatPeriod(start: string | null, end: string | null): string {
    const startBr = start ? formatIsoDateBr(start) : "";
    const endBr = end ? formatIsoDateBr(end) : "";
    if (!start && !end) {
        return "";
    }
    if (start && !end) {
        return `${startBr} — atual`;
    }
    if (start && end) {
        return `${startBr} — ${endBr}`;
    }
    return endBr || startBr;
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

/** Ordena da experiência mais recente (término ou atual) para a mais antiga. */
function compareExperienceByRecency(a: WorkExperienceEntry, b: WorkExperienceEntry): number {
    const ongoing = "9999-12-31";
    const endA = a.end_date && /^\d{4}-\d{2}-\d{2}$/.test(a.end_date) ? a.end_date : ongoing;
    const endB = b.end_date && /^\d{4}-\d{2}-\d{2}$/.test(b.end_date) ? b.end_date : ongoing;
    const byEnd = endB.localeCompare(endA);
    if (byEnd !== 0) return byEnd;
    const startA = a.start_date && /^\d{4}-\d{2}-\d{2}$/.test(a.start_date) ? a.start_date : "0000-00-00";
    const startB = b.start_date && /^\d{4}-\d{2}-\d{2}$/.test(b.start_date) ? b.start_date : "0000-00-00";
    return startB.localeCompare(startA);
}

export default function ExperienceAndEducationSection({
    experience,
    academicBackground,
}: ExperienceAndEducationSectionProps) {
    const entries = parseExperienceFromDb(experience)
        .filter(entryHasDisplayContent)
        .sort(compareExperienceByRecency);
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
                    {entries.map((e) => {
                        const head = [e.company.trim(), e.role.trim()].filter(Boolean).join(" — ");
                        const period = formatPeriod(e.start_date, e.end_date);
                        const durationLabel = formatWorkExperienceBlockDurationPt(e);
                        return (
                            <div
                                key={e.id}
                                className="border-l-[3px] border-[#5f9ea0] pl-4 py-2.5"
                            >
                                {head ? (
                                    <p className="text-sm font-semibold text-[#111]">{head}</p>
                                ) : null}
                                {period ? (
                                    <p className="text-xs text-slate-600 mt-0.5">{period}</p>
                                ) : null}
                                {durationLabel ? (
                                    <p className="text-xs font-medium text-[#3f787a] mt-0.5">
                                        Tempo nesta experiência: {durationLabel}
                                    </p>
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
