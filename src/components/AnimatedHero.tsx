'use client'

import { motion } from 'framer-motion'
import { ModalButton } from '../app/LandingPageClient'

export default function AnimatedHero() {
    return (
        <section id="home" className="relative bg-gradient-to-br from-white via-gray-50 to-blue-50 py-20 lg:py-32 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative">
                    {/* Animated Geometric Shapes */}
                    <motion.div
                        className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-yellow-400 to-orange-400 transform rotate-12 rounded-lg shadow-lg"
                        animate={{
                            rotate: [12, 24, 12],
                            scale: [1, 1.1, 1],
                            y: [0, -10, 0]
                        }}
                        transition={{
                            duration: 6,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                    <motion.div
                        className="absolute bottom-0 right-0 w-0 h-0 border-l-[150px] md:border-l-[200px] border-l-transparent border-b-[120px] md:border-b-[150px] border-b-red-500 shadow-lg"
                        animate={{
                            x: [0, 10, 0],
                            y: [0, -5, 0]
                        }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 1
                        }}
                    />
                    <motion.div
                        className="absolute bottom-0 left-0 w-full h-12 md:h-16 bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg"
                        animate={{
                            scaleX: [1, 1.02, 1]
                        }}
                        transition={{
                            duration: 10,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 2
                        }}
                    />

                    <div className="relative z-10 max-w-4xl">
                        <motion.h1
                            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight"
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            Seu Cliente Sai da Sua Loja<br />
                            e Critica Você Pelo Celular.
                        </motion.h1>
                        <motion.h2
                            className="text-2xl sm:text-3xl md:text-4xl font-bold text-indigo-600 mt-4"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                        >
                            Agora Você Pai Ouvir.
                        </motion.h2>
                        <motion.p
                            className="text-lg sm:text-xl text-gray-600 mt-8 max-w-2xl leading-relaxed"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                        >
                            O NEXO é o jeito mais simples e anônimo de descobrir o que seus clientes <em className="text-indigo-600 font-semibold">realmente</em> pensam sobre seu atendimento, seus produtos e o que eles desejam secretamente que você vendesse.
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.8 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <ModalButton className="mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                                Experimente Grátis - Leva 1 Minuto
                            </ModalButton>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    )
}
