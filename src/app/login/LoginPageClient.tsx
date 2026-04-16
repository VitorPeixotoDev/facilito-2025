'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { login, signup, resetPassword, signInWithGoogle } from './actions'

function isNextRedirectError(error: unknown): boolean {
    if (!error || typeof error !== 'object') return false

    const redirectDigest = 'digest' in error ? (error as { digest?: unknown }).digest : undefined
    if (typeof redirectDigest === 'string' && redirectDigest.includes('NEXT_REDIRECT')) {
        return true
    }

    const message = 'message' in error ? (error as { message?: unknown }).message : undefined
    return typeof message === 'string' && message.includes('NEXT_REDIRECT')
}

export default function LoginPageClient() {
    const [isLogin, setIsLogin] = useState(true)
    const [isResetPassword, setIsResetPassword] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState('')
    const searchParams = useSearchParams()

    // Verificar se há erro na URL (app_type mismatch)
    useEffect(() => {
        const error = searchParams.get('error')
        if (error === 'app_type_mismatch') {
            setMessage('Esta conta pertence a outra aplicação e não pode acessar este painel.')
        }
    }, [searchParams])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setMessage('')

        try {
            if (isResetPassword) {
                await resetPassword(email)
                setMessage('Email de recuperação enviado! Verifique sua caixa de entrada.')
            } else if (isLogin) {
                await login(email, password)
            } else {
                if (password !== confirmPassword) {
                    setMessage('As senhas não coincidem!')
                    setIsLoading(false)
                    return
                }
                await signup(email, password)
            }
        } catch (error) {
            if (isNextRedirectError(error)) {
                return
            }

            // Exibir mensagem de erro específica se for sobre app_type, senão mensagem genérica
            const errorMessage = error instanceof Error ? error.message : 'Erro ao processar solicitação. Tente novamente.'
            setMessage(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleSignIn = async () => {
        setIsLoading(true)
        try {
            await signInWithGoogle()
        } catch (error) {
            setMessage('Erro ao fazer login com Google. Tente novamente.')
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-[#e3f2f3] to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center">
                            {isResetPassword ? 'Recuperar Senha' : isLogin ? 'Entrar' : 'Criar Conta'}
                        </h2>
                        <p className="mt-2 text-sm text-slate-600 text-center">
                            {isResetPassword
                                ? 'Digite seu email para receber instruções de recuperação'
                                : isLogin
                                    ? 'Entre com sua conta existente'
                                    : 'Crie uma nova conta'
                            }
                        </p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 placeholder:text-slate-400 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#5e9ea0] focus:border-[#5e9ea0]"
                                    placeholder="seu@email.com"
                                />
                            </div>

                            {!isResetPassword && (
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                                        Senha
                                    </label>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="mt-1 block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 placeholder:text-slate-400 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#5e9ea0] focus:border-[#5e9ea0]"
                                        placeholder="Sua senha"
                                    />
                                </div>
                            )}

                            {!isLogin && !isResetPassword && (
                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
                                        Confirmar Senha
                                    </label>
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="mt-1 block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 placeholder:text-slate-400 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#5e9ea0] focus:border-[#5e9ea0]"
                                        placeholder="Confirme sua senha"
                                    />
                                </div>
                            )}
                        </div>

                        {message && (
                            <div className={`text-sm text-center p-3 rounded-xl ${message.includes('Erro') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                                {message}
                            </div>
                        )}

                        <div className="space-y-3">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-3 px-4 text-sm font-medium rounded-full text-white bg-[#5e9ea0] hover:bg-[#4d8a8c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5e9ea0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isLoading ? 'Processando...' : isResetPassword ? 'Enviar Email' : isLogin ? 'Entrar' : 'Criar Conta'}
                            </button>

                            {!isResetPassword && (
                                <button
                                    type="button"
                                    onClick={handleGoogleSignIn}
                                    disabled={isLoading}
                                    className="w-full flex justify-center items-center py-3 px-4 border border-slate-200 text-sm font-medium rounded-full text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5e9ea0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    Continuar com Google
                                </button>
                            )}
                        </div>

                        <div className="text-center space-y-2">
                            {!isResetPassword ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => setIsLogin(!isLogin)}
                                        className="text-[#5e9ea0] hover:text-[#4d8a8c] text-sm font-medium"
                                    >
                                        {isLogin ? 'Não tem conta? Criar conta' : 'Já tem conta? Entrar'}
                                    </button>
                                    <div>
                                        <button
                                            type="button"
                                            onClick={() => setIsResetPassword(true)}
                                            className="text-slate-600 hover:text-slate-700 text-sm"
                                        >
                                            Esqueceu sua senha?
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsResetPassword(false)
                                        setMessage('')
                                    }}
                                    className="text-[#5e9ea0] hover:text-[#4d8a8c] text-sm font-medium"
                                >
                                    Voltar ao login
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

