'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { login, signup, resetPassword, signInWithGoogle } from '../app/login/actions'

interface LoginModalProps {
    isOpen: boolean
    onClose: () => void
    initialMode?: 'login' | 'signup'
}

export default function LoginModal({ isOpen, onClose, initialMode = 'login' }: LoginModalProps) {
    const [isLogin, setIsLogin] = useState(initialMode !== 'signup')
    const [isResetPassword, setIsResetPassword] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [emailSent, setEmailSent] = useState(false)

    // Ajustar o modo inicial (login ou criar conta) sempre que o modal abrir
    useEffect(() => {
        if (!isOpen) return
        setIsResetPassword(false)
        setIsLogin(initialMode !== 'signup')
        setEmailSent(false)
        setMessage('')
    }, [isOpen, initialMode])

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
                setEmailSent(true)
                setMessage('')
            }
        } catch (error) {
            setMessage('Erro ao processar solicitação. Tente novamente.')
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

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6">
            <div className="bg-white/95 backdrop-blur-md rounded-3xl w-full max-w-md sm:max-w-lg max-h-[92vh] overflow-y-auto shadow-xl border border-slate-200">
                <div className="p-5 sm:p-7">
                    {/* Logo */}
                    <div className="flex justify-center mb-4">
                        <Image
                            src="/logo_horizontal.png"
                            alt="Facilitô! Vagas"
                            width={150}
                            height={40}
                            className="h-8 w-auto"
                        />
                    </div>

                    <div className="flex items-start justify-between gap-3 mb-4">
                        <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">
                            {isResetPassword ? 'Recuperar Senha' : isLogin ? 'Entrar' : 'Criar Conta'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600 text-xl p-1.5 hover:bg-slate-100 rounded-full transition-colors"
                        >
                            ×
                        </button>
                    </div>

                    <p className="text-sm text-slate-600 mb-5 leading-relaxed">
                        {isResetPassword
                            ? 'Digite seu email para receber instruções de recuperação'
                            : isLogin
                                ? 'Entre com sua conta existente'
                                : 'Crie uma nova conta'
                        }
                    </p>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="text-slate-900 w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#5e9ea0] focus:border-[#5e9ea0] text-sm sm:text-base"
                                placeholder="seu@email.com"
                            />
                        </div>

                        {!isResetPassword && (
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Senha
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="text-slate-900 w-full px-3 py-2 pr-10 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#5e9ea0] focus:border-[#5e9ea0] text-sm sm:text-base"
                                        placeholder="Sua senha"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {!isLogin && !isResetPassword && (
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Confirmar Senha
                                </label>
                                <div className="relative">
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="text-slate-900 w-full px-3 py-2 pr-10 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#5e9ea0] focus:border-[#5e9ea0] text-sm sm:text-base"
                                        placeholder="Confirme sua senha"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                                    >
                                        {showConfirmPassword ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {emailSent && (
                            <div className="bg-emerald-50 text-emerald-700 text-xs sm:text-sm p-3 rounded-lg border border-emerald-100">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    Email de confirmação enviado! Verifique sua caixa de entrada e clique no link para ativar sua conta.
                                </div>
                            </div>
                        )}

                        {message && !emailSent && (
                            <div
                                className={`text-xs sm:text-sm p-3 rounded-lg border ${message.includes('Erro')
                                    ? 'bg-rose-50 text-rose-700 border-rose-100'
                                    : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                    }`}
                            >
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-4 bg-gradient-to-r from-[#5e9ea0] to-[#4a8b8f] text-white rounded-full hover:from-[#4a8b8f] hover:to-[#3b7477] focus:outline-none focus:ring-2 focus:ring-[#5e9ea0] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold shadow-lg hover:shadow-xl text-sm sm:text-base mt-2"
                        >
                            {isLoading ? 'Processando...' : isResetPassword ? 'Enviar Email' : isLogin ? 'Entrar' : 'Criar Conta'}
                        </button>

                        {!isResetPassword && (
                            <button
                                type="button"
                                onClick={handleGoogleSignIn}
                                disabled={isLoading}
                                className="w-full py-3 px-4 border border-slate-200 text-slate-700 rounded-full hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#5e9ea0] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-300 font-medium text-sm sm:text-base"
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

                        <div className="text-center space-y-3 mt-6">
                            {!isResetPassword ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsLogin(!isLogin)
                                            setEmailSent(false)
                                            setMessage('')
                                        }}
                                        className="text-[#5e9ea0] hover:text-[#4a8b8f] text-xs sm:text-sm font-medium transition-colors"
                                    >
                                        {isLogin ? (
                                            <>Não tem conta? <span className="font-semibold">Criar conta</span></>
                                        ) : (
                                            <>Já tem conta? <span className="font-semibold">Entrar</span></>
                                        )}
                                    </button>
                                    <div>
                                        <button
                                            type="button"
                                            onClick={() => setIsResetPassword(true)}
                                            className="text-slate-500 hover:text-slate-600 text-xs sm:text-sm transition-colors"
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
                                        setEmailSent(false)
                                    }}
                                    className="text-[#5e9ea0] hover:text-[#4a8b8f] text-xs sm:text-sm font-medium transition-colors"
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
