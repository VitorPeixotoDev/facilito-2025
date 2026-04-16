"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, X } from "lucide-react";
import { usePWA } from "@/hooks/usePWA";

const DISMISS_AT_KEY = "facilito.pwa_install_dismissed_at";
const DISMISS_MS = 7 * 24 * 60 * 60 * 1000;

function isDismissStillActive(): boolean {
    if (typeof window === "undefined") return false;
    try {
        const raw = localStorage.getItem(DISMISS_AT_KEY);
        if (!raw) return false;
        const at = Number.parseInt(raw, 10);
        if (Number.isNaN(at)) return false;
        return Date.now() - at < DISMISS_MS;
    } catch {
        return false;
    }
}

export function InstallPWA() {
    const { isInstallable, isInstalled, isStandalone, install } = usePWA();
    const [isVisible, setIsVisible] = useState(false);
    const [hasDismissed, setHasDismissed] = useState(false);

    useEffect(() => {
        if (isInstallable && !isInstalled && !isStandalone && !hasDismissed && !isDismissStillActive()) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [isInstallable, isInstalled, isStandalone, hasDismissed]);

    const handleInstall = async () => {
        await install();
        setIsVisible(false);
    };

    const handleDismiss = () => {
        setIsVisible(false);
        setHasDismissed(true);
        try {
            localStorage.setItem(DISMISS_AT_KEY, String(Date.now()));
        } catch {
            /* ignore */
        }
    };

    if (!isVisible || isInstalled || isStandalone) {
        return null;
    }

    return (
        <motion.div
            className="fixed bottom-24 left-0 right-0 z-[55] px-4 sm:px-6 max-w-md mx-auto lg:bottom-8"
            role="region"
            aria-label="Instalar aplicativo Facilitô"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
        >
            <div className="bg-white rounded-2xl shadow-lg border border-[#5e9ea0]/35 p-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900">
                        Instale o Facilitô! Vagas
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                        Acesso rápido direto da sua tela inicial
                    </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={handleInstall}
                        className="p-2.5 rounded-xl transition-all touch-manipulation active:opacity-80 flex items-center justify-center bg-[#5e9ea0] text-white hover:bg-[#4d8a8c] focus:outline-none focus:ring-2 focus:ring-[#5e9ea0] focus:ring-offset-2"
                        aria-label="Instalar aplicativo"
                    >
                        <Download size={20} aria-hidden />
                    </button>
                    <button
                        type="button"
                        onClick={handleDismiss}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors touch-manipulation active:opacity-80 focus:outline-none focus:ring-2 focus:ring-slate-300"
                        aria-label="Fechar"
                    >
                        <X size={18} aria-hidden />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
