'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { ModalButton } from '../app/LandingPageClient'

export default function AnimatedHeader() {
    return (
        <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <motion.div
                        className="flex items-center"
                        whileHover={{ scale: 1.03 }}
                        transition={{ type: 'spring', stiffness: 260 }}
                    >
                        <Image
                            src="/logo_horizontal.png"
                            alt="Facilitô! Vagas"
                            width={140}
                            height={40}
                            className="h-10 w-auto"
                        />
                    </motion.div>

                    {/* Navegação */}
                    <nav className="hidden md:flex items-center space-x-8">
                        <motion.a
                            href="#solucao"
                            className="text-sm font-medium text-[#5e9ea0] relative group"
                            whileHover={{ y: -2 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                        >
                            Solução
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#5e9ea0] transition-all duration-300 group-hover:w-full" />
                        </motion.a>
                        <motion.a
                            href="#beneficios"
                            className="text-sm font-medium text-slate-600 hover:text-[#5e9ea0] transition-colors relative group"
                            whileHover={{ y: -2 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                        >
                            Benefícios
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#5e9ea0] transition-all duration-300 group-hover:w-full" />
                        </motion.a>
                        <motion.a
                            href="#diferenciais"
                            className="text-sm font-medium text-slate-600 hover:text-[#5e9ea0] transition-colors relative group"
                            whileHover={{ y: -2 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                        >
                            Diferenciais
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#5e9ea0] transition-all duration-300 group-hover:w-full" />
                        </motion.a>
                        <motion.a
                            href="#ranking"
                            className="text-sm font-medium text-slate-600 hover:text-[#5e9ea0] transition-colors relative group"
                            whileHover={{ y: -2 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                        >
                            Ranking
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#5e9ea0] transition-all duration-300 group-hover:w-full" />
                        </motion.a>
                    </nav>

                    {/* Ações do header */}
                    {/* Mobile (< md): apenas logo + botão Entrar */}
                    <div className="flex md:hidden items-center">
                        <motion.div
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.96 }}
                            transition={{ type: 'spring', stiffness: 260 }}
                        >
                            <ModalButton className="bg-[#5e9ea0] text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-[#4a8b8f] transition-colors shadow-md hover:shadow-lg">
                                Entrar
                            </ModalButton>
                        </motion.div>
                    </div>

                    {/* Desktop / tablet (>= md): Entrar + Cadastrar-se */}
                    <div className="hidden md:flex items-center gap-3">
                        {/* Entrar (botão secundário / outline) */}
                        <motion.div
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.96 }}
                            transition={{ type: 'spring', stiffness: 260 }}
                        >
                            <ModalButton className="px-4 py-2 rounded-full border border-[#5e9ea0] text-[#5e9ea0] text-sm font-medium bg-white hover:bg-[#5e9ea0]/5 transition-colors">
                                Entrar
                            </ModalButton>
                        </motion.div>

                        {/* Cadastrar-se (botão primário) */}
                        <motion.div
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.96 }}
                            transition={{ type: 'spring', stiffness: 260 }}
                        >
                            <ModalButton
                                mode="signup"
                                className="bg-[#5e9ea0] text-white px-4 sm:px-6 py-2 rounded-full text-sm font-semibold hover:bg-[#4a8b8f] transition-colors shadow-md hover:shadow-lg"
                            >
                                Cadastrar-se
                            </ModalButton>
                        </motion.div>
                    </div>
                </div>
            </div>
        </motion.header>
    )
}

