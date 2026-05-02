export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string;
                    email: string | null;
                    full_name: string | null;
                    created_at: string;
                    updated_at: string | null;
                    skills: string[];
                    has_drivers_license: string[];
                    profile_analysis: string[] | null;
                    description: string | null;
                    birth_date: string | null;
                    courses: string[];
                    freelancer_services: string[];
                    experience: string | null;
                    academic_background: string | null;
                    has_children: boolean | null;
                    home_address: Json | null;
                    instagram: string | null;
                    facebook: string | null;
                    linkedin: string | null;
                    whatsapp: string | null;
                    contact_email: string | null;
                    portfolio: string | null;
                    profile_completed: boolean;
                    authorized_competencies: string[];
                };
                Insert: {
                    id: string;
                    email?: string | null;
                    full_name?: string | null;
                    created_at?: string;
                    updated_at?: string | null;
                    skills?: string[];
                    has_drivers_license?: string[];
                    profile_analysis?: string[] | null;
                    description?: string | null;
                    birth_date?: string | null;
                    courses?: string[];
                    freelancer_services?: string[];
                    experience?: string | null;
                    academic_background?: string | null;
                    has_children?: boolean | null;
                    home_address?: Json | null;
                    instagram?: string | null;
                    facebook?: string | null;
                    linkedin?: string | null;
                    whatsapp?: string | null;
                    contact_email?: string | null;
                    portfolio?: string | null;
                    profile_completed?: boolean;
                    authorized_competencies?: string[];
                };
                Update: {
                    id?: string;
                    email?: string | null;
                    full_name?: string | null;
                    created_at?: string;
                    updated_at?: string | null;
                    skills?: string[];
                    has_drivers_license?: string[];
                    profile_analysis?: string[] | null;
                    description?: string | null;
                    birth_date?: string | null;
                    courses?: string[];
                    freelancer_services?: string[];
                    experience?: string | null;
                    academic_background?: string | null;
                    has_children?: boolean | null;
                    home_address?: Json | null;
                    instagram?: string | null;
                    facebook?: string | null;
                    linkedin?: string | null;
                    whatsapp?: string | null;
                    contact_email?: string | null;
                    portfolio?: string | null;
                    profile_completed?: boolean;
                    authorized_competencies?: string[];
                };
            };
            assessment_prices: {
                Row: {
                    assessment_id: string;
                    price_cents: number;
                    updated_at: string | null;
                };
                Insert: {
                    assessment_id: string;
                    price_cents: number;
                    updated_at?: string | null;
                };
                Update: {
                    assessment_id?: string;
                    price_cents?: number;
                    updated_at?: string | null;
                };
            };
            assessment_purchases: {
                Row: {
                    id: string;
                    user_id: string;
                    assessment_id: string;
                    stripe_session_id: string;
                    product_name: string | null;
                    amount_cents: number | null;
                    payment_method: string | null;
                    payment_provider: string | null;
                    payment_reference: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    assessment_id: string;
                    stripe_session_id: string;
                    product_name?: string | null;
                    amount_cents?: number | null;
                    payment_method?: string | null;
                    payment_provider?: string | null;
                    payment_reference?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    assessment_id?: string;
                    stripe_session_id?: string;
                    product_name?: string | null;
                    amount_cents?: number | null;
                    payment_method?: string | null;
                    payment_provider?: string | null;
                    payment_reference?: string | null;
                    created_at?: string;
                };
            };
            assessment_results: {
                Row: {
                    id: string;
                    user_id: string;
                    assessment_id: string;
                    assessment_name: string;
                    results: Record<string, any>;
                    score: number | null;
                    completed_at: string;
                    created_at: string;
                    updated_at: string | null;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    assessment_id: string;
                    assessment_name: string;
                    results: Record<string, any>;
                    score?: number | null;
                    completed_at?: string;
                    created_at?: string;
                    updated_at?: string | null;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    assessment_id?: string;
                    assessment_name?: string;
                    results?: Record<string, any>;
                    score?: number | null;
                    completed_at?: string;
                    created_at?: string;
                    updated_at?: string | null;
                };
            };
            five_mind_results: {
                Row: {
                    id: string;
                    user_id: string;
                    openness: number;
                    conscientiousness: number;
                    extraversion: number;
                    agreeableness: number;
                    neuroticism: number;
                    overall_score: number | null;
                    completed_at: string;
                    created_at: string;
                    updated_at: string | null;
                    authorized_for_suggestions: boolean;
                    authorized_to_show_results: boolean;
                    expires_at: string | null;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    openness: number;
                    conscientiousness: number;
                    extraversion: number;
                    agreeableness: number;
                    neuroticism: number;
                    overall_score?: number | null;
                    completed_at?: string;
                    created_at?: string;
                    updated_at?: string | null;
                    authorized_for_suggestions?: boolean;
                    authorized_to_show_results?: boolean;
                    expires_at?: string | null;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    openness?: number;
                    conscientiousness?: number;
                    extraversion?: number;
                    agreeableness?: number;
                    neuroticism?: number;
                    overall_score?: number | null;
                    completed_at?: string;
                    created_at?: string;
                    updated_at?: string | null;
                    authorized_for_suggestions?: boolean;
                    authorized_to_show_results?: boolean;
                    expires_at?: string | null;
                };
            };
            hexa_mind_results: {
                Row: {
                    id: string;
                    user_id: string;
                    honesty: number;
                    emotional_stability: number;
                    extraversion: number;
                    agreeableness: number;
                    conscientiousness: number;
                    openness: number;
                    consistency: number;
                    response_consistency: number;
                    overall_score: number | null;
                    completed_at: string;
                    created_at: string;
                    updated_at: string | null;
                    authorized_for_suggestions: boolean;
                    authorized_to_show_results: boolean;
                    expires_at: string | null;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    honesty: number;
                    emotional_stability: number;
                    extraversion: number;
                    agreeableness: number;
                    conscientiousness: number;
                    openness: number;
                    consistency: number;
                    response_consistency: number;
                    overall_score?: number | null;
                    completed_at?: string;
                    created_at?: string;
                    updated_at?: string | null;
                    authorized_for_suggestions?: boolean;
                    authorized_to_show_results?: boolean;
                    expires_at?: string | null;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    honesty?: number;
                    emotional_stability?: number;
                    extraversion?: number;
                    agreeableness?: number;
                    conscientiousness?: number;
                    openness?: number;
                    consistency?: number;
                    response_consistency?: number;
                    overall_score?: number | null;
                    completed_at?: string;
                    created_at?: string;
                    updated_at?: string | null;
                    authorized_for_suggestions?: boolean;
                    authorized_to_show_results?: boolean;
                    expires_at?: string | null;
                };
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            [_ in never]: never;
        };
    };
}

