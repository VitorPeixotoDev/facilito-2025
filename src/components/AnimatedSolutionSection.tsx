'use client'

import { motion } from 'framer-motion'

const solutionSteps = [
    {
        number: '01',
        title: 'Perfil inteligente',
        description:
            'Crie um perfil detalhado que vai muito além do currículo tradicional. Mostre suas habilidades, experiências e conquistas de forma estratégica.',
    },
    {
        number: '02',
        title: 'Banco de talentos otimizado',
        description:
            'Seja encontrado por empresas que buscam exatamente o seu perfil. Nosso algoritmo conecta talentos a oportunidades compatíveis.',
    },
    {
        number: '03',
        title: 'Marketplace de formações',
        description:
            'Acesse avaliações e graduações de empresas parceiras. Cada conquista aumenta sua visibilidade e posição no ranking.',
    },
    {
        number: '04',
        title: 'Sistema de ranking transparente',
        description:
            'Veja como você se compara a profissionais similares. Melhore sua posição desenvolvendo habilidades estratégicas.',
    },
]

export default function AnimatedSolutionSection() {
    return (
        <section
            id="solucao"
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
                        Como a Facilitô! Vagas transforma sua carreira
                    </h2>
                    <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        Cada etapa da plataforma foi pensada para aumentar suas chances reais de contratação,
                        conectando você às melhores oportunidades e mostrando todo o seu potencial.
                    </p>
                </motion.div>

                <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
                    {solutionSteps.map((step, index) => (
                        <motion.div
                            key={step.number}
                            className="group relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm p-6 sm:p-8 shadow-sm hover:shadow-xl border border-slate-100"
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.15 }}
                            viewport={{ once: true, amount: 0.2 }}
                            whileHover={{ y: -6 }}
                        >
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-br from-[#5e9ea0]/0 via-[#e3f2f3]/0 to-[#5e9ea0]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            />
                            <div className="relative flex flex-col gap-4">
                                <motion.div
                                    className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-[#5e9ea0] to-[#4a8b8f] text-white font-semibold text-lg sm:text-xl shadow-md"
                                    animate={{ scale: [1, 1.06, 1] }}
                                    transition={{ duration: 2.2, repeat: Infinity, delay: index * 0.4 }}
                                >
                                    {step.number}
                                </motion.div>
                                <h3 className="text-lg sm:text-xl font-semibold text-slate-900">
                                    {step.title}
                                </h3>
                                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                                    {step.description}
                                </p>
                            </div>

                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
