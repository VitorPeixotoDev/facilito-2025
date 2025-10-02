'use client'

import { motion } from 'framer-motion'

export default function AnimatedPainSection() {
    return (
        <section className="py-20 lg:py-32 bg-gradient-to-br from-gray-50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-8 leading-tight">
                        A Sensação de Operar No Escuro<br />
                        <span className="text-indigo-600">Acaba Hoje.</span>
                    </h3>
                    <div className="max-w-4xl mx-auto">
                        <motion.p
                            className="text-lg sm:text-xl text-gray-600 mb-12 leading-relaxed"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            viewport={{ once: true }}
                        >
                            Você já se perguntou...
                        </motion.p>
                        <div className="grid md:grid-cols-1 gap-6 max-w-3xl mx-auto">
                            {[
                                "Por que aquele cliente não voltou mais?",
                                "O que eu poderia fazer para vender muito mais?",
                                "Será que aquele meu funcionário está tratando bem todo mundo?"
                            ].map((question, index) => (
                                <motion.div
                                    key={index}
                                    className="flex items-start p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-red-400"
                                    initial={{ opacity: 0, x: -50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6, delay: index * 0.2 }}
                                    viewport={{ once: true }}
                                    whileHover={{ scale: 1.02, x: 10 }}
                                >
                                    <motion.span
                                        className="text-red-500 mr-4 text-2xl font-bold"
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                                    >
                                        ?
                                    </motion.span>
                                    <p className="text-lg text-gray-700 leading-relaxed">
                                        {question}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                        <motion.p
                            className="text-lg sm:text-xl text-gray-600 mt-12 leading-relaxed"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                            viewport={{ once: true }}
                        >
                            Enquanto você se pergunta, seus clientes já têm todas as respostas. Eles comentam no carro, reclamam para os amigos e desabafam em casa. O NEXO traz essa conversa vital diretamente para você, de forma construtiva e anônima.
                        </motion.p>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
