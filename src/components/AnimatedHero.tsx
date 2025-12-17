'use client'

import { motion } from 'framer-motion'
import { ModalButton } from '../app/LandingPageClient'

export default function AnimatedHero() {
    return (
        <section
            id="inicio"
            className="relative bg-gradient-to-br from-white via-slate-50 to-[#e3f2f3] py-16 sm:py-20 lg:py-28 overflow-hidden"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative">
                    {/* Formas geométricas animadas em background sutil, alinhadas ao novo tema */}
                    {/* <motion.div
                        className="absolute top-0 right-0 w-20 h-20 md:w-28 md:h-28 bg-gradient-to-br from-amber-300 to-orange-400 transform rotate-12 rounded-xl shadow-lg"
                        animate={{ rotate: [10, 20, 10], scale: [1, 1.08, 1], y: [0, -8, 0] }}
                        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <motion.div
                        className="absolute bottom-0 right-0 w-0 h-0 border-l-[140px] md:border-l-[200px] border-l-transparent border-b-[110px] md:border-b-[150px] border-b-[#5e9ea0] opacity-80"
                        animate={{ x: [0, 8, 0], y: [0, -4, 0] }}
                        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                    />
                    <motion.div
                        className="absolute bottom-0 left-0 w-full h-10 md:h-14 bg-gradient-to-r from-[#5e9ea0] to-[#4a8b8f] opacity-90"
                        animate={{ scaleX: [1, 1.02, 1] }}
                        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                    /> */}

                    <div className="relative z-10 max-w-3xl">
                        <motion.h1
                            className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold text-slate-900 leading-tight"
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            Sua carreira no próximo nível com a{' '}
                            <span className="text-[#5e9ea0]">
                                Facilitô! Vagas
                            </span>
                        </motion.h1>

                        <motion.p
                            className="text-base sm:text-lg md:text-xl text-slate-600 mt-6 max-w-2xl leading-relaxed"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                        >
                            Conectamos talentos excepcionais a oportunidades que realmente importam.
                            Preencha seu perfil, destaque-se no ranking e tenha acesso a vagas exclusivas.
                        </motion.p>

                        {/* CTAs */}
                        <motion.div
                            className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                        >
                            <motion.div
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.96 }}
                                transition={{ type: 'spring', stiffness: 260 }}
                                className="w-full sm:w-auto"
                            >
                                <ModalButton
                                    mode="signup"
                                    className="w-full bg-[#5e9ea0] text-white px-6 sm:px-8 py-3 rounded-full text-sm sm:text-base font-semibold hover:bg-[#4a8b8f] transition-colors shadow-md hover:shadow-lg"
                                >
                                    Criar meu perfil grátis
                                </ModalButton>
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.96 }}
                                transition={{ type: 'spring', stiffness: 260 }}
                                className="w-full sm:w-auto"
                            >
                                <ModalButton className="w-full px-6 sm:px-8 py-3 rounded-full text-sm sm:text-base font-medium border border-[#5e9ea0] text-[#5e9ea0] bg-white hover:bg-[#5e9ea0]/5 transition-colors">
                                    Ver vagas disponíveis
                                </ModalButton>
                            </motion.div>
                        </motion.div>

                        {/* Estatísticas */}
                        <motion.div
                            className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.8 }}
                        >
                            {/* <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl px-4 py-3 sm:px-5 sm:py-4 shadow-sm"> */}
                            {/* <span className="block text-xl sm:text-2xl font-bold text-slate-900">
                                    +5.000
                                </span>
                                <span className="block text-xs sm:text-sm text-slate-600">
                                    Candidatos destacados
                                </span>
                            </div>
                            <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl px-4 py-3 sm:px-5 sm:py-4 shadow-sm">
                                <span className="block text-xl sm:text-2xl font-bold text-slate-900">
                                    +800
                                </span>
                                <span className="block text-xs sm:text-sm text-slate-600">
                                    Vagas preenchidas
                                </span>
                            </div>
                            <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl px-4 py-3 sm:px-5 sm:py-4 shadow-sm">
                                <span className="block text-xl sm:text-2xl font-bold text-slate-900">
                                    +50
                                </span>
                                <span className="block text-xs sm:text-sm text-slate-600">
                                    Empresas parceiras
                                </span> */}
                            {/* </div> */}
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    )
}
