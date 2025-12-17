'use client'

import Image from 'next/image'

export default function LandingFooter() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="border-t border-slate-200 bg-white/80 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
                    <div className="max-w-sm">
                        <div className="flex items-center gap-3">
                            <Image
                                src="/logo_horizontal.png"
                                alt="Facilitô! Vagas"
                                width={140}
                                height={40}
                                className="h-8 w-auto"
                            />
                        </div>
                        <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                            Plataforma que conecta talentos a oportunidades compatíveis, impulsionando sua carreira com
                            rankings, badges e um ecossistema de formações parceiras.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
                        <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
                                Navegação
                            </h4>
                            <ul className="space-y-2">
                                <li>
                                    <a
                                        href="#inicio"
                                        className="text-slate-600 hover:text-[#5e9ea0] transition-colors"
                                    >
                                        Início
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#dores"
                                        className="text-slate-600 hover:text-[#5e9ea0] transition-colors"
                                    >
                                        Dores
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#solucao"
                                        className="text-slate-600 hover:text-[#5e9ea0] transition-colors"
                                    >
                                        Solução
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#beneficios"
                                        className="text-slate-600 hover:text-[#5e9ea0] transition-colors"
                                    >
                                        Benefícios
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
                                Para você
                            </h4>
                            <ul className="space-y-2">
                                <li>
                                    <a
                                        href="#diferenciais"
                                        className="text-slate-600 hover:text-[#5e9ea0] transition-colors"
                                    >
                                        Diferenciais
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#ranking"
                                        className="text-slate-600 hover:text-[#5e9ea0] transition-colors"
                                    >
                                        Ranking
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
                                Contato
                            </h4>
                            <ul className="space-y-2">
                                <li>
                                    <a
                                        href="mailto:contato@facilitovagas.com"
                                        className="text-slate-600 hover:text-[#5e9ea0] transition-colors"
                                    >
                                        contato@facilitovagas.com
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-slate-500">
                        &copy; {currentYear} Facilitô! Vagas. Todos os direitos reservados.
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                        <a href="#" className="hover:text-[#5e9ea0] transition-colors">
                            Termos de uso
                        </a>
                        <span className="h-3 w-px bg-slate-300" />
                        <a href="#" className="hover:text-[#5e9ea0] transition-colors">
                            Política de privacidade
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}

