import type { Json } from "@/types/supabase";

export interface WorkExperienceEntry {
    id: string;
    company: string;
    role: string;
    description: string;
    /** ISO YYYY-MM-DD */
    start_date: string | null;
    /** ISO YYYY-MM-DD; null = emprego atual */
    end_date: string | null;
}

function newEntry(): WorkExperienceEntry {
    return {
        id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `we-${Date.now()}-${Math.random()}`,
        company: "",
        role: "",
        description: "",
        start_date: null,
        end_date: null,
    };
}

export function createEmptyWorkExperienceBlock(): WorkExperienceEntry {
    return newEntry();
}

function isRecord(v: unknown): v is Record<string, unknown> {
    return typeof v === "object" && v !== null && !Array.isArray(v);
}

/**
 * Interpreta o valor da coluna users.experience (jsonb ou legado texto via edge cases).
 */
export function parseExperienceFromDb(raw: unknown): WorkExperienceEntry[] {
    if (raw == null) {
        return [];
    }
    if (typeof raw === "string") {
        const t = raw.trim();
        if (!t) {
            return [];
        }
        return [
            {
                ...newEntry(),
                description: t,
            },
        ];
    }
    if (!Array.isArray(raw)) {
        return [];
    }
    const out: WorkExperienceEntry[] = [];
    for (const item of raw) {
        if (!isRecord(item)) {
            continue;
        }
        const id =
            typeof item.id === "string" && item.id.length > 0
                ? item.id
                : typeof crypto !== "undefined" && crypto.randomUUID
                  ? crypto.randomUUID()
                  : `we-${Date.now()}-${Math.random()}`;
        const start = item.start_date != null ? String(item.start_date).slice(0, 10) : null;
        const end = item.end_date != null ? String(item.end_date).slice(0, 10) : null;
        out.push({
            id,
            company: typeof item.company === "string" ? item.company : "",
            role: typeof item.role === "string" ? item.role : typeof item.title === "string" ? item.title : "",
            description: typeof item.description === "string" ? item.description : "",
            start_date: start && /^\d{4}-\d{2}-\d{2}$/.test(start) ? start : null,
            end_date: end && /^\d{4}-\d{2}-\d{2}$/.test(end) ? end : null,
        });
    }
    return out;
}

/** Serializa para persistência em jsonb (Postgres / Supabase). */
export function serializeExperienceForDb(entries: WorkExperienceEntry[]): Json | null {
    const cleaned = entries
        .map((e) => ({
            id: e.id,
            company: e.company.trim(),
            role: e.role.trim(),
            description: e.description.trim(),
            start_date: e.start_date,
            end_date: e.end_date,
        }))
        .filter(
            (e) =>
                e.company.length > 0 ||
                e.role.length > 0 ||
                e.description.length > 0 ||
                e.start_date != null ||
                e.end_date != null
        );
    if (cleaned.length === 0) {
        return null;
    }
    return cleaned as unknown as Json;
}

/** Texto corrido para exibição simples ou fallback em ranking legado. */
export function flattenWorkExperienceForDisplay(entries: WorkExperienceEntry[]): string {
    const parts: string[] = [];
    for (const e of entries) {
        const head = [e.company.trim(), e.role.trim()].filter(Boolean).join(" — ");
        const period =
            e.start_date || e.end_date
                ? [e.start_date ?? "?", e.end_date ?? "atual"].join(" → ")
                : "";
        const body = e.description.trim();
        const chunk = [head, period, body].filter(Boolean).join("\n");
        if (chunk) {
            parts.push(chunk);
        }
    }
    return parts.join("\n\n");
}

const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;

function durationYears(startIso: string, endIso: string | null): number {
    const start = new Date(`${startIso}T12:00:00.000Z`).getTime();
    const end = endIso
        ? new Date(`${endIso}T12:00:00.000Z`).getTime()
        : new Date().getTime();
    if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) {
        return 0;
    }
    return (end - start) / MS_PER_YEAR;
}

/**
 * Soma as durações de cada bloco com data de início (fim ausente = até hoje).
 * Blocos sem start_date contribuem com 0 anos (descrição não é parseada aqui).
 */
export function sumWorkExperienceYears(entries: WorkExperienceEntry[]): number {
    let total = 0;
    for (const e of entries) {
        if (!e.start_date) {
            continue;
        }
        total += durationYears(e.start_date, e.end_date);
    }
    return total;
}

/** A partir do valor bruto do banco (jsonb / legado). */
export function hasMeaningfulWorkExperienceFromDb(raw: unknown): boolean {
    return hasMeaningfulWorkExperience(parseExperienceFromDb(raw));
}

/** Há algum conteúdo útil em pelo menos um bloco? */
export function hasMeaningfulWorkExperience(entries: WorkExperienceEntry[] | undefined | null): boolean {
    if (!entries || entries.length === 0) {
        return false;
    }
    return entries.some(
        (e) =>
            e.company.trim().length > 0 ||
            e.role.trim().length > 0 ||
            e.description.trim().length > 0 ||
            e.start_date != null
    );
}

/** Extrai anos totais a partir do valor bruto do banco (jsonb, array, string legada). */
export function getTotalExperienceYearsFromDbValue(raw: unknown): number {
    if (raw == null) {
        return 0;
    }
    if (typeof raw === "string") {
        return extractExperienceYearsFromLegacyText(raw);
    }
    const entries = parseExperienceFromDb(raw);
    const fromDates = sumWorkExperienceYears(entries);
    if (fromDates > 0) {
        return fromDates;
    }
    return extractExperienceYearsFromLegacyText(flattenWorkExperienceForDisplay(entries));
}

function extractExperienceYearsFromLegacyText(experienceText: string | null | undefined): number {
    if (!experienceText || !experienceText.trim()) {
        return 0;
    }
    const yearPatterns = [/(\d+)\s*(?:ano|anos|year|years)/i, /(\d+)\+/, /(\d+)\s*yr/i];
    for (const pattern of yearPatterns) {
        const match = experienceText.match(pattern);
        if (match) {
            return parseInt(match[1], 10);
        }
    }
    return 0;
}
