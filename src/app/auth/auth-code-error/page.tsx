import Link from 'next/link'

export default function AuthCodeError() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-[#e3f2f3] to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center space-y-6">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                            Erro na Autenticação
                        </h2>
                        <p className="mt-2 text-sm text-slate-600">
                            Ocorreu um erro durante o processo de autenticação.
                            Isso pode ter acontecido porque o link expirou ou já foi usado.
                        </p>
                    </div>

                    <Link
                        href="/login"
                        className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium rounded-full text-white bg-[#5e9ea0] hover:bg-[#4d8a8c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5e9ea0] transition-colors"
                    >
                        Tentar Novamente
                    </Link>
                </div>
            </div>
        </div>
    )
}
