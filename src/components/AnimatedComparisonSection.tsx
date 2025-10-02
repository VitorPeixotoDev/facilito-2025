'use client'

import { motion } from 'framer-motion'

export default function AnimatedComparisonSection() {
    return (
        <section className="py-20 lg:py-32 bg-gradient-to-br from-gray-100 via-blue-50 to-indigo-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-8 leading-tight">
                        Não é Apenas um QR Code.<br />
                        <span className="text-indigo-600">É uma Revolução.</span>
                    </h3>
                </motion.div>

                <motion.div
                    className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.02 }}
                >
                    <div className="grid md:grid-cols-2 gap-0">
                        <motion.div
                            className="p-8 lg:p-12 bg-gradient-to-br from-gray-50 to-gray-100"
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            viewport={{ once: true }}
                        >
                            <h4 className="text-2xl font-bold text-gray-900 mb-8">Outras Soluções</h4>
                            <ul className="space-y-6">
                                {[
                                    "Pesquisas complexas e longas",
                                    "O cliente precisa se identificar",
                                    "Você recebe uma planilha confusa",
                                    "Feito para grandes corporações"
                                ].map((item, index) => (
                                    <motion.li
                                        key={index}
                                        className="flex items-center text-gray-600 text-lg"
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                                        viewport={{ once: true }}
                                    >
                                        <span className="text-red-500 mr-3 text-xl">✗</span>
                                        {item}
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>
                        <motion.div
                            className="p-8 lg:p-12 bg-gradient-to-br from-indigo-50 to-purple-50"
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            viewport={{ once: true }}
                        >
                            <h4 className="text-2xl font-bold text-indigo-900 mb-8">A NEXO</h4>
                            <ul className="space-y-6">
                                {[
                                    "3 perguntas curtas, direto ao ponto",
                                    "100% Anônimo = Respostas 100% Sinceras",
                                    "IA que traduz reclamações em Insights Acionáveis",
                                    "Feito para o HERÓI do negócio local"
                                ].map((item, index) => (
                                    <motion.li
                                        key={index}
                                        className="flex items-center text-indigo-800 text-lg font-medium"
                                        initial={{ opacity: 0, x: 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                                        viewport={{ once: true }}
                                    >
                                        <motion.span
                                            className="text-green-500 mr-3 text-xl"
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                                        >
                                            ✓
                                        </motion.span>
                                        {item}
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
