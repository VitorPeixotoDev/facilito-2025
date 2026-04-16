"use client";

import { useState, useEffect, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export interface UsePWAReturn {
    isInstallable: boolean;
    isInstalled: boolean;
    isStandalone: boolean;
    install: () => Promise<void>;
    deferredPrompt: BeforeInstallPromptEvent | null;
}

export function usePWA(): UsePWAReturn {
    const [isInstallable, setIsInstallable] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

    useEffect(() => {
        const standalone =
            window.matchMedia("(display-mode: standalone)").matches ||
            (window.navigator as Navigator & { standalone?: boolean }).standalone === true ||
            document.referrer.includes("android-app://");

        setIsStandalone(standalone);
        setIsInstalled(standalone);

        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            const promptEvent = e as BeforeInstallPromptEvent;
            setDeferredPrompt(promptEvent);
            setIsInstallable(true);
        };

        const handleAppInstalled = () => {
            setIsInstalled(true);
            setIsInstallable(false);
            setDeferredPrompt(null);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        window.addEventListener("appinstalled", handleAppInstalled);

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
            window.removeEventListener("appinstalled", handleAppInstalled);
        };
    }, []);

    const install = useCallback(async () => {
        if (!deferredPrompt) {
            return;
        }

        try {
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;

            if (outcome === "accepted") {
                setIsInstalled(true);
            }

            setDeferredPrompt(null);
            setIsInstallable(false);
        } catch (error) {
            console.error("PWA: erro ao instalar:", error);
        }
    }, [deferredPrompt]);

    return {
        isInstallable,
        isInstalled,
        isStandalone,
        install,
        deferredPrompt,
    };
}
