/**
 * Tipos relacionados ao sistema de vagas
 */

export type JobStatus = 'recebendo_candidatos' | 'pausada' | 'finalizada' | 'rascunho';
export type WorkModel = 'presencial' | 'remoto' | 'hibrido';

/**
 * Estrutura de dados de uma vaga (jobs) conforme o banco de dados
 */
export interface Job {
    id: string;
    owner_id: string;
    title: string;
    status: JobStatus;
    applications_count: number;
    candidates_in_review: number;
    new_applications_last_24h: number;
    last_activity_at: string | null;
    created_at: string;
    updated_at: string;
    description: string | null;
    work_model: WorkModel | null;
    required_skills: string | null;
    preferred_skills: string | null;
    company_culture: string | null;
    benefits: string | null;
    salary_range: string | null;
    selection_stages: string | null;
    behavioral_competencies: string | null;
    work_address: string | null;
    latitude: number | null;
    longitude: number | null;
}

/**
 * Interface para exibição na UI (transformada do Job)
 */
export interface JobDisplay {
    id: string;
    titulo: string;
    localizacao: string;
    tipo: string; // work_model formatado
    salario: string; // salary_range
    descricao: string;
    requisitos: string[]; // required_skills parseado
    habilidadesPreferidas: string[]; // preferred_skills parseado
    data_publicacao: string; // created_at
    status: JobStatus;
    numero_candidatos: number; // applications_count
    latitude: number | null;
    longitude: number | null;
    work_model: WorkModel | null;
    benefits: string | null;
    company_culture: string | null;
    selection_stages: string | null;
    behavioral_competencies: string | null;
}

export interface JobApplication {
    job_id: string;
    user_id: string;
    applied_at: string;
}
