'use client'

import { motion } from 'framer-motion'

const painPoints = [
    {
        icon: '📄',
        title: 'CVs que não se destacam',
        description: 'Seu currículo se perde entre centenas de outros, sem mostrar seu verdadeiro potencial.',
    },
    {
        icon: '🎯',
        title: 'Vagas não compatíveis',
        description: 'Candidaturas para vagas que não combinam com seu perfil, desperdiçando tempo e energia.',
    },
    {
        icon: '📊',
        title: 'Dificuldade em medir seu desempenho',
        description: 'Não saber como você se compara a outros profissionais da sua área.',
    },
    {
        icon: '📚',
        title: 'Falta de direcionamento para crescimento',
        description: 'Sem um caminho claro para desenvolver as habilidades mais valorizadas no mercado.',
    },
]

export default function AnimatedPainSection() {
    return (
        <section
            id="dores"
            className="py-20 lg:py-32 bg-gradient-to-br from-white via-slate-50 to-[#e3f2f3]"
        >
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true, amount: 0.3 }}
                >
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 leading-tight">
                        As dificuldades da busca por emprego hoje
                    </h2>
                    <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-12">
                        Se você sente que faz tudo certo e mesmo assim as oportunidades não aparecem,
                        provavelmente está enfrentando alguns desses obstáculos:
                    </p>
                </motion.div>

                <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
                    {painPoints.map((pain, index) => (
                        <motion.div
                            key={pain.title}
                            className="group relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm p-6 sm:p-8 shadow-sm hover:shadow-xl border border-slate-100"
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.15 }}
                            viewport={{ once: true, amount: 0.2 }}
                            whileHover={{ y: -6 }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-[#5e9ea0]/0 via-[#e3f2f3]/0 to-[#5e9ea0]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="relative flex items-start gap-4">
                                <motion.div
                                    className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#5e9ea0] to-[#4a8b8f] text-2xl sm:text-3xl shadow-md"
                                    animate={{ scale: [1, 1.08, 1] }}
                                    transition={{ duration: 2.2, repeat: Infinity, delay: index * 0.4 }}
                                >
                                    {pain.icon}
                                </motion.div>
                                <div className="text-left">
                                    <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2">
                                        {pain.title}
                                    </h3>
                                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                                        {pain.description}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
