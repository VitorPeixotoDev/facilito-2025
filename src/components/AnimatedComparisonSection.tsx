'use client'

import { motion } from 'framer-motion'

const comparisonRows = [
    {
        feature: 'Visibilidade do Perfil',
        facilito: 'Algoritmo inteligente que destaca seu perfil para empresas relevantes.',
        traditional: 'CV perdido em meio a centenas de aplicações.',
    },
    {
        feature: 'Desenvolvimento Profissional',
        facilito: 'Indicações personalizadas de cursos + marketplace de formações.',
        traditional: 'Busca manual por cursos sem direcionamento estratégico.',
    },
    {
        feature: 'Acompanhamento de Progresso',
        facilito: 'Sistema de ranking e badges que mostram sua evolução.',
        traditional: 'Sem métricas claras de como você se compara ao mercado.',
    },
    {
        feature: 'Relevância das Oportunidades',
        facilito: 'Vagas compatíveis com seu perfil e histórico de aprendizagem.',
        traditional: 'Candidaturas genéricas sem garantia de compatibilidade.',
    },
]

export default function AnimatedComparisonSection() {
    return (
        <section
            id="diferenciais"
            className="py-20 lg:py-32 bg-gradient-to-br from-white via-slate-50 to-[#e3f2f3]"
        >
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true, amount: 0.3 }}
                >
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 leading-tight">
                        Facilitô! Vagas vs Método Tradicional
                    </h2>
                    <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        Compare como a nossa plataforma potencializa sua visibilidade e crescimento profissional em
                        relação à busca tradicional por vagas.
                    </p>
                </motion.div>

                <motion.div
                    className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden border border-slate-100"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    viewport={{ once: true, amount: 0.2 }}
                    whileHover={{ scale: 1.01 }}
                >
                    <div className="grid grid-cols-1">
                        {/* Cabeçalho da tabela */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 bg-slate-50/80 border-b border-slate-100">
                            <div className="px-4 sm:px-6 py-4 text-xs sm:text-sm font-medium text-slate-500 text-left uppercase tracking-wide">
                                {/* Coluna de características */}
                            </div>
                            <div className="px-4 sm:px-6 py-4 text-sm sm:text-base font-semibold text-slate-900 text-left">
                                Facilitô! Vagas
                            </div>
                            <div className="px-4 sm:px-6 py-4 text-sm sm:text-base font-semibold text-slate-900 text-left">
                                Busca Tradicional
                            </div>
                        </div>

                        {/* Linhas de comparação */}
                        <div className="divide-y divide-slate-100">
                            {comparisonRows.map((row, index) => (
                                <motion.div
                                    key={row.feature}
                                    className="grid grid-cols-1 sm:grid-cols-3 bg-white/90"
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.15 * index }}
                                    viewport={{ once: true, amount: 0.2 }}
                                >
                                    <div className="px-4 sm:px-6 py-4 bg-slate-50/60 sm:bg-transparent">
                                        <p className="text-sm sm:text-base font-semibold text-slate-900">
                                            {row.feature}
                                        </p>
                                    </div>
                                    <div className="px-4 sm:px-6 py-4 border-t sm:border-t-0 sm:border-l border-slate-100 bg-gradient-to-br from-[#e3f2f3] to-white">
                                        <p className="text-sm sm:text-base text-slate-800">
                                            {row.facilito}
                                        </p>
                                    </div>
                                    <div className="px-4 sm:px-6 py-4 border-t sm:border-t-0 sm:border-l border-slate-100">
                                        <p className="text-sm sm:text-base text-slate-600">
                                            {row.traditional}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
