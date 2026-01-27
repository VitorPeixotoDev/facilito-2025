'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'
import { getURL } from '@/utils/get-url'

export async function login(email: string, password: string) {
    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        throw new Error(error.message)
    }

    // Verificar app_type após login bem-sucedido
    const { data: { user } } = await supabase.auth.getUser()

    if (user && user.user_metadata?.app_type && user.user_metadata.app_type !== 'user') {
        // Esta conta pertence a outra aplicação (recruiter, etc)
        await supabase.auth.signOut({ scope: 'global' })
        throw new Error('Esta conta pertence a outra aplicação e não pode acessar este painel.')
    }

    revalidatePath('/', 'layout')
    redirect('/applicant')
}

export async function signup(email: string, password: string) {
    const supabase = await createClient()

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: 'https://facilitovagas.com/auth/callback',
            data: {
                app_type: 'user',
            },
        },
    })

    if (error) {
        throw new Error(error.message)
    }

    // Não redireciona automaticamente para permitir confirmação de email
    return { success: true, message: 'Verifique seu email para confirmar a conta' }
}

export async function resetPassword(email: string) {
    const supabase = await createClient()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${getURL()}auth/reset-password`,
    })

    if (error) {
        throw new Error(error.message)
    }

    return { success: true, message: 'Email de recuperação enviado' }
}

export async function signInWithGoogle() {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `https://facilitovagas.com/auth/callback`,
        },
    })

    if (error) {
        throw new Error(error.message)
    }

    if (data.url) {
        redirect(data.url)
    }
}

export async function updatePassword(newPassword: string) {
    const supabase = await createClient()

    const { error } = await supabase.auth.updateUser({
        password: newPassword,
    })

    if (error) {
        throw new Error(error.message)
    }

    return { success: true, message: 'Senha atualizada com sucesso' }
}

export async function signOut() {
    const supabase = await createClient()

    // Usar scope: 'global' para limpar TODOS os tokens (incluindo OAuth)
    const { error } = await supabase.auth.signOut({ scope: 'global' })

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath('/', 'layout')
    // Não fazer redirect aqui - deixar o client component fazer o redirect
    // Isso evita conflitos e garante que o storage seja limpo antes
}