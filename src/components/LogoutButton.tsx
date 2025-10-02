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
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
            Sair
        </button>
    )
}
