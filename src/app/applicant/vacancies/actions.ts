'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { fetchUserProfileServer } from '@/lib/user/serverUserService';
import { fetchJobsByLocationCode } from '@/lib/vacancies/serverVacancyService';
import type { JobDisplay } from '@/lib/vacancies/types';

interface ValidationError {
    success: false;
    error: 'MISSING_DATA';
    missingFields: {
        whatsapp?: boolean;
        email?: boolean;
        address?: boolean;
    };
}

/**
 * Cria uma candidatura para uma vaga
 */
export async function applyToJob(
    jobId: string
): Promise<{ success: boolean; error?: string } | ValidationError> {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Usuário não autenticado' };
        }

        // Buscar perfil do usuário para validar dados obrigatórios
        const profile = await fetchUserProfileServer(user.id);

        if (!profile) {
            return {
                success: false,
                error: 'MISSING_DATA',
                missingFields: {
                    whatsapp: true,
                    address: true,
                },
            };
        }

        // Função auxiliar para verificar se um campo de texto está preenchido
        // Retorna true apenas se o valor for uma string não vazia (após trim) e não for "EMPTY"
        const isValidField = (value: string | null | undefined): boolean => {
            if (value === null || value === undefined) return false;
            if (typeof value !== 'string') return false;
            const trimmed = value.trim();
            // Considera inválido se estiver vazio ou for a string "EMPTY" (case insensitive)
            if (trimmed.length === 0) return false;
            if (trimmed.toUpperCase() === 'EMPTY') return false;
            return true;
        };

        // Validar campos obrigatórios
        const missingFields: ValidationError['missingFields'] = {};
        let hasValidationError = false;

        // Verificar se tem WhatsApp válido na tabela public.users
        const whatsappValue = profile.whatsapp ?? null;
        const hasValidWhatsApp = isValidField(whatsappValue);

        if (!hasValidWhatsApp) {
            missingFields.whatsapp = true;
            hasValidationError = true;
        }

        // Verificar se tem endereço válido na tabela public.users
        // home_address deve ser um objeto JSONB com latitude, longitude e description válidos
        const addressValue = profile.home_address;
        const hasValidAddress = !!(
            addressValue &&
            typeof addressValue === 'object' &&
            addressValue !== null &&
            'latitude' in addressValue &&
            'longitude' in addressValue &&
            'description' in addressValue &&
            typeof addressValue.latitude === 'number' &&
            typeof addressValue.longitude === 'number' &&
            isValidField(String(addressValue.description))
        );

        if (!hasValidAddress) {
            missingFields.address = true;
            hasValidationError = true;
        }

        // Se faltam dados, bloqueia a candidatura
        if (hasValidationError) {
            return {
                success: false,
                error: 'MISSING_DATA',
                missingFields,
            };
        }

        // Tenta inserir na tabela job_applications se existir
        const { error } = await supabase.from('job_applications').insert({
            job_id: jobId,
            user_id: user.id,
        });

        if (error) {
            // Se a tabela não existe, retorna sucesso mesmo assim (usará localStorage no cliente)
            if (error.code === '42P01' || error.message.includes('does not exist')) {
                return { success: true };
            }
            // Se já existe, considera sucesso (idempotente)
            if (error.code === '23505') {
                return { success: true };
            }
            console.error('Erro ao criar candidatura:', error);
            return { success: false, error: error.message };
        }

        // Atualiza o contador de candidaturas na vaga
        try {
            await supabase.rpc('increment_job_applications', { job_id: jobId });
        } catch {
            // Ignora erro se a função RPC não existir
        }

        revalidatePath('/applicant/vacancies');
        return { success: true };
    } catch (error) {
        console.error('Erro ao criar candidatura:', error);
        return { success: false, error: 'Erro ao processar candidatura' };
    }
}

/**
 * Remove uma candidatura de uma vaga
 */
export async function removeApplication(jobId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Usuário não autenticado' };
        }

        // Tenta remover da tabela job_applications se existir
        const { error } = await supabase
            .from('job_applications')
            .delete()
            .eq('job_id', jobId)
            .eq('user_id', user.id);

        if (error) {
            // Se a tabela não existe, retorna sucesso mesmo assim (usará localStorage no cliente)
            if (error.code === '42P01' || error.message.includes('does not exist')) {
                return { success: true };
            }
            console.error('Erro ao remover candidatura:', error);
            return { success: false, error: error.message };
        }

        // Atualiza o contador de candidaturas na vaga
        try {
            await supabase.rpc('decrement_job_applications', { job_id: jobId });
        } catch {
            // Ignora erro se a função RPC não existir
        }

        revalidatePath('/applicant/vacancies');
        return { success: true };
    } catch (error) {
        console.error('Erro ao remover candidatura:', error);
        return { success: false, error: 'Erro ao processar remoção de candidatura' };
    }
}

/**
 * Busca vagas pelo código de localização de 6 dígitos.
 * Consulta recruiter_location_codes e retorna jobs com recruiter_location_code_id correspondente.
 */
export async function getJobsByLocationCode(code: string): Promise<{ jobs: JobDisplay[] }> {
    const jobs = await fetchJobsByLocationCode(code);
    return { jobs };
}
