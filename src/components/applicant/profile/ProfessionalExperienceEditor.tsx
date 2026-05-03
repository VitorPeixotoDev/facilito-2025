"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Briefcase, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { getTodayLocalIsoDate } from "./utils";
import { JOB_TITLE_SUGGESTIONS } from "@/lib/constants/job_titles";
import {
    createEmptyWorkExperienceBlock,
    sumWorkExperienceYears,
    type WorkExperienceEntry,
} from "@/lib/workExperience";
import {
    getWorkExperienceFieldError,
    mapZodIssuesToFieldErrorsRecord,
    validateWorkExperienceList,
} from "@/lib/validation/workExperienceSchema";

const ROLE_SUGGESTIONS = Array.from(new Set(JOB_TITLE_SUGGESTIONS)).sort((a, b) =>
    a.localeCompare(b, "pt-BR")
);

const INPUT_ERROR_RING = "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/40";

const findSuggestionMatch = (value: string, suggestions: string[]) => {
    const normalizedValue = value.trim().toLocaleLowerCase();
    return suggestions.find((item) => item.toLocaleLowerCase() === normalizedValue);
};

const getFilteredSuggestions = (value: string, suggestions: string[]) => {
    const query = value.trim().toLocaleLowerCase();
    if (!query) {
        return [];
    }
    return suggestions
        .filter((item) => item.toLocaleLowerCase().includes(query))
        .slice(0, 8);
};

interface ProfessionalExperienceEditorProps {
    entries: WorkExperienceEntry[];
    onChange: (entries: WorkExperienceEntry[]) => void;
    onSave: (entries: WorkExperienceEntry[]) => Promise<void>;
    isSaving: boolean;
}

function updateEntry(
    entries: WorkExperienceEntry[],
    index: number,
    patch: Partial<WorkExperienceEntry>
): WorkExperienceEntry[] {
    return entries.map((e, i) => (i === index ? { ...e, ...patch } : e));
}

export function ProfessionalExperienceEditor({
    entries,
    onChange,
    onSave,
    isSaving,
}: ProfessionalExperienceEditorProps) {
    const [dirty, setDirty] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const todayIso = getTodayLocalIsoDate();

    const totalYearsLabel = useMemo(() => {
        const y = sumWorkExperienceYears(entries);
        if (y <= 0) {
            return null;
        }
        return y >= 1 ? `${y.toFixed(1)} anos somados` : `${Math.round(y * 12)} meses (aprox.)`;
    }, [entries]);

    const hasFieldErrors = Object.keys(fieldErrors).length > 0;

    const markDirty = () => {
        setDirty(true);
        setFieldErrors({});
    };

    const ensureAtLeastOne = () => {
        if (entries.length === 0) {
            onChange([createEmptyWorkExperienceBlock()]);
            markDirty();
        }
    };

    const addBlock = () => {
        onChange([...entries, createEmptyWorkExperienceBlock()]);
        markDirty();
    };

    const removeBlock = (index: number) => {
        const next = entries.filter((_, i) => i !== index);
        onChange(next);
        markDirty();
    };

    const handleRoleInputChange = (index: number, value: string) => {
        const suggestionMatch = findSuggestionMatch(value, ROLE_SUGGESTIONS);
        if (suggestionMatch) {
            onChange(updateEntry(entries, index, { role: suggestionMatch }));
            markDirty();
            return;
        }
        onChange(updateEntry(entries, index, { role: value }));
        markDirty();
    };

    const handleSave = async () => {
        const checked = validateWorkExperienceList(entries);
        if (!checked.success) {
            setFieldErrors(mapZodIssuesToFieldErrorsRecord(checked.issues));
            return;
        }
        setFieldErrors({});
        await onSave(checked.data);
        setDirty(false);
    };

    const err = (blockIndex: number, field: string) =>
        getWorkExperienceFieldError(fieldErrors, blockIndex, field);

    return (
        <Card className="p-4 sm:p-6 shadow-lg mb-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-bold text-[#111] flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-[#5f9ea0]" />
                    <span>
                        Experiência Profissional <span className="text-red-500">*</span>
                    </span>
                </h2>
                {totalYearsLabel && (
                    <p className="text-xs font-medium text-[#3f787a] sm:text-sm">{totalYearsLabel}</p>
                )}
            </div>
            <p className="mb-4 text-sm text-slate-600">
                Adicione cada experiência com empresa, cargo, período e, se quiser, uma descrição. Você pode
                incluir vários blocos. Todas as experiências listadas precisam estar completas e com datas
                válidas (não futuras) para salvar.
            </p>

            {hasFieldErrors && (
                <div
                    className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
                    role="status"
                >
                    Corrija os campos destacados em vermelho em cada experiência.
                </div>
            )}

            {entries.length === 0 ? (
                <div className="rounded-md border border-dashed border-[#5f9ea0]/40 bg-[#5f9ea0]/5 p-6 text-center">
                    <p className="mb-3 text-sm text-slate-600">Nenhuma experiência cadastrada ainda.</p>
                    <button
                        type="button"
                        onClick={ensureAtLeastOne}
                        className="inline-flex items-center gap-2 rounded-md bg-[#5f9ea0] px-4 py-2 text-sm font-medium text-white hover:bg-[#4a8b8f] transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        Adicionar experiência
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {entries.map((entry, index) => {
                        const roleSuggestions = getFilteredSuggestions(entry.role, ROLE_SUGGESTIONS);
                        const isCurrent = Boolean(entry.start_date && !entry.end_date);
                        const companyErr = err(index, "company");
                        const roleErr = err(index, "role");
                        const startErr = err(index, "start_date");
                        const endErr = err(index, "end_date");
                        const descriptionErr = err(index, "description");

                        return (
                            <div
                                key={entry.id}
                                className={cn(
                                    "rounded-lg border bg-slate-50/80 p-4 shadow-sm",
                                    companyErr || roleErr || startErr || endErr || descriptionErr
                                        ? "border-red-300"
                                        : "border-slate-200"
                                )}
                            >
                                <div className="mb-3 flex items-center justify-between gap-2">
                                    <span className="text-xs font-semibold uppercase tracking-wide text-[#5f9ea0]">
                                        Experiência {index + 1}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => removeBlock(index)}
                                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-red-600 hover:bg-red-50 transition-colors"
                                        aria-label={`Remover experiência ${index + 1}`}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        Remover
                                    </button>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="sm:col-span-2">
                                        <label
                                            className="mb-1 block text-xs font-medium text-slate-600"
                                            htmlFor={`exp-${entry.id}-company`}
                                        >
                                            Empresa
                                        </label>
                                        <Input
                                            id={`exp-${entry.id}-company`}
                                            value={entry.company}
                                            onChange={(e) => {
                                                onChange(updateEntry(entries, index, { company: e.target.value }));
                                                markDirty();
                                            }}
                                            placeholder="Nome da empresa"
                                            className={cn("bg-white", companyErr && INPUT_ERROR_RING)}
                                            aria-invalid={!!companyErr}
                                            aria-describedby={companyErr ? `exp-${entry.id}-company-err` : undefined}
                                        />
                                        {companyErr ? (
                                            <p
                                                id={`exp-${entry.id}-company-err`}
                                                className="mt-1 text-xs text-red-600"
                                                role="alert"
                                            >
                                                {companyErr}
                                            </p>
                                        ) : null}
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label
                                            className="mb-1 block text-xs font-medium text-slate-600"
                                            htmlFor={`exp-${entry.id}-role`}
                                        >
                                            Cargo
                                        </label>
                                        <Input
                                            id={`exp-${entry.id}-role`}
                                            value={entry.role}
                                            onChange={(e) => handleRoleInputChange(index, e.target.value)}
                                            placeholder="Digite ou selecione um cargo..."
                                            className={cn("bg-white", roleErr && INPUT_ERROR_RING)}
                                            aria-invalid={!!roleErr}
                                            aria-describedby={roleErr ? `exp-${entry.id}-role-err` : undefined}
                                        />
                                        {roleErr ? (
                                            <p
                                                id={`exp-${entry.id}-role-err`}
                                                className="mt-1 text-xs text-red-600"
                                                role="alert"
                                            >
                                                {roleErr}
                                            </p>
                                        ) : null}
                                        {roleSuggestions.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {roleSuggestions.map((suggestion) => (
                                                    <button
                                                        key={suggestion}
                                                        type="button"
                                                        onClick={() => {
                                                            onChange(updateEntry(entries, index, { role: suggestion }));
                                                            markDirty();
                                                        }}
                                                        className="rounded-full border border-[#5f9ea0]/30 bg-white px-3 py-1 text-sm text-[#1f4f51] transition-colors hover:bg-[#5f9ea0]/15"
                                                    >
                                                        {suggestion}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label
                                            className="mb-1 block text-xs font-medium text-slate-600"
                                            htmlFor={`exp-${entry.id}-start`}
                                        >
                                            Data de início
                                        </label>
                                        <Input
                                            id={`exp-${entry.id}-start`}
                                            type="date"
                                            max={todayIso}
                                            value={entry.start_date ?? ""}
                                            onChange={(e) => {
                                                const v = e.target.value || null;
                                                onChange(updateEntry(entries, index, { start_date: v }));
                                                markDirty();
                                            }}
                                            className={cn("bg-white", startErr && INPUT_ERROR_RING)}
                                            aria-invalid={!!startErr}
                                            aria-describedby={startErr ? `exp-${entry.id}-start-err` : undefined}
                                        />
                                        {startErr ? (
                                            <p
                                                id={`exp-${entry.id}-start-err`}
                                                className="mt-1 text-xs text-red-600"
                                                role="alert"
                                            >
                                                {startErr}
                                            </p>
                                        ) : null}
                                    </div>
                                    <div>
                                        <label
                                            className="mb-1 block text-xs font-medium text-slate-600"
                                            htmlFor={`exp-${entry.id}-end`}
                                        >
                                            Data de término
                                        </label>
                                        <Input
                                            id={`exp-${entry.id}-end`}
                                            type="date"
                                            max={todayIso}
                                            min={entry.start_date ?? undefined}
                                            value={entry.end_date ?? ""}
                                            onChange={(e) => {
                                                const v = e.target.value || null;
                                                onChange(updateEntry(entries, index, { end_date: v }));
                                                markDirty();
                                            }}
                                            disabled={isCurrent}
                                            className={cn(
                                                "bg-white disabled:cursor-not-allowed disabled:opacity-60",
                                                endErr && INPUT_ERROR_RING
                                            )}
                                            aria-invalid={!!endErr}
                                            aria-describedby={endErr ? `exp-${entry.id}-end-err` : undefined}
                                        />
                                        {endErr ? (
                                            <p
                                                id={`exp-${entry.id}-end-err`}
                                                className="mt-1 text-xs text-red-600"
                                                role="alert"
                                            >
                                                {endErr}
                                            </p>
                                        ) : null}
                                        <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                                            <input
                                                type="checkbox"
                                                checked={isCurrent}
                                                disabled={!entry.start_date}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        onChange(updateEntry(entries, index, { end_date: null }));
                                                    } else {
                                                        onChange(
                                                            updateEntry(entries, index, {
                                                                end_date: getTodayLocalIsoDate(),
                                                            })
                                                        );
                                                    }
                                                    markDirty();
                                                }}
                                                className="rounded border-slate-300 text-[#5f9ea0] focus:ring-[#5f9ea0]"
                                            />
                                            Ainda trabalho aqui
                                        </label>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label
                                            className="mb-1 block text-xs font-medium text-slate-600"
                                            htmlFor={`exp-${entry.id}-description`}
                                        >
                                            Descrição (opcional)
                                        </label>
                                        <textarea
                                            id={`exp-${entry.id}-description`}
                                            value={entry.description}
                                            onChange={(e) => {
                                                onChange(updateEntry(entries, index, { description: e.target.value }));
                                                markDirty();
                                            }}
                                            placeholder="Atividades, conquistas, tecnologias..."
                                            rows={3}
                                            className={cn(
                                                "text-gray-700 flex w-full rounded-md border bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-1",
                                                descriptionErr
                                                    ? cn("border-red-500 focus:ring-red-500/40")
                                                    : "border-slate-300 focus:ring-[#5e9ea0]"
                                            )}
                                            aria-invalid={!!descriptionErr}
                                            aria-describedby={
                                                descriptionErr ? `exp-${entry.id}-description-err` : undefined
                                            }
                                        />
                                        {descriptionErr ? (
                                            <p
                                                id={`exp-${entry.id}-description-err`}
                                                className="mt-1 text-xs text-red-600"
                                                role="alert"
                                            >
                                                {descriptionErr}
                                            </p>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    <button
                        type="button"
                        onClick={addBlock}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-[#5f9ea0]/50 py-2 text-sm font-medium text-[#2f6668] hover:bg-[#5f9ea0]/10 transition-colors sm:w-auto sm:px-4"
                    >
                        <Plus className="h-4 w-4" />
                        Adicionar outra experiência
                    </button>
                </div>
            )}

            {entries.length > 0 && (
                <div className="mt-4 flex justify-end">
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving || !dirty}
                        className="rounded-md bg-[#5f9ea0] px-4 py-2 text-white transition-colors hover:bg-[#4a8b8f] disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                        {isSaving ? "Salvando..." : "Salvar experiências"}
                    </button>
                </div>
            )}
        </Card>
    );
}
