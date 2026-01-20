"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import { ProfileMenuDrawer } from "@/components/applicant/profile/ProfileMenuDrawer";
import { useAuth } from "@/components/AuthClientProvider";

export function ApplicantTopNav() {
    const { user, loading } = useAuth();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);


    // Só mostra a navbar depois de carregar o estado de auth
    // e apenas se houver usuário logado
    if (loading || !user) {
        return null;
    }

    return (
        <>
            <header className="w-full bg-white border-b border-slate-200 shadow-sm">
                <div className="px-3 h-16 lg:h-20 flex items-center justify-between">
                    {/* Logo à esquerda */}
                    <div className="flex items-center gap-3">
                        <Link href="/applicant/vacancies" className="hover:opacity-80 transition-opacity">
                            <Image
                                src="/logo_horizontal.png"
                                alt="Facilitô! Vagas"
                                width={160}
                                height={40}
                                className="h-8 lg:h-10 w-auto object-contain"
                                priority
                            />
                        </Link>
                    </div>

                    {/* Menu hambúrguer do usuário à direita */}
                    <button
                        onClick={() => setIsDrawerOpen(true)}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                        aria-label="Abrir menu do usuário"
                    >
                        <Menu className="w-6 h-6 text-slate-700" />
                    </button>
                </div>
            </header>

            <ProfileMenuDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
            />
        </>
    );
}

