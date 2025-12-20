'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Cria uma candidatura para uma vaga
 */
export async function applyToJob(jobId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Usuário não autenticado' };
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
        await supabase.rpc('increment_job_applications', { job_id: jobId }).catch(() => {
            // Ignora erro se a função RPC não existir
        });

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
        await supabase.rpc('decrement_job_applications', { job_id: jobId }).catch(() => {
            // Ignora erro se a função RPC não existir
        });

        revalidatePath('/applicant/vacancies');
        return { success: true };
    } catch (error) {
        console.error('Erro ao remover candidatura:', error);
        return { success: false, error: 'Erro ao processar remoção de candidatura' };
    }
}
