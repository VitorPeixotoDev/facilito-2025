"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Save, CheckCircle2 } from "lucide-react";
import { ProfileShellSkeleton, Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/AuthClientProvider";
import { updateProfile, type ProfileUpdateData } from "./actions";
import { ProfileFormSteps, type ProfileFormData } from "@/components/applicant/profile/ProfileFormSteps";
import { isBirthDateAfterToday } from "@/components/applicant/profile/utils";
import { ProfileHeader, ONBOARDING_STEPS } from "@/components/applicant/profile/ProfileHeader";
import { getLocationDescription, getCoordsFromAddress } from "@/utils/geocoding";
import {
    hasMeaningfulWorkExperience,
    hasMeaningfulWorkExperienceFromDb,
    parseExperienceFromDb,
    serializeExperienceForDb,
    type WorkExperienceEntry,
} from "@/lib/workExperience";
import {
    mapZodIssuesToFieldErrorsRecord,
    validateWorkExperienceList,
} from "@/lib/validation/workExperienceSchema";

// Chave para localStorage
const PROFILE_DRAFT_KEY = "profile_draft_data";

const PROFILE_EXPERIENCE_DRAFT_KEY_PREFIX = "facilito_profile_experience_draft_v1_";

function experienceDraftStorageKey(userId: string) {
    return `${PROFILE_EXPERIENCE_DRAFT_KEY_PREFIX}${userId}`;
}

function persistExperienceDraftToStorage(userId: string, entries: WorkExperienceEntry[]) {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(
            experienceDraftStorageKey(userId),
            JSON.stringify({ v: 1, updatedAt: Date.now(), entries })
        );
    } catch (error) {
        console.warn("Erro ao persistir rascunho de experiência:", error);
    }
}

function loadExperienceDraftFromStorage(userId: string): WorkExperienceEntry[] | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = localStorage.getItem(experienceDraftStorageKey(userId));
        if (!raw) return null;
        const parsed: unknown = JSON.parse(raw);
        if (
            parsed &&
            typeof parsed === "object" &&
            parsed !== null &&
            "entries" in parsed &&
            Array.isArray((parsed as { entries: unknown }).entries)
        ) {
            return parseExperienceFromDb((parsed as { entries: unknown }).entries);
        }
        if (Array.isArray(parsed)) {
            return parseExperienceFromDb(parsed);
        }
    } catch (error) {
        console.warn("Erro ao carregar rascunho de experiência:", error);
    }
    return null;
}

function clearExperienceDraftFromStorage(userId: string) {
    if (typeof window === "undefined") return;
    try {
        localStorage.removeItem(experienceDraftStorageKey(userId));
    } catch (error) {
        console.warn("Erro ao limpar rascunho de experiência:", error);
    }
}

/** Snapshot do formulário sem experiência (para autosave não reagir só a mudanças em experience). */
function stripExperienceForCompare(data: ProfileFormData): string {
    const { experience: _exp, ...rest } = data;
    return JSON.stringify(rest);
}

function experienceKeyFromForm(data: ProfileFormData): string {
    return JSON.stringify(data.experience ?? []);
}

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
    const lastSavedNonExperienceRef = useRef<string>("");
    const lastSavedExperienceRef = useRef<string>("");

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
        experience: [],
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
    const [stepError, setStepError] = useState<string | null>(null);
    const [experienceStepFieldErrors, setExperienceStepFieldErrors] = useState<Record<
        string,
        string
    > | null>(null);

    const updateFormField = <K extends keyof ProfileFormData>(
        field: K,
        value: ProfileFormData[K]
    ) => {
        if (field === "experience") {
            setExperienceStepFieldErrors(null);
        }
        setFormData((prev) => {
            const newData = { ...prev, [field]: value };
            // Salva no localStorage como backup durante primeiro preenchimento
            if (isFirstTime && typeof window !== "undefined") {
                try {
                    localStorage.setItem(PROFILE_DRAFT_KEY, JSON.stringify(newData));
                } catch (error) {
                    console.warn("Erro ao salvar rascunho no localStorage:", error);
                }
            }
            return newData;
        });
    };

    // Carregar rascunho do localStorage se existir
    const loadDraftFromLocalStorage = useCallback(() => {
        if (typeof window === 'undefined') return null;

        try {
            const draft = localStorage.getItem(PROFILE_DRAFT_KEY);
            if (draft) {
                return JSON.parse(draft) as ProfileFormData;
            }
        } catch (error) {
            console.warn('Erro ao carregar rascunho do localStorage:', error);
        }
        return null;
    }, []);

    // Limpar rascunho do localStorage
    const clearDraftFromLocalStorage = useCallback(() => {
        if (typeof window !== 'undefined') {
            try {
                localStorage.removeItem(PROFILE_DRAFT_KEY);
            } catch (error) {
                console.warn('Erro ao limpar rascunho do localStorage:', error);
            }
        }
    }, []);

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
            !hasMeaningfulWorkExperienceFromDb(profileData.experience) &&
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

        let profileData: ProfileFormData;

        if (profile) {
            profileData = {
                full_name: profile.full_name || user.user_metadata?.full_name || "",
                email: profile.email || user.email || "",
                description: profile.description || "",
                birth_date: profile.birth_date || "",
                skills: profile.skills || [],
                courses: profile.courses || [],
                freelancer_services: profile.freelancer_services || [],
                experience: parseExperienceFromDb(profile.experience),
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

            if (profile.home_address?.description) {
                setEnderecoManual(profile.home_address.description);
            }

            const isFirst = checkIfFirstTime(profile);

            // Se é primeira vez, tenta carregar rascunho do localStorage
            if (isFirst) {
                const draft = loadDraftFromLocalStorage();
                if (draft) {
                    // Mescla dados do banco com rascunho (rascunho tem prioridade)
                    profileData = {
                        ...profileData,
                        ...draft,
                        // Mantém dados básicos do perfil
                        full_name: draft.full_name || profileData.full_name,
                        email: draft.email || profileData.email,
                        experience: parseExperienceFromDb(
                            draft.experience !== undefined ? draft.experience : profile.experience
                        ),
                    };

                    if (draft.home_address?.description) {
                        setEnderecoManual(draft.home_address.description);
                    }
                }
            }
        } else {
            const basicData: ProfileFormData = {
                full_name: user.user_metadata?.full_name || "",
                email: user.email || "",
                description: "",
                birth_date: "",
                skills: [],
                courses: [],
                freelancer_services: [],
                experience: [],
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

            // Tenta carregar rascunho do localStorage
            const draft = loadDraftFromLocalStorage();
            profileData = draft
                ? {
                      ...(draft as ProfileFormData),
                      experience: parseExperienceFromDb(
                          (draft as { experience?: unknown }).experience
                      ),
                  }
                : basicData;

            if (draft?.home_address?.description) {
                setEnderecoManual(draft.home_address.description);
            }

            setIsFirstTime(true);
        }

        if (user?.id) {
            const experienceDraft = loadExperienceDraftFromStorage(user.id);
            if (experienceDraft !== null) {
                profileData = { ...profileData, experience: experienceDraft };
            }
        }

        setFormData(profileData);
        lastSavedDataRef.current = JSON.stringify(profileData);
        lastSavedNonExperienceRef.current = stripExperienceForCompare(profileData);
        lastSavedExperienceRef.current = experienceKeyFromForm(profileData);

        setIsLoading(false);
        setTimeout(() => {
            setIsInitializing(false);
        }, 500);
    }, [user, profile, checkIfFirstTime, loadDraftFromLocalStorage]);

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
            // Remove alert - feedback visual já é suficiente
        } catch (error) {
            console.error("Erro ao buscar endereço:", error);
            const errorMessage = error instanceof Error
                ? error.message
                : "Não foi possível encontrar o endereço. Verifique se está correto.";
            alert(errorMessage);
        } finally {
            setBuscandoEndereco(false);
        }
    };

    type SaveProfileOptions = { persistWorkExperience?: boolean };

    // Função para salvar perfil
    const saveProfile = useCallback(
        async (
            data: ProfileFormData,
            showToast = true,
            redirectAfterSave = false,
            options?: SaveProfileOptions
        ) => {
            const persistWorkExperience = options?.persistWorkExperience !== false;
            if (!user) {
                if (showToast) alert("Usuário não autenticado");
                return false;
            }

            if (data.birth_date?.trim() && isBirthDateAfterToday(data.birth_date.trim())) {
                if (showToast) {
                    alert("A data de nascimento não pode ser futura.");
                }
                return false;
            }

            setIsSaving(true);
            setSaveStatus("saving");

            try {
                const payload: ProfileUpdateData = {
                    ...(data as unknown as ProfileUpdateData),
                };
                if (persistWorkExperience) {
                    const experienceValidation = validateWorkExperienceList(data.experience ?? []);
                    if (!experienceValidation.success) {
                        setSaveStatus("error");
                        if (showToast) {
                            alert(experienceValidation.message);
                        }
                        setTimeout(() => setSaveStatus("idle"), 3000);
                        return false;
                    }
                    payload.experience = serializeExperienceForDb(experienceValidation.data);
                } else {
                    delete payload.experience;
                }
                await updateProfile(user.id, payload);
                lastSavedNonExperienceRef.current = stripExperienceForCompare(data);
                if (persistWorkExperience) {
                    lastSavedExperienceRef.current = experienceKeyFromForm(data);
                    lastSavedDataRef.current = JSON.stringify(data);
                    clearExperienceDraftFromStorage(user.id);
                    await refreshProfile();
                }

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
                        hasMeaningfulWorkExperience(data.experience) ||
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
    const validateStep = (step: number): boolean => {
        // Validações simples por etapa. Ajuste conforme necessidade de negócio.
        switch (step) {
            case 1: {
                const errors: string[] = [];
                if (!formData.full_name?.trim()) {
                    errors.push("Informe seu nome completo.");
                }
                if (!formData.birth_date?.trim()) {
                    errors.push("Informe sua data de nascimento.");
                } else if (isBirthDateAfterToday(formData.birth_date.trim())) {
                    errors.push("A data de nascimento não pode ser futura.");
                }
                if (!formData.email?.trim()) {
                    errors.push("Informe um email.");
                } else {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(formData.email)) {
                        errors.push("Informe um email válido.");
                    }
                }
                if (errors.length) {
                    setStepError(errors.join(" "));
                    return false;
                }
                break;
            }
            case 2: {
                if (
                    (!formData.skills || formData.skills.length === 0) &&
                    !hasMeaningfulWorkExperience(formData.experience) &&
                    (!formData.freelancer_services || formData.freelancer_services.length === 0)
                ) {
                    setExperienceStepFieldErrors(null);
                    setStepError("Adicione pelo menos uma habilidade, experiência ou serviço freelance.");
                    return false;
                }
                if (formData.experience.length > 0) {
                    const experienceValidation = validateWorkExperienceList(formData.experience);
                    if (!experienceValidation.success) {
                        setStepError(null);
                        setExperienceStepFieldErrors(
                            mapZodIssuesToFieldErrorsRecord(experienceValidation.issues)
                        );
                        return false;
                    }
                }
                setExperienceStepFieldErrors(null);
                break;
            }
            case 3: {
                if (!formData.academic_background?.trim() && (!formData.courses || formData.courses.length === 0)) {
                    setStepError("Preencha sua formação acadêmica ou adicione pelo menos um curso.");
                    return false;
                }
                break;
            }
            case 4: {
                if (!formData.home_address || !formData.home_address.description?.trim()) {
                    setStepError("Informe seu endereço ou use a localização para prosseguir.");
                    return false;
                }
                break;
            }
            case 5: {
                const errors: string[] = [];

                if (!formData.contact_email?.trim()) {
                    errors.push("Informe um email para contato.");
                }

                if (!formData.whatsapp?.trim()) {
                    errors.push("Informe seu WhatsApp.");
                }

                if (errors.length) {
                    setStepError(errors.join(" "));
                    return false;
                }
                break;
            }
            default:
                break;
        }

        setStepError(null);
        setExperienceStepFieldErrors(null);
        return true;
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await saveProfile(formData, true, true);
    };

    const onManualSaveLongTextField = useCallback(
        async (field: "description" | "academic_background", value: string) => {
            const nextData = { ...formData, [field]: value };
            setFormData(nextData);

            if (isFirstTime && typeof window !== "undefined") {
                try {
                    localStorage.setItem(PROFILE_DRAFT_KEY, JSON.stringify(nextData));
                } catch (error) {
                    console.warn("Erro ao salvar rascunho no localStorage:", error);
                }
            }

            return saveProfile(nextData, false, false);
        },
        [formData, isFirstTime, saveProfile]
    );

    const onSaveWorkExperience = useCallback(
        async (entries: WorkExperienceEntry[]) => {
            const experienceValidation = validateWorkExperienceList(entries);
            if (!experienceValidation.success) {
                alert(experienceValidation.message);
                return false;
            }
            const nextData = { ...formData, experience: experienceValidation.data };
            setFormData(nextData);

            if (isFirstTime && typeof window !== "undefined") {
                try {
                    localStorage.setItem(PROFILE_DRAFT_KEY, JSON.stringify(nextData));
                } catch (error) {
                    console.warn("Erro ao salvar rascunho no localStorage:", error);
                }
            }

            const ok = await saveProfile(nextData, false, false);
            if (ok) {
                setExperienceStepFieldErrors(null);
            }
            return ok;
        },
        [formData, isFirstTime, saveProfile]
    );

    // Salvamento automático com debounce
    // Agora funciona também no primeiro preenchimento (com debounce maior)
    useEffect(() => {
        if (!user || isLoading || authLoading || isInitializing) {
            return;
        }

        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        const nonExp = stripExperienceForCompare(formData);
        const exp = experienceKeyFromForm(formData);
        if (nonExp === lastSavedNonExperienceRef.current && exp === lastSavedExperienceRef.current) {
            return;
        }
        // Mudanças só em experiência profissional não disparam autosave (uso do botão "Salvar experiências").
        if (nonExp === lastSavedNonExperienceRef.current && exp !== lastSavedExperienceRef.current) {
            return;
        }

        // Debounce maior no primeiro preenchimento (5s vs 2s)
        const debounceTime = isFirstTime ? 5000 : 2000;

        saveTimeoutRef.current = setTimeout(() => {
            saveProfile(formData, false, false, { persistWorkExperience: false });
        }, debounceTime);

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

    // Rascunho local da experiência profissional (troca de app/aba, navegação)
    useEffect(() => {
        if (!user?.id || isLoading || authLoading || isInitializing) {
            return;
        }
        const timeoutId = setTimeout(() => {
            persistExperienceDraftToStorage(user.id, formData.experience);
        }, 400);
        return () => clearTimeout(timeoutId);
    }, [formData.experience, user?.id, isLoading, authLoading, isInitializing]);

    const nextStep = () => {
        if (currentStep < ONBOARDING_STEPS.length && validateStep(currentStep)) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const goToStep = (stepId: number) => {
        if (stepId < 1 || stepId > ONBOARDING_STEPS.length) return;

        if (stepId <= currentStep) {
            // Sempre permite voltar ou ir para etapas anteriores
            setCurrentStep(stepId);
            setStepError(null);
            setExperienceStepFieldErrors(null);
            return;
        }

        // Para avançar para etapas futuras, valida a etapa atual
        if (validateStep(currentStep)) {
            setCurrentStep(stepId);
        }
    };

    // Mostra loading enquanto autenticação está carregando
    if (authLoading || isLoading) {
        return <ProfileShellSkeleton />;
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

            <div className="max-w-6xl mx-auto p-4 lg:p-8">
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
                        onManualSaveLongTextField={onManualSaveLongTextField}
                        onSaveWorkExperience={onSaveWorkExperience}
                        experienceStepFieldErrors={experienceStepFieldErrors}
                    />

                    {stepError && (
                        <div className="mt-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            {stepError}
                        </div>
                    )}

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
                            <div className="flex flex-1 gap-3">
                                {isFirstTime && (
                                    <Button
                                        type="submit"
                                        className="flex-1 bg-[#5e9ea0] hover:bg-[#4a8b8f] text-white h-12 text-base font-semibold"
                                        disabled={isSaving}
                                    >
                                        {isSaving ? (
                                            <>
                                                <Skeleton className="mr-2 h-5 w-5 shrink-0 rounded-full bg-[#5e9ea0]/35" aria-hidden />
                                                Salvando...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-5 h-5 mr-2" />
                                                Finalizar e Salvar
                                            </>
                                        )}
                                    </Button>
                                )}
                                <Link
                                    href="/applicant/vacancies"
                                    className="flex-1 inline-flex items-center justify-center rounded-md border border-slate-300 bg-white h-12 text-base font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    Ir para Vagas
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mensagem informativa sobre salvamento automático */}
                    {!isFirstTime && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-800 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" />
                                Onde não há o botão de &quot;Salvar&quot;, suas alterações são salvas automaticamente enquanto você preenche o formulário.
                            </p>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
