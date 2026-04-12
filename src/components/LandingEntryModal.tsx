'use client'

import Image from 'next/image'

const RH_ENTRAR_URL = 'https://rh.facilitovagas.com/entrar'

interface LandingEntryModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function LandingEntryModal({ isOpen, onClose }: LandingEntryModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 sm:p-6">
            <div className="bg-white/95 backdrop-blur-md rounded-3xl w-full max-w-md sm:max-w-lg shadow-xl border border-slate-200">
                <div className="p-5 sm:p-7">
                    <div className="flex justify-center mb-4">
                        <Image
                            src="/logo_horizontal.png"
                            alt="Facilitô! Vagas"
                            width={150}
                            height={40}
                            className="h-8 w-auto"
                        />
                    </div>

                    <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 text-center mb-6">
                        Como você quer continuar?
                    </h2>

                    <div className="flex flex-col gap-3">
                        <a
                            href={RH_ENTRAR_URL}
                            className="w-full py-3 px-4 text-center bg-gradient-to-r from-[#5e9ea0] to-[#4a8b8f] text-white rounded-full hover:from-[#4a8b8f] hover:to-[#3b7477] focus:outline-none focus:ring-2 focus:ring-[#5e9ea0] transition-all duration-300 font-semibold shadow-lg hover:shadow-xl text-sm sm:text-base"
                        >
                            Quero acessar minha conta como contratante
                        </a>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full py-3 px-4 border border-slate-200 text-slate-800 rounded-full hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#5e9ea0] transition-all duration-300 font-medium text-sm sm:text-base"
                        >
                            Quero criar conta para ver e me candidatar às vagas
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
