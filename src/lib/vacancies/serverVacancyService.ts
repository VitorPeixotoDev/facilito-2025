/**
 * Serviço server-side para buscar vagas do Supabase
 */

import { createClient } from '@/utils/supabase/server';
import type { Job, JobDisplay, WorkModel } from './types';

/**
 * Parseia uma string de skills separadas por vírgula/linha em array
 */
function parseSkills(skillsText: string | null): string[] {
    if (!skillsText) return [];
    return skillsText
        .split(/[,\n]/)
        .map((skill) => skill.trim())
        .filter((skill) => skill.length > 0);
}

/**
 * Formata work_model para exibição
 */
function formatWorkModel(workModel: WorkModel | null): string {
    switch (workModel) {
        case 'presencial':
            return 'Presencial';
        case 'remoto':
            return 'Remoto';
        case 'hibrido':
            return 'Híbrido';
        default:
            return 'Não especificado';
    }
}

/**
 * Busca vagas disponíveis (status === 'recebendo_candidatos')
 */
export async function fetchAvailableJobs(): Promise<JobDisplay[]> {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('jobs')
            .select('*')
            .eq('status', 'recebendo_candidatos')
            .order('created_at', { ascending: false });

        if (error) {
            // Erro comum: RLS bloqueando acesso
            if (error.code === '42501' || error.message.includes('row-level security')) {
                console.error(
                    'Erro RLS ao buscar vagas. Verifique se as políticas RLS estão configuradas corretamente.\n',
                    'Execute: docs/SQL/fix_rls_for_jobs.sql\n',
                    'Erro:', error
                );
            } else {
                console.error('Erro ao buscar vagas:', error);
            }
            return [];
        }

        // Transforma os dados do banco para o formato de exibição na UI
        return (data || []).map((row: Job): JobDisplay => ({
            id: row.id,
            titulo: row.title || 'Vaga sem título',
            localizacao: row.work_address || 'Localização não informada',
            tipo: formatWorkModel(row.work_model),
            salario: row.salary_range || 'A combinar',
            descricao: row.description || '',
            requisitos: parseSkills(row.required_skills),
            habilidadesPreferidas: parseSkills(row.preferred_skills),
            data_publicacao: row.created_at,
            status: row.status,
            numero_candidatos: row.applications_count,
            latitude: row.latitude ? Number(row.latitude) : null,
            longitude: row.longitude ? Number(row.longitude) : null,
            work_model: row.work_model,
            benefits: row.benefits,
            company_culture: row.company_culture,
            selection_stages: row.selection_stages,
            behavioral_competencies: row.behavioral_competencies,
            recruiter_location_code_id: row.recruiter_location_code_id ?? null,
        }));
    } catch (error) {
        console.error('Erro ao buscar vagas:', error);
        return [];
    }
}

/**
 * Busca vagas pelo código de localização de 6 dígitos.
 * Consulta recruiter_location_codes pelo code_6_digits e filtra jobs por recruiter_location_code_id.
 */
export async function fetchJobsByLocationCode(code: string): Promise<JobDisplay[]> {
    const normalized = code.replace(/\D/g, '').slice(0, 6);
    if (normalized.length !== 6) {
        return [];
    }

    try {
        const supabase = await createClient();

        const { data: codeRow, error: codeError } = await supabase
            .from('recruiter_location_codes')
            .select('id')
            .eq('code_6_digits', normalized)
            .maybeSingle();

        if (codeError || !codeRow?.id) {
            return [];
        }

        const { data, error } = await supabase
            .from('jobs')
            .select('*')
            .eq('status', 'recebendo_candidatos')
            .eq('recruiter_location_code_id', codeRow.id)
            .order('created_at', { ascending: false });

        if (error) {
            if (error.code === '42P01' || error.message.includes('does not exist')) {
                return [];
            }
            console.error('Erro ao buscar vagas por código:', error);
            return [];
        }

        return (data || []).map((row: Job): JobDisplay => ({
            id: row.id,
            titulo: row.title || 'Vaga sem título',
            localizacao: row.work_address || 'Localização não informada',
            tipo: formatWorkModel(row.work_model),
            salario: row.salary_range || 'A combinar',
            descricao: row.description || '',
            requisitos: parseSkills(row.required_skills),
            habilidadesPreferidas: parseSkills(row.preferred_skills),
            data_publicacao: row.created_at,
            status: row.status,
            numero_candidatos: row.applications_count,
            latitude: row.latitude ? Number(row.latitude) : null,
            longitude: row.longitude ? Number(row.longitude) : null,
            work_model: row.work_model,
            benefits: row.benefits,
            company_culture: row.company_culture,
            selection_stages: row.selection_stages,
            behavioral_competencies: row.behavioral_competencies,
            recruiter_location_code_id: row.recruiter_location_code_id ?? null,
        }));
    } catch (error) {
        console.error('Erro ao buscar vagas por código:', error);
        return [];
    }
}

/**
 * Busca candidaturas do usuário
 * Nota: Se a tabela job_applications não existir, retorna array vazio
 * O cliente usará localStorage como fallback
 */
export async function fetchUserApplications(userId: string): Promise<string[]> {
    try {
        const supabase = await createClient();

        // Tenta buscar da tabela job_applications
        // Se não existir, o erro será silenciosamente ignorado e retornará []
        const { data, error } = await supabase
            .from('job_applications')
            .select('job_id')
            .eq('user_id', userId);

        if (error) {
            // Se a tabela não existe, retorna vazio (usará localStorage)
            if (error.code === '42P01' || error.message.includes('does not exist')) {
                return [];
            }
            console.error('Erro ao buscar candidaturas:', error);
            return [];
        }

        return (data || []).map((row: any) => row.job_id);
    } catch (error) {
        // Em caso de erro, retorna vazio (usará localStorage)
        return [];
    }
}
