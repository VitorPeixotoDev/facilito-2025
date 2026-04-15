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
            <div className="bg-white/95 backdrop-blur-md rounded-3xl w-full max-w-xl sm:max-w-2xl min-h-[min(90vh,24rem)] sm:min-h-[26rem] shadow-xl border border-slate-200 flex flex-col">
                <div className="p-5 sm:p-8 flex flex-col flex-1">
                    <div className="flex justify-center mb-5 sm:mb-6 shrink-0">
                        <Image
                            src="/logo_horizontal.png"
                            alt="Facilitô! Vagas"
                            width={150}
                            height={40}
                            className="h-8 w-auto"
                        />
                    </div>

                    <div className="flex flex-col gap-4 sm:gap-5 flex-1 justify-center">
                        <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 text-center">
                            Como você quer continuar?
                        </h2>
                        <a
                            href={RH_ENTRAR_URL}
                            className="w-full py-3 px-4 text-center bg-gradient-to-r from-[#5e9ea0] to-[#4a8b8f] text-white rounded-full hover:from-[#4a8b8f] hover:to-[#3b7477] focus:outline-none focus:ring-2 focus:ring-[#5e9ea0] transition-all duration-300 font-semibold shadow-lg hover:shadow-xl text-sm sm:text-base"
                        >
                            Quero acessar minha conta como contratante
                        </a>
                        <div
                            className="flex flex-row gap-3 sm:gap-4 items-end rounded-2xl border border-[#5e9ea0]/30 bg-gradient-to-br from-[#5e9ea0]/[0.08] to-slate-50 p-3 sm:p-4 shadow-sm"
                            aria-label="Destaque: criar conta para candidatar-se"
                        >
                            <div className="shrink-0 flex justify-center w-[5.5rem] sm:w-28 -mb-1 sm:-mb-0.5">
                                <Image
                                    src="/lito_estagiario_bg.png"
                                    alt=""
                                    width={200}
                                    height={220}
                                    className="h-auto w-full max-h-[7.5rem] sm:max-h-[8.5rem] object-contain object-bottom pointer-events-none"
                                    priority
                                />
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 min-w-0 py-3 px-4 text-center sm:text-left border-2 border-[#5e9ea0]/40 bg-white text-slate-800 rounded-full hover:bg-[#5e9ea0]/5 hover:border-[#5e9ea0]/60 focus:outline-none focus:ring-2 focus:ring-[#5e9ea0] focus:ring-offset-2 transition-all duration-300 font-semibold text-sm sm:text-base shadow-sm"
                            >
                                Quero criar conta para ver e me candidatar às vagas
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
