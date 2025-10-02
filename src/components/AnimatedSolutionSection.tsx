'use client'

import { motion } from 'framer-motion'

export default function AnimatedSolutionSection() {
    return (
        <section className="py-20 lg:py-32 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-8 leading-tight">
                        Conheça o NEXO:<br />
                        <span className="text-indigo-600 l">O ouvido digital do seu negócio.</span>
                    </h3>
                    <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Uma ferramenta simples para que todos possam usar.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
                    {[
                        {
                            number: "1",
                            title: "Cole os QR Codes",
                            description: "Espalhe nossos adesivos com QR Code pelo seu estabelecimento: no caixa, na porta, no balcão.",
                            color: "from-blue-500 to-indigo-600",
                            delay: 0.2
                        },
                        {
                            number: "2",
                            title: "Clientes Escaneiam e Desabafam",
                            description: "Em 30 segundos, de forma 100% anônima, eles dizem o que gostaram, o que não gostaram e o que sentiram falta.",
                            color: "from-green-500 to-emerald-600",
                            delay: 0.4
                        },
                        {
                            number: "3",
                            title: "Insights Poderosos no Seu Painel",
                            description: "Nossa IA organiza todas as respostas e te entrega um relatório claro e direto: 'Seus clientes AMAM o pão de queijo, mas ODEIAM a demora no caixa.'",
                            color: "from-purple-500 to-pink-600",
                            delay: 0.6
                        }
                    ].map((step, index) => (
                        <motion.div
                            key={index}
                            className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: step.delay }}
                            viewport={{ once: true }}
                            whileHover={{ scale: 1.05, y: -10 }}
                        >
                            <motion.div
                                className={`w-16 h-16 bg-gradient-to-r ${step.color} rounded-2xl mb-6 flex items-center justify-center shadow-lg`}
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 0.6 }}
                            >
                                <span className="text-white text-2xl font-bold">{step.number}</span>
                            </motion.div>
                            <h4 className="text-xl font-bold text-gray-900 mb-4 leading-tight">{step.title}</h4>
                            <p className="text-gray-600 leading-relaxed">
                                {step.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
