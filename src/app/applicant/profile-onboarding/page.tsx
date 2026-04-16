"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const PROFILE_ONBOARDING_SEEN_KEY = "facilito.profile_onboarding_seen.v1";

export default function ApplicantProfileOnboardingPage() {
    const router = useRouter();

    const handleGoToProfile = () => {
        try {
            localStorage.setItem(PROFILE_ONBOARDING_SEEN_KEY, "1");
        } catch {
            // ignore
        }
        router.push("/applicant/profile");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-slate-50 flex items-center justify-center p-4 sm:p-6">
            <div className="w-full max-w-2xl rounded-2xl border border-amber-100 bg-white/90 backdrop-blur shadow-lg overflow-hidden">
                <div className="p-6 sm:p-8">
                    <div className="flex items-start gap-4 sm:gap-5">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            <Image
                                src="/lito_estagiario_bg.png"
                                alt="Lito"
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                                priority
                            />
                        </div>

                        <div className="flex-1">
                            <h1 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">
                                Complete seu perfil para se candidatar às vagas
                            </h1>
                            <p className="text-sm text-slate-700 leading-relaxed mb-3">
                                Esta é sua primeira vez preenchendo o perfil. Para que suas informações sejam salvas e você possa se candidatar às vagas disponíveis, é necessário completar todos os passos e clicar em{" "}
                                <strong>&quot;Finalizar e Salvar&quot;</strong> ao final do formulário.
                            </p>
                            <p className="text-sm text-slate-600 italic">
                                Após o primeiro salvamento, suas alterações futuras serão salvas automaticamente.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 sm:mt-8 flex">
                        <Button
                            type="button"
                            onClick={handleGoToProfile}
                            className="w-full h-12 text-base font-semibold bg-[#5e9ea0] hover:bg-[#4a8b8f] text-white"
                        >
                            Ir para meu perfil
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

