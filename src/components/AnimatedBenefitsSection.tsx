'use client'

import { motion } from 'framer-motion'

const benefits = [
    {
        icon: '🏆',
        title: 'Destaque no Ranking',
        description:
            'Sua posição melhora com cada habilidade desenvolvida e formação concluída através de nossos parceiros.',
    },
    {
        icon: '🎖️',
        title: 'Badges de Conquista',
        description:
            'Exiba com orgulho cada certificação e conquista em seu perfil, aumentando sua credibilidade.',
    },
    {
        icon: '🎯',
        title: 'Indicações Personalizadas',
        description:
            'Receba sugestões de cursos e formações para continuar crescendo na sua área de atuação.',
    },
    {
        icon: '🚀',
        title: 'Candidaturas Diretas',
        description:
            'Aplique para vagas de emprego anunciadas diretamente na plataforma, com processo simplificado.',
    },
    {
        icon: '📈',
        title: 'Acompanhamento de Progresso',
        description:
            'Monitore seu desenvolvimento profissional e compare-se com outros talentos do mercado.',
    },
    {
        icon: '🤝',
        title: 'Conexões Relevantes',
        description:
            'Conecte-se com empresas que valorizam suas habilidades específicas e histórico de aprendizado.',
    },
]

export default function AnimatedBenefitsSection() {
    return (
        <section
            id="beneficios"
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
                        Vantagens exclusivas da nossa plataforma
                    </h2>
                    <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        Cada benefício foi pensado para aumentar sua visibilidade, fortalecer seu perfil e aproximar
                        você das melhores oportunidades do mercado.
                    </p>
                </motion.div>

                <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
                    {benefits.map((benefit, index) => (
                        <motion.div
                            key={benefit.title}
                            className="group relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm p-6 sm:p-8 shadow-sm hover:shadow-xl border border-slate-100"
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.12 }}
                            viewport={{ once: true, amount: 0.2 }}
                            whileHover={{ y: -6 }}
                        >
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-br from-[#5e9ea0]/0 via-[#e3f2f3]/0 to-[#5e9ea0]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            />
                            <div className="relative flex flex-col gap-4">
                                <motion.div
                                    className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#5e9ea0] to-[#4a8b8f] text-2xl shadow-md"
                                    animate={{ scale: [1, 1.08, 1] }}
                                    transition={{ duration: 2.2, repeat: Infinity, delay: index * 0.4 }}
                                >
                                    <span>{benefit.icon}</span>
                                </motion.div>
                                <h3 className="text-lg sm:text-xl font-semibold text-slate-900">
                                    {benefit.title}
                                </h3>
                                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                                    {benefit.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
