"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";

const COOKIE_CONSENT_KEY = "facilito.cookie_consent.v1";

export function CookieConsentBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        try {
            setIsVisible(localStorage.getItem(COOKIE_CONSENT_KEY) !== "accepted");
        } catch {
            setIsVisible(true);
        }
    }, []);

    function handleAccept() {
        try {
            localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
        } finally {
            setIsVisible(false);
        }
    }

    if (!isVisible) return null;

    return (
        <section
            aria-label="Aviso de cookies"
            className="fixed inset-x-0 bottom-0 z-[100] px-4 pb-4 sm:px-6 sm:pb-6"
        >
            <div className="mx-auto flex max-w-5xl flex-col gap-4 rounded-2xl border border-slate-200 bg-white/95 p-4 text-slate-700 shadow-2xl backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <div className="flex gap-3">
                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#5e9ea0]/10 text-[#5e9ea0]">
                        <Cookie className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-slate-900">
                            Usamos cookies para melhorar sua experiência
                        </h2>
                        <p className="mt-1 text-sm leading-relaxed text-slate-600">
                            Utilizamos cookies essenciais para autenticação e funcionamento da plataforma. Ao continuar,
                            você concorda com nossos{" "}
                            <Link href="/termos" className="font-medium text-[#5e9ea0] hover:text-[#4a8b8f]">
                                Termos de uso
                            </Link>{" "}
                            e nossa{" "}
                            <Link href="/privacidade" className="font-medium text-[#5e9ea0] hover:text-[#4a8b8f]">
                                Política de privacidade
                            </Link>
                            .
                        </p>
                    </div>
                </div>

                <Button
                    type="button"
                    onClick={handleAccept}
                    className="shrink-0 rounded-full px-5"
                >
                    Aceitar cookies
                </Button>
            </div>
        </section>
    );
}
