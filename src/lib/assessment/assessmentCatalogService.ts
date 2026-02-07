/**
 * Catálogo de avaliações e questões a partir do banco (tabelas assessments, assessment_questions, assessment_scale_options).
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export interface AssessmentCatalogRow {
  id: string;
  slug: string;
  name: string;
  image: string | null;
  description: string;
  estimated_time: string;
  question_count: number;
  category: string;
}

export interface AssessmentQuestionRow {
  id: string;
  assessment_id: string;
  sort_order: number;
  text: string;
  factor: string;
  reverse_score: boolean;
}

export interface AssessmentScaleOptionRow {
  id: string;
  assessment_id: string;
  value: number;
  label: string;
  emoji: string | null;
  description: string | null;
  sort_order: number;
}

/** Formato usado no frontend. id = UUID (seguro); slug = five-mind/hexa-mind (lógica interna). */
export interface AssessmentFromCatalog {
  id: string;
  slug: string;
  name: string;
  image?: string;
  description: string;
  estimatedTime: string;
  questionCount: number;
  category: string;
}

/** Questão para o questionário */
export interface QuestionFromCatalog {
  id: string;
  text: string;
  factor: string;
  reverse?: boolean;
}

/** Opção de escala */
export interface ScaleOptionFromCatalog {
  value: number;
  label: string;
  emoji?: string;
  description?: string;
}

export async function getAssessmentsFromCatalog(
  supabase: SupabaseClient
): Promise<AssessmentFromCatalog[]> {
  const { data, error } = await supabase
    .from("assessments")
    .select("id, slug, name, image, description, estimated_time, question_count, category")
    .order("slug");

  if (error) {
    console.error("[assessmentCatalogService] getAssessmentsFromCatalog:", error);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: String(row.id),
    slug: row.slug ?? "",
    name: row.name,
    image: row.image ?? undefined,
    description: row.description,
    estimatedTime: row.estimated_time,
    questionCount: row.question_count,
    category: row.category,
  }));
}

export async function getAssessmentByIdFromCatalog(
  supabase: SupabaseClient,
  id: string
): Promise<AssessmentFromCatalog | null> {
  const { data, error } = await supabase
    .from("assessments")
    .select("id, slug, name, image, description, estimated_time, question_count, category")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[assessmentCatalogService] getAssessmentByIdFromCatalog:", error);
    return null;
  }

  if (!data) return null;

  return {
    id: String(data.id),
    slug: data.slug ?? "",
    name: data.name,
    image: data.image ?? undefined,
    description: data.description,
    estimatedTime: data.estimated_time,
    questionCount: data.question_count,
    category: data.category,
  };
}

export async function getAssessmentQuestionsFromCatalog(
  supabase: SupabaseClient,
  assessmentId: string
): Promise<QuestionFromCatalog[]> {
  const { data, error } = await supabase
    .from("assessment_questions")
    .select("id, text, factor, reverse_score")
    .eq("assessment_id", assessmentId)
    .order("sort_order");

  if (error) {
    console.error("[assessmentCatalogService] getAssessmentQuestionsFromCatalog:", error);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    text: row.text,
    factor: row.factor,
    reverse: row.reverse_score || undefined,
  }));
}

export async function getAssessmentScaleOptionsFromCatalog(
  supabase: SupabaseClient,
  assessmentId: string
): Promise<ScaleOptionFromCatalog[]> {
  const { data, error } = await supabase
    .from("assessment_scale_options")
    .select("value, label, emoji, description")
    .eq("assessment_id", assessmentId)
    .order("sort_order");

  if (error) {
    console.error("[assessmentCatalogService] getAssessmentScaleOptionsFromCatalog:", error);
    return [];
  }

  return (data ?? []).map((row) => ({
    value: row.value,
    label: row.label,
    emoji: row.emoji ?? undefined,
    description: row.description ?? undefined,
  }));
}
