"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";

export interface UserProfile {
    id: string;
    email: string | null;
    full_name: string | null;
    description: string | null;
    birth_date: string | null;
    skills: string[];
    courses: string[];
    freelancer_services: string[];
    experience: string | null;
    academic_background: string | null;
    has_children: boolean | null;
    has_drivers_license: string[];
    home_address: {
        latitude: number;
        longitude: number;
        description: string;
    } | null;
    instagram: string | null;
    facebook: string | null;
    linkedin: string | null;
    whatsapp: string | null;
    contact_email: string | null;
    portfolio: string | null;
    profile_completed: boolean;
    profile_analysis: string[];
    authorized_competencies?: string[];
    created_at: string;
    updated_at: string | null;
}

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
    profileLoading: boolean;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthClientProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [profileLoading, setProfileLoading] = useState(false);
    const supabase = createClient();

    const fetchProfile = async (userId: string, userEmail?: string | null, userFullName?: string | null) => {
        setProfileLoading(true);
        try {
            // Timeout de 5 segundos para evitar travamentos
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Timeout ao buscar perfil")), 5000)
            );

            const fetchPromise = supabase
                .from("users")
                .select("*")
                .eq("id", userId)
                .single();

            const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

            if (error) {
                // Se o perfil não existe, cria um básico (apenas se for erro de não encontrado)
                if (error.code === "PGRST116") {
                    try {
                        const { data: newProfile, error: insertError } = await supabase
                            .from("users")
                            .insert({
                                id: userId,
                                email: userEmail || null,
                                full_name: userFullName || null,
                            } as any)
                            .select()
                            .single();

                        if (insertError) {
                            console.warn("Erro ao criar perfil:", insertError);
                            setProfileLoading(false);
                            return;
                        }

                        setProfile(newProfile as UserProfile);
                        setProfileLoading(false);
                        return;
                    } catch (insertErr) {
                        console.warn("Erro ao criar perfil:", insertErr);
                        setProfileLoading(false);
                        return;
                    }
                }
                // Para outros erros, apenas logar (não quebrar a aplicação)
                console.warn("Erro ao buscar perfil:", error);
                setProfileLoading(false);
                return;
            }

            setProfile(data as UserProfile);
            setProfileLoading(false);
        } catch (error) {
            // Erro de timeout ou rede - não quebrar a aplicação
            console.warn("Erro ao buscar perfil (não crítico):", error);
            setProfileLoading(false);
        }
    };

    const refreshProfile = async () => {
        if (user) {
            await fetchProfile(
                user.id,
                user.email,
                user.user_metadata?.full_name
            );
        }
    };

    useEffect(() => {
        let mounted = true;

        const initAuth = async () => {
            try {
                // Usar getSession() que é mais rápido e não faz fetch adicional
                const {
                    data: { session },
                    error,
                } = await supabase.auth.getSession();

                if (!mounted) return;

                if (error) {
                    console.warn("Erro ao obter sessão:", error);
                    setLoading(false);
                    return;
                }

                if (session?.user) {
                    setUser(session.user);
                    // Buscar perfil de forma não bloqueante
                    fetchProfile(
                        session.user.id,
                        session.user.email,
                        session.user.user_metadata?.full_name
                    ).catch((err) => {
                        console.warn("Erro ao buscar perfil inicial:", err);
                    });
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.warn("Erro ao inicializar autenticação:", error);
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        initAuth();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return;

            if (session?.user) {
                setUser(session.user);
                // Buscar perfil de forma não bloqueante
                fetchProfile(
                    session.user.id,
                    session.user.email,
                    session.user.user_metadata?.full_name
                ).catch((err) => {
                    console.warn("Erro ao buscar perfil após mudança de auth:", err);
                });
            } else {
                // Limpar estado quando não há sessão
                setUser(null);
                setProfile(null);
                setProfileLoading(false);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    return (
        <AuthContext.Provider value={{ user, profile, loading, profileLoading, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth deve ser usado dentro de AuthClientProvider");
    }
    return context;
}

