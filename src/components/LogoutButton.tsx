'use client'

import { signOut } from '@/app/login/actions'

export default function LogoutButton() {
    const handleLogout = async () => {
        try {
            // 1. Limpar storage do cliente ANTES do signOut
            if (typeof window !== 'undefined') {
                localStorage.clear()
                sessionStorage.clear()
            }

            // 2. Encerrar sessão no servidor (limpa cookies e tokens)
            await signOut()

            // 3. Forçar reload completo do browser para garantir limpeza total
            // Isso garante que o AuthClientProvider seja reinicializado limpo
            window.location.href = '/login'
        } catch (error) {
            console.error('Erro ao fazer logout:', error)
            // Em caso de erro, limpar storage e forçar reload mesmo assim
            if (typeof window !== 'undefined') {
                localStorage.clear()
                sessionStorage.clear()
            }
            window.location.href = '/login'
        }
    }

    return (
        <button
            onClick={handleLogout}
            className="inline-flex items-center px-2 sm:px-4 py-1.5 sm:py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
        >
            Sair
        </button>
    )
}
