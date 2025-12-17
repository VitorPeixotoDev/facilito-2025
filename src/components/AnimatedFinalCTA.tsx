'use client'

import { motion } from 'framer-motion'
import { ModalButton } from '../app/LandingPageClient'

const steps = [
    { number: '1', text: 'Crie seu perfil detalhado' },
    { number: '2', text: 'Complete formações e ganhe badges' },
    { number: '3', text: 'Suba no ranking e seja notado' },
    { number: '4', text: 'Conquiste oportunidades compatíveis' },
]

export default function AnimatedFinalCTA() {
    return (
        <section
            id="ranking"
            className="relative py-20 lg:py-32 bg-gradient-to-br from-[#5e9ea0] via-[#4a8b8f] to-slate-900 overflow-hidden"
        >
            {/* Background decorativo suave */}
            <div className="absolute inset-0">
                <div className="absolute -top-24 -right-10 w-64 h-64 bg-white/15 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-black/30 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/3 w-56 h-56 bg-white/10 rounded-full blur-2xl" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true, amount: 0.3 }}
                >
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                        Comece sua jornada para o topo do ranking!
                    </h2>
                    <motion.p
                        className="text-base sm:text-lg text-slate-100/90 mb-10 max-w-3xl mx-auto leading-relaxed"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        viewport={{ once: true }}
                    >
                        Junte-se a milhares de profissionais que já transformaram suas carreiras com a Facilitô! Vagas.
                    </motion.p>

                    {/* Passos */}
                    <motion.div
                        className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-10"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        viewport={{ once: true, amount: 0.3 }}
                    >
                        {steps.map((step, index) => (
                            <div key={step.number} className="flex items-center gap-3 sm:gap-4">
                                <motion.div
                                    className="flex flex-col items-center justify-center px-4 py-3 sm:px-5 sm:py-4 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm shadow-lg"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.35 + index * 0.15 }}
                                    viewport={{ once: true }}
                                    whileHover={{ y: -4, scale: 1.03 }}
                                >
                                    <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white text-[#5e9ea0] font-semibold text-sm sm:text-base mb-2">
                                        {step.number}
                                    </div>
                                    <p className="text-xs sm:text-sm text-slate-100 font-medium max-w-[10rem]">
                                        {step.text}
                                    </p>
                                </motion.div>

                                {index < steps.length - 1 && (
                                    <motion.span
                                        className="hidden sm:inline-block text-2xl sm:text-3xl text-slate-100/80"
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, delay: 0.4 + index * 0.15 }}
                                        viewport={{ once: true }}
                                    >
                                        →
                                    </motion.span>
                                )}
                            </div>
                        ))}
                    </motion.div>

                    {/* Ações */}
                    <motion.div
                        className="mt-4"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        viewport={{ once: true, amount: 0.3 }}
                    >
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.96 }}
                            transition={{ type: 'spring', stiffness: 260 }}
                        >
                            <ModalButton
                                mode="signup"
                                className="w-full sm:w-auto bg-white text-[#5e9ea0] px-8 py-3 rounded-full text-sm sm:text-base font-semibold shadow-xl hover:bg-slate-100 hover:shadow-2xl transition-all duration-300"
                            >
                                Quero me destacar no mercado
                            </ModalButton>
                        </motion.div>
                        <p className="mt-3 text-xs sm:text-sm text-slate-100/80">
                            Grátis para sempre • Leva apenas 5 minutos
                        </p>
                    </motion.div>

                    {/* Depoimento */}
                    <motion.div
                        className="mt-10 max-w-3xl mx-auto text-left sm:text-center bg-black/20 border border-white/10 rounded-2xl px-5 sm:px-8 py-6 sm:py-8 backdrop-blur-sm"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                        viewport={{ once: true, amount: 0.3 }}
                    >
                        <p className="text-sm sm:text-base text-slate-100/90 italic mb-3">
                            &quot;Com a Facilitô! Vagas, consegui uma posição 40% melhor no ranking após completar duas
                            formações. Em menos de um mês, recebi três propostas de empresas do setor que sempre sonhei
                            em trabalhar!&quot;
                        </p>
                        <p className="text-xs sm:text-sm font-medium text-slate-100">
                            — Marina Silva, Desenvolvedora Front-End
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}
