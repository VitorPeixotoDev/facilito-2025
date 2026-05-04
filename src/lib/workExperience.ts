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

const ISO_DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

function getTodayLocalIsoForDuration(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

function parseIsoYmd(iso: string): { y: number; m: number; d: number } | null {
    const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return null;
    return { y: +m[1], m: +m[2], d: +m[3] };
}

/**
 * Meses completos de calendário entre duas datas ISO (fim ≥ início).
 * Se o dia final for menor que o dia inicial no mês de término, desconta um mês (período incompleto).
 */
function calendarMonthsBetweenStartAndEnd(startIso: string, endIso: string): number {
    if (endIso < startIso) {
        return 0;
    }
    const s = parseIsoYmd(startIso);
    const e = parseIsoYmd(endIso);
    if (!s || !e) {
        return 0;
    }
    let months = (e.y - s.y) * 12 + (e.m - s.m);
    if (e.d < s.d) {
        months -= 1;
    }
    return Math.max(0, months);
}

/**
 * Duração em anos (fração) de um único bloco; fim ausente = até hoje.
 * Retorna 0 se não houver data de início válida (AAAA-MM-DD).
 */
export function getWorkExperienceBlockDurationYears(entry: WorkExperienceEntry): number {
    if (!entry.start_date || !ISO_DATE_ONLY.test(entry.start_date)) {
        return 0;
    }
    return durationYears(entry.start_date, entry.end_date);
}

/** Texto em pt-BR (anos e meses de calendário), ou null se não for calculável. */
export function formatWorkExperienceBlockDurationPt(entry: WorkExperienceEntry): string | null {
    if (!entry.start_date || !ISO_DATE_ONLY.test(entry.start_date)) {
        return null;
    }
    const endIso =
        entry.end_date && ISO_DATE_ONLY.test(entry.end_date)
            ? entry.end_date
            : getTodayLocalIsoForDuration();

    if (endIso < entry.start_date) {
        return null;
    }

    const totalMonths = calendarMonthsBetweenStartAndEnd(entry.start_date, endIso);

    if (totalMonths > 0) {
        const years = Math.floor(totalMonths / 12);
        const months = totalMonths % 12;
        if (years === 0) {
            return `${months} ${months === 1 ? "mês" : "meses"}`;
        }
        if (months === 0) {
            return `${years} ${years === 1 ? "ano" : "anos"}`;
        }
        return `${years} ${years === 1 ? "ano" : "anos"} e ${months} ${months === 1 ? "mês" : "meses"}`;
    }

    const y = getWorkExperienceBlockDurationYears(entry);
    if (y > 0) {
        return "menos de 1 mês";
    }
    return null;
}

/**
 * Soma as durações de cada bloco com data de início (fim ausente = até hoje).
 * Blocos sem start_date contribuem com 0 anos (descrição não é parseada aqui).
 */
export function sumWorkExperienceYears(entries: WorkExperienceEntry[]): number {
    let total = 0;
    for (const e of entries) {
        total += getWorkExperienceBlockDurationYears(e);
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
