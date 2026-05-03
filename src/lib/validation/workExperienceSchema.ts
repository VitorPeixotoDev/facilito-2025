import { z } from "zod";
import { getTodayLocalIsoDate } from "@/components/applicant/profile/utils";
import type { WorkExperienceEntry } from "@/lib/workExperience";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Chaves no formato `${índiceDoBloco}::${nomeDoCampo}` (ex.: `0::company`). */
export function mapZodIssuesToFieldErrorsRecord(issues: z.ZodIssue[]): Record<string, string> {
    const out: Record<string, string> = {};
    for (const issue of issues) {
        const path = issue.path ?? [];
        if (path.length >= 2 && typeof path[0] === "number" && typeof path[1] === "string") {
            const key = `${path[0]}::${path[1]}`;
            if (out[key] === undefined) {
                out[key] = issue.message;
            }
        }
    }
    return out;
}

export function getWorkExperienceFieldError(
    errors: Record<string, string>,
    blockIndex: number,
    field: string
): string | undefined {
    return errors[`${blockIndex}::${field}`];
}

function formatIssueMessage(issues: z.ZodIssue[]): string {
    const first = issues[0];
    if (!first) {
        return "Não foi possível validar as experiências profissionais.";
    }
    const path = first.path ?? [];
    const blockIndex = typeof path[0] === "number" ? (path[0] as number) + 1 : null;
    const prefix = blockIndex != null ? `Experiência ${blockIndex}: ` : "";
    return `${prefix}${first.message}`;
}

export const workExperienceEntrySchema = z
    .object({
        id: z.string().min(1, { message: "Identificador interno inválido." }),
        company: z.string().max(300, { message: "O nome da empresa pode ter no máximo 300 caracteres." }),
        role: z.string().max(200, { message: "O cargo pode ter no máximo 200 caracteres." }),
        description: z.string().max(6000, { message: "A descrição pode ter no máximo 6000 caracteres." }).default(""),
        start_date: z.union([z.string(), z.null()]),
        end_date: z.union([z.string(), z.null()]),
    })
    .superRefine((data, ctx) => {
        if (!data.company.trim()) {
            ctx.addIssue({
                code: "custom",
                message: "Informe o nome da empresa.",
                path: ["company"],
            });
        }
        if (!data.role.trim()) {
            ctx.addIssue({
                code: "custom",
                message: "Informe o cargo.",
                path: ["role"],
            });
        }

        const today = getTodayLocalIsoDate();

        const startRaw = data.start_date;
        const start =
            startRaw === null || startRaw === undefined || startRaw === ""
                ? null
                : String(startRaw).trim().slice(0, 10);

        if (!start) {
            ctx.addIssue({
                code: "custom",
                message: "Informe a data de início.",
                path: ["start_date"],
            });
        } else if (!ISO_DATE.test(start)) {
            ctx.addIssue({
                code: "custom",
                message: "Data de início inválida. Use o formato AAAA-MM-DD.",
                path: ["start_date"],
            });
        } else if (start > today) {
            ctx.addIssue({
                code: "custom",
                message: "A data de início não pode ser posterior a hoje.",
                path: ["start_date"],
            });
        }

        const endRaw = data.end_date;
        const end =
            endRaw === null || endRaw === undefined || endRaw === ""
                ? null
                : String(endRaw).trim().slice(0, 10);

        if (end !== null) {
            if (!ISO_DATE.test(end)) {
                ctx.addIssue({
                    code: "custom",
                    message: "Data de término inválida. Use o formato AAAA-MM-DD.",
                    path: ["end_date"],
                });
            } else if (end > today) {
                ctx.addIssue({
                    code: "custom",
                    message: "A data de término não pode ser posterior a hoje.",
                    path: ["end_date"],
                });
            } else if (start && ISO_DATE.test(start) && end < start) {
                ctx.addIssue({
                    code: "custom",
                    message: "A data de término deve ser igual ou posterior à data de início.",
                    path: ["end_date"],
                });
            }
        }
    })
    .transform((data): WorkExperienceEntry => {
        const start =
            data.start_date === null || data.start_date === undefined || data.start_date === ""
                ? ""
                : String(data.start_date).trim().slice(0, 10);
        const end =
            data.end_date === null || data.end_date === undefined || data.end_date === ""
                ? null
                : String(data.end_date).trim().slice(0, 10);
        return {
            id: data.id,
            company: data.company.trim(),
            role: data.role.trim(),
            description: (data.description ?? "").trim(),
            start_date: start.length > 0 ? start : null,
            end_date: end,
        };
    });

export const workExperienceListSchema = z.array(workExperienceEntrySchema);

export function validateWorkExperienceList(entries: WorkExperienceEntry[]):
    | { success: true; data: WorkExperienceEntry[] }
    | { success: false; message: string; issues: z.ZodIssue[] } {
    if (!entries || entries.length === 0) {
        return { success: true, data: [] };
    }

    const result = workExperienceListSchema.safeParse(entries);
    if (result.success) {
        return { success: true, data: result.data };
    }

    return {
        success: false,
        message: formatIssueMessage(result.error.issues),
        issues: result.error.issues,
    };
}
