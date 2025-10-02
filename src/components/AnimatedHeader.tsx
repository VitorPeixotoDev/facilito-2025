'use client'

import { motion } from 'framer-motion'
import Image from "next/image"
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
                    <motion.div
                        className="flex items-center"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <Image
                            src="/images/logo_without_bg_g.png"
                            alt="NEXO Logo"
                            width={120}
                            height={40}
                            className="h-8 w-auto"
                        />
                    </motion.div>
                    <nav className="hidden md:flex space-x-8">
                        <motion.a
                            href="#home"
                            className="text-indigo-600 font-medium relative group"
                            whileHover={{ y: -2 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            Home
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 transition-all duration-300 group-hover:w-full"></span>
                        </motion.a>
                        <motion.a
                            href="#work"
                            className="text-gray-600 hover:text-gray-900 transition-colors relative group"
                            whileHover={{ y: -2 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            Work
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-300 group-hover:w-full"></span>
                        </motion.a>
                        <motion.a
                            href="#shop"
                            className="text-gray-600 hover:text-gray-900 transition-colors relative group"
                            whileHover={{ y: -2 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            Shop
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-300 group-hover:w-full"></span>
                        </motion.a>
                        <motion.a
                            href="#contact"
                            className="text-gray-600 hover:text-gray-900 transition-colors relative group"
                            whileHover={{ y: -2 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            Contact
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-300 group-hover:w-full"></span>
                        </motion.a>
                    </nav>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <ModalButton className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-full hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                            Entrar
                        </ModalButton>
                    </motion.div>
                </div>
            </div>
        </motion.header>
    )
}
