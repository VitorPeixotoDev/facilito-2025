'use client'

import { signOut } from '@/app/login/actions'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
    const router = useRouter()

    const handleLogout = async () => {
        try {
            await signOut()
            router.push('/')
        } catch (error) {
            console.error('Erro ao fazer logout:', error)
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
