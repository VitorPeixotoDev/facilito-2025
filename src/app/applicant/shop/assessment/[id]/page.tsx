import AssessmentContent from "./AssessmentContent";

/**
 * Página de avaliação individual
 * 
 * Rota dinâmica que exibe a avaliação baseada no ID fornecido.
 * Suporta parâmetros de query para controlar a view (instructions, questionnaire, results).
 * 
 * @example
 * /applicant/shop/assessment/five-mind?view=instructions
 * /applicant/shop/assessment/five-mind?view=questionnaire
 * /applicant/shop/assessment/five-mind?view=results
 */
export default function AssessmentPage() {
    return <AssessmentContent />;
}
