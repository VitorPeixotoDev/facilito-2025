'use client'

import { useState } from 'react'
import { login, signup, resetPassword, signInWithGoogle } from './actions'

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true)
    const [isResetPassword, setIsResetPassword] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState('')

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

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        {isResetPassword ? 'Recuperar Senha' : isLogin ? 'Entrar' : 'Criar Conta'}
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        {isResetPassword
                            ? 'Digite seu email para receber instruções de recuperação'
                            : isLogin
                                ? 'Entre com sua conta existente'
                                : 'Crie uma nova conta'
                        }
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="seu@email.com"
                            />
                        </div>

                        {!isResetPassword && (
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Senha
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                    placeholder="Sua senha"
                                />
                            </div>
                        )}

                        {!isLogin && !isResetPassword && (
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                    Confirmar Senha
                                </label>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                    placeholder="Confirme sua senha"
                                />
                            </div>
                        )}
                    </div>

                    {message && (
                        <div className={`text-sm text-center p-3 rounded-md ${message.includes('Erro') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                            }`}>
                            {message}
                        </div>
                    )}

                    <div className="space-y-3">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Processando...' : isResetPassword ? 'Enviar Email' : isLogin ? 'Entrar' : 'Criar Conta'}
                        </button>

                        {!isResetPassword && (
                            <button
                                type="button"
                                onClick={handleGoogleSignIn}
                                disabled={isLoading}
                                className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                    className="text-indigo-600 hover:text-indigo-500 text-sm"
                                >
                                    {isLogin ? 'Não tem conta? Criar conta' : 'Já tem conta? Entrar'}
                                </button>
                                <div>
                                    <button
                                        type="button"
                                        onClick={() => setIsResetPassword(true)}
                                        className="text-gray-600 hover:text-gray-500 text-sm"
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
                                className="text-indigo-600 hover:text-indigo-500 text-sm"
                            >
                                Voltar ao login
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    )
}