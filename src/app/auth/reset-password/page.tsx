import { Suspense } from 'react'
import ResetPasswordForm from './ResetPasswordForm'

// Este é o componente servidor que envolve o cliente em Suspense
export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="mt-4 text-sm text-gray-600">Carregando...</p>
                    </div>
                </div>
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    )
}


// 'use client'

// import { useState, useEffect } from 'react'
// import { useRouter, useSearchParams } from 'next/navigation'
// import { updatePassword } from '@/app/login/actions'
// import { createClient } from '@/utils/supabase/client'

// export default function ResetPasswordPage() {
//     const [password, setPassword] = useState('')
//     const [confirmPassword, setConfirmPassword] = useState('')
//     const [isLoading, setIsLoading] = useState(false)
//     const [message, setMessage] = useState('')
//     const [isValidSession, setIsValidSession] = useState(false)
//     const [isCheckingSession, setIsCheckingSession] = useState(true)

//     const router = useRouter()
//     const searchParams = useSearchParams()

//     useEffect(() => {
//         const checkSession = async () => {
//             const supabase = createClient()

//             // Verificar se há tokens na URL
//             const accessToken = searchParams.get('access_token')
//             const refreshToken = searchParams.get('refresh_token')
//             const type = searchParams.get('type')

//             if (type === 'recovery' && accessToken && refreshToken) {
//                 // Definir a sessão com os tokens da URL
//                 const { error } = await supabase.auth.setSession({
//                     access_token: accessToken,
//                     refresh_token: refreshToken
//                 })

//                 if (error) {
//                     setMessage('Link inválido ou expirado. Solicite um novo link de recuperação.')
//                 } else {
//                     setIsValidSession(true)
//                 }
//             } else {
//                 // Verificar se já existe uma sessão válida
//                 const { data: { session } } = await supabase.auth.getSession()

//                 if (session) {
//                     setIsValidSession(true)
//                 } else {
//                     setMessage('Link inválido ou expirado. Solicite um novo link de recuperação.')
//                 }
//             }

//             setIsCheckingSession(false)
//         }

//         checkSession()
//     }, [searchParams])

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault()

//         if (password !== confirmPassword) {
//             setMessage('As senhas não coincidem!')
//             return
//         }

//         if (password.length < 6) {
//             setMessage('A senha deve ter pelo menos 6 caracteres!')
//             return
//         }

//         setIsLoading(true)
//         setMessage('')

//         try {
//             await updatePassword(password)
//             setMessage('Senha atualizada com sucesso! Redirecionando...')
//             setTimeout(() => {
//                 router.push('/')
//             }, 2000)
//         } catch (error) {
//             setMessage('Erro ao atualizar senha. Tente novamente.')
//         } finally {
//             setIsLoading(false)
//         }
//     }

//     if (isCheckingSession) {
//         return (
//             <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//                 <div className="max-w-md w-full space-y-8">
//                     <div className="text-center">
//                         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
//                         <p className="mt-4 text-sm text-gray-600">Verificando link...</p>
//                     </div>
//                 </div>
//             </div>
//         )
//     }

//     if (!isValidSession) {
//         return (
//             <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//                 <div className="max-w-md w-full space-y-8">
//                     <div>
//                         <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
//                             Link Inválido
//                         </h2>
//                         <p className="mt-2 text-center text-sm text-gray-600">
//                             {message}
//                         </p>
//                     </div>

//                     <div className="text-center">
//                         <button
//                             onClick={() => router.push('/login')}
//                             className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//                         >
//                             Voltar ao Login
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         )
//     }

//     return (
//         <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//             <div className="max-w-md w-full space-y-8">
//                 <div>
//                     <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
//                         Redefinir Senha
//                     </h2>
//                     <p className="mt-2 text-center text-sm text-gray-600">
//                         Digite sua nova senha
//                     </p>
//                 </div>

//                 <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
//                     <div className="space-y-4">
//                         <div>
//                             <label htmlFor="password" className="block text-sm font-medium text-gray-700">
//                                 Nova Senha
//                             </label>
//                             <input
//                                 id="password"
//                                 name="password"
//                                 type="password"
//                                 required
//                                 value={password}
//                                 onChange={(e) => setPassword(e.target.value)}
//                                 className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
//                                 placeholder="Digite sua nova senha"
//                                 minLength={6}
//                             />
//                         </div>

//                         <div>
//                             <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
//                                 Confirmar Nova Senha
//                             </label>
//                             <input
//                                 id="confirmPassword"
//                                 name="confirmPassword"
//                                 type="password"
//                                 required
//                                 value={confirmPassword}
//                                 onChange={(e) => setConfirmPassword(e.target.value)}
//                                 className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
//                                 placeholder="Confirme sua nova senha"
//                                 minLength={6}
//                             />
//                         </div>
//                     </div>

//                     {message && (
//                         <div className={`text-sm text-center p-3 rounded-md ${message.includes('Erro') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
//                             }`}>
//                             {message}
//                         </div>
//                     )}

//                     <div>
//                         <button
//                             type="submit"
//                             disabled={isLoading}
//                             className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
//                         >
//                             {isLoading ? 'Atualizando...' : 'Atualizar Senha'}
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     )
// }
