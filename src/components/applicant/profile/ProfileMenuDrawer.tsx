"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, LogOut, ReceiptText } from "lucide-react";
import { signOut } from "@/app/login/actions";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface ProfileMenuDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ProfileMenuDrawer({ isOpen, onClose }: ProfileMenuDrawerProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [showConfirm, setShowConfirm] = useState(false);

    const handleLogout = async () => {
        try {
            await signOut();
            router.push("/");
        } catch (error) {
            console.error("Erro ao fazer logout:", error);
        }
    };

    const handleLogoutClick = () => {
        setShowConfirm(true);
    };

    const handleConfirmLogout = async () => {
        await handleLogout();
        onClose();
    };

    const handleCancelLogout = () => {
        setShowConfirm(false);
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/50 z-[60] lg:z-[60]"
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                className="fixed bottom-0 left-0 right-0 lg:right-0 lg:left-auto lg:top-0 lg:bottom-0 lg:w-80 bg-white z-[61] lg:z-[61] shadow-2xl flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">Menu</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                        aria-label="Fechar menu"
                    >
                        <X className="w-5 h-5 text-slate-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                    <nav aria-label="Menu do usuário" className="space-y-2">
                        <Link
                            href="/applicant/purchases"
                            onClick={onClose}
                            className={cn(
                                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors",
                                pathname === "/applicant/purchases"
                                    ? "bg-[#5e9ea0]/10 text-[#2f6668]"
                                    : "text-slate-700 hover:bg-slate-100 hover:text-[#2f6668]"
                            )}
                        >
                            <ReceiptText className="h-5 w-5" aria-hidden="true" />
                            Compras realizadas
                        </Link>
                    </nav>
                </div>

                {/* Footer com botão Sair */}
                <div className="border-t border-slate-200 p-4 sm:p-6">
                    {!showConfirm ? (
                        <button
                            onClick={handleLogoutClick}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm sm:text-base font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors"
                        >
                            <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                            Sair
                        </button>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-sm sm:text-base text-slate-700 text-center">
                                Deseja realmente sair da aplicação?
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleCancelLogout}
                                    className="flex-1 px-4 py-2.5 text-sm sm:text-base font-medium rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleConfirmLogout}
                                    className="flex-1 px-4 py-2.5 text-sm sm:text-base font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors"
                                >
                                    Sair
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

