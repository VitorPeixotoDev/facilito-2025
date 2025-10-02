'use client'

import { motion } from 'framer-motion'

export default function AnimatedBenefitsSection() {
    return (
        <section className="py-20 lg:py-32 bg-gradient-to-br from-white via-gray-50 to-indigo-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-8 leading-tight">
                        Pare de adivinhar.<br />
                        <span className="text-indigo-600">Comece a decidir.</span>
                    </h3>
                    <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Com o painel da NEXO, você toma as rédeas do seu sucesso:
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                    {[
                        {
                            title: "Descubra oportunidades ocultas",
                            description: "Aquele produto que ninguém compra? Talvez esteja no lugar errado. Aquele serviço que você nem anuncia? Pode ser o seu carro-chefe.",
                            delay: 0.2
                        },
                        {
                            title: "Corrija problemas antes que virém crises",
                            description: "Saiba instantaneamente se um funcionário está sendo grosseiro, se um produto está com qualidade inferior ou se o banheiro está sujo.",
                            delay: 0.4
                        },
                        {
                            title: "Fidelize clientes sem precisar pedir",
                            description: "Mostre que você ouve e se importa. Quando o cliente vê você melhorando algo que ele reclamou, ele se torna um fã para a vida toda.",
                            delay: 0.6
                        },
                        {
                            title: "Tome decisões com dados, não com 'achismos'",
                            description: "Invista no que realmente importa, baseado no desejo genuíno do seu público.",
                            delay: 0.8
                        }
                    ].map((benefit, index) => (
                        <motion.div
                            key={index}
                            className="flex items-start space-x-6 p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                            initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: benefit.delay }}
                            viewport={{ once: true }}
                            whileHover={{ scale: 1.02, y: -5 }}
                        >
                            <motion.div
                                className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg"
                                whileHover={{ rotate: 360, scale: 1.1 }}
                                transition={{ duration: 0.6 }}
                            >
                                <motion.span
                                    className="text-white text-lg font-bold"
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                                >
                                    ✓
                                </motion.span>
                            </motion.div>
                            <div>
                                <h4 className="text-lg font-bold text-gray-900 mb-3 leading-tight">{benefit.title}</h4>
                                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
