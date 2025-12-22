"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "@/components/AuthClientProvider";
import { updateProfile } from "./actions";
import { ProfileFormSteps, type ProfileFormData } from "@/components/applicant/profile/ProfileFormSteps";
import { ProfileHeader, ONBOARDING_STEPS } from "@/components/applicant/profile/ProfileHeader";
import { getLocationDescription, getCoordsFromAddress } from "@/utils/geocoding";

export default function ProfilePage() {
    const { user, profile, refreshProfile, loading: authLoading } = useAuth();
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
    const [isFirstTime, setIsFirstTime] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastSavedDataRef = useRef<string>("");

    // Estados para endereço
    const [enderecoManual, setEnderecoManual] = useState("");
    const [buscandoEndereco, setBuscandoEndereco] = useState(false);

    const [formData, setFormData] = useState<ProfileFormData>({
        full_name: "",
        email: "",
        description: "",
        birth_date: "",
        skills: [],
        courses: [],
        freelancer_services: [],
        experience: "",
        academic_background: "",
        has_children: false,
        has_drivers_license: [],
        home_address: null,
        instagram: "",
        facebook: "",
        linkedin: "",
        whatsapp: "",
        contact_email: "",
        portfolio: "",
    });

    const updateFormField = <K extends keyof ProfileFormData>(
        field: K,
        value: ProfileFormData[K]
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    // Função para verificar se é primeira vez preenchendo o perfil
    const checkIfFirstTime = useCallback((profileData: typeof profile) => {
        if (!profileData) {
            setIsFirstTime(true);
            return true;
        }

        const hasOnlyBasicData =
            (!profileData.description || profileData.description.trim() === "") &&
            (!profileData.birth_date || profileData.birth_date === "") &&
            (!profileData.skills || profileData.skills.length === 0) &&
            (!profileData.courses || profileData.courses.length === 0) &&
            (!profileData.freelancer_services || profileData.freelancer_services.length === 0) &&
            (!profileData.experience || profileData.experience.trim() === "") &&
            (!profileData.academic_background || profileData.academic_background.trim() === "") &&
            (!profileData.home_address);

        setIsFirstTime(hasOnlyBasicData);
        return hasOnlyBasicData;
    }, []);

    // Carregar dados do perfil
    useEffect(() => {
        if (!user) {
            setIsLoading(false);
            return;
        }

        if (profile) {
            const profileData: ProfileFormData = {
                full_name: profile.full_name || user.user_metadata?.full_name || "",
                email: profile.email || user.email || "",
                description: profile.description || "",
                birth_date: profile.birth_date || "",
                skills: profile.skills || [],
                courses: profile.courses || [],
                freelancer_services: profile.freelancer_services || [],
                experience: profile.experience || "",
                academic_background: profile.academic_background || "",
                has_children: profile.has_children || false,
                has_drivers_license: profile.has_drivers_license || [],
                home_address: profile.home_address || null,
                instagram: profile.instagram || "",
                facebook: profile.facebook || "",
                linkedin: profile.linkedin || "",
                whatsapp: profile.whatsapp || "",
                contact_email: profile.contact_email || "",
                portfolio: profile.portfolio || "",
            };

            setFormData(profileData);
            lastSavedDataRef.current = JSON.stringify(profileData);

            if (profile.home_address?.description) {
                setEnderecoManual(profile.home_address.description);
            }

            checkIfFirstTime(profile);
        } else {
            const basicData: ProfileFormData = {
                full_name: user.user_metadata?.full_name || "",
                email: user.email || "",
                description: "",
                birth_date: "",
                skills: [],
                courses: [],
                freelancer_services: [],
                experience: "",
                academic_background: "",
                has_children: false,
                has_drivers_license: [],
                home_address: null,
                instagram: "",
                facebook: "",
                linkedin: "",
                whatsapp: "",
                contact_email: "",
                portfolio: "",
            };

            setFormData(basicData);
            lastSavedDataRef.current = JSON.stringify(basicData);
            setIsFirstTime(true);
        }

        setIsLoading(false);
        setTimeout(() => {
            setIsInitializing(false);
        }, 500);
    }, [user, profile, checkIfFirstTime]);

    // Funções para endereço
    const obterLocalizacao = async () => {
        if (!navigator.geolocation) {
            alert("Geolocalização não suportada pelo navegador");
            return;
        }

        setIsLocating(true);
        try {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        const description = await getLocationDescription(latitude, longitude);
                        updateFormField("home_address", {
                            latitude,
                            longitude,
                            description,
                        });
                        setEnderecoManual(description);
                        alert("Localização obtida com sucesso!");
                    } catch (error) {
                        console.error("Erro ao obter descrição:", error);
                        alert("Erro ao obter endereço da localização");
                    } finally {
                        setIsLocating(false);
                    }
                },
                (error) => {
                    console.error("Erro ao obter localização:", error);
                    alert("Erro ao obter sua localização. Verifique as permissões.");
                    setIsLocating(false);
                }
            );
        } catch (error) {
            console.error("Erro:", error);
            alert("Erro ao obter localização");
            setIsLocating(false);
        }
    };

    const buscarEnderecoManual = async () => {
        if (!enderecoManual.trim()) {
            alert("Digite um endereço");
            return;
        }

        setBuscandoEndereco(true);
        try {
            const coords = await getCoordsFromAddress(enderecoManual);
            updateFormField("home_address", {
                latitude: coords.latitude,
                longitude: coords.longitude,
                description: enderecoManual.trim(),
            });
            alert("Endereço encontrado!");
        } catch (error) {
            console.error("Erro ao buscar endereço:", error);
            alert("Não foi possível encontrar o endereço. Verifique se está correto.");
        } finally {
            setBuscandoEndereco(false);
        }
    };

    // Função para salvar perfil
    const saveProfile = useCallback(
        async (data: ProfileFormData, showToast = true, redirectAfterSave = false) => {
            if (!user) {
                if (showToast) alert("Usuário não autenticado");
                return false;
            }

            setIsSaving(true);
            setSaveStatus("saving");

            try {
                await updateProfile(user.id, data);
                lastSavedDataRef.current = JSON.stringify(data);
                await refreshProfile();

                setSaveStatus("saved");

                if (showToast) {
                    alert("Perfil salvo com sucesso!");
                }

                if (redirectAfterSave && isFirstTime) {
                    setIsFirstTime(false);
                    setTimeout(() => {
                        router.push("/applicant");
                    }, 1500);
                } else if (isFirstTime && data) {
                    const hasSignificantData =
                        (data.description && data.description.trim().length >= 20) ||
                        (data.skills && data.skills.length > 0) ||
                        (data.courses && data.courses.length > 0) ||
                        (data.experience && data.experience.trim().length > 0) ||
                        (data.academic_background && data.academic_background.trim().length > 0) ||
                        data.home_address;

                    if (hasSignificantData) {
                        setIsFirstTime(false);
                    }
                }

                setTimeout(() => {
                    setSaveStatus("idle");
                }, 3000);

                return true;
            } catch (error) {
                console.error("Erro ao salvar perfil:", error);
                setSaveStatus("error");

                if (showToast) {
                    alert("Erro ao salvar perfil. Tente novamente.");
                }

                setTimeout(() => {
                    setSaveStatus("idle");
                }, 3000);

                return false;
            } finally {
                setIsSaving(false);
            }
        },
        [user, refreshProfile, router, isFirstTime]
    );

    // Salvar perfil (submit manual)
    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await saveProfile(formData, true, true);
    };

    // Salvamento automático com debounce
    useEffect(() => {
        if (!user || isLoading || authLoading || isFirstTime || isInitializing) {
            return;
        }

        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        const currentData = JSON.stringify(formData);

        if (currentData === lastSavedDataRef.current) {
            return;
        }

        saveTimeoutRef.current = setTimeout(() => {
            saveProfile(formData, false, false);
        }, 2000);

        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [
        formData,
        user,
        isLoading,
        authLoading,
        isFirstTime,
        isInitializing,
        saveProfile,
    ]);

    const nextStep = () => {
        if (currentStep < ONBOARDING_STEPS.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const goToStep = (stepId: number) => {
        if (stepId >= 1 && stepId <= ONBOARDING_STEPS.length) {
            setCurrentStep(stepId);
        }
    };

    // Mostra loading enquanto autenticação está carregando
    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#5e9ea0]" />
            </div>
        );
    }

    // Só mostra mensagem de login se realmente não há usuário após o carregamento
    if (!authLoading && !user) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 text-center">
                    <p className="text-slate-600">Faça login para editar seu perfil</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            <ProfileHeader
                currentStep={currentStep}
                saveStatus={saveStatus}
                onStepClick={goToStep}
            />

            <div className="max-w-4xl mx-auto p-4 lg:p-6">
                {/* Aviso para primeira vez preenchendo o perfil */}
                {isFirstTime && (
                    <div className="mb-6 rounded-xl border-l-4 border-amber-500 bg-gradient-to-br from-amber-50 to-amber-50/50 p-4 sm:p-5 shadow-sm">
                        <div className="flex items-start gap-3 sm:gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm sm:text-base font-semibold text-slate-900 mb-2">
                                    Complete seu perfil para se candidatar às vagas
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-2">
                                    Esta é sua primeira vez preenchendo o perfil. Para que suas informações sejam salvas e você possa se candidatar às vagas disponíveis, é necessário completar todos os passos e clicar em <strong>&quot;Finalizar e Salvar&quot;</strong> ao final do formulário.
                                </p>
                                <p className="text-xs sm:text-sm text-slate-600 italic">
                                    Após o primeiro salvamento, suas alterações futuras serão salvas automaticamente.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={onSubmit} className="space-y-6">
                    <ProfileFormSteps
                        currentStep={currentStep}
                        formData={formData}
                        updateFormField={updateFormField}
                        enderecoManual={enderecoManual}
                        setEnderecoManual={setEnderecoManual}
                        isLocating={isLocating}
                        buscandoEndereco={buscandoEndereco}
                        onObterLocalizacao={obterLocalizacao}
                        onBuscarEndereco={buscarEnderecoManual}
                    />

                    {/* Botões de navegação */}
                    <div className="flex gap-3 pt-4">
                        {currentStep > 1 && (
                            <Button
                                type="button"
                                onClick={prevStep}
                                variant="outline"
                                className="flex-1 h-12 text-base"
                            >
                                Anterior
                            </Button>
                        )}

                        {currentStep < ONBOARDING_STEPS.length ? (
                            <Button
                                type="button"
                                onClick={nextStep}
                                className="flex-1 bg-[#5e9ea0] hover:bg-[#4a8b8f] text-white h-12 text-base font-semibold"
                            >
                                Próximo
                            </Button>
                        ) : (
                            isFirstTime && (
                                <Button
                                    type="submit"
                                    className="flex-1 bg-[#5e9ea0] hover:bg-[#4a8b8f] text-white h-12 text-base font-semibold"
                                    disabled={isSaving}
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Salvando...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5 mr-2" />
                                            Finalizar e Salvar
                                        </>
                                    )}
                                </Button>
                            )
                        )}
                    </div>

                    {/* Mensagem informativa sobre salvamento automático */}
                    {!isFirstTime && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-800 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" />
                                Suas alterações são salvas automaticamente enquanto você preenche o formulário.
                            </p>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
