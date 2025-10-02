'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

export async function login(email: string, password: string) {
    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signup(email: string, password: string) {
    const supabase = await createClient()

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
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
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
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
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
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

    const { error } = await supabase.auth.signOut()

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath('/', 'layout')
    redirect('/login')
}