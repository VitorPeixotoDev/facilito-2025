/**
 * Serviço de recomendações personalizadas (cursos e avaliações)
 *
 * Esta camada é puramente de domínio/negócio (sem acesso a React ou UI)
 * e pode ser reutilizada em diferentes telas.
 */

import { EDUCATION_COURSES } from '@/lib/constants/education_courses';
import { MAIN_EDUCATION_TAGS } from '@/lib/constants/education_tags';
import { MAIN_ASSESSMENT_TAGS, TAG_ASSESSMENTS_MAP } from '@/lib/constants/assessment_tags';
import { calculateRawScore } from '@/lib/ranking/utils/scoreCalculator';
import { normalizeScore } from '@/lib/ranking/utils/scoreNormalizer';
import { extractAssessmentIds } from '@/lib/assessment/profileAnalysisMapper';
import { getBestAssessmentMultiplier } from '@/lib/ranking/utils/assessmentConfig';

/**
 * Sinais mínimos usados para gerar recomendações para um usuário.
 * (Mantido enxuto para evitar acoplamento com tipos de UI ou Supabase.)
 */
export interface UserSignals {
    skills: string[];
    courses: string[];
    profileAnalysis: string[];
    completedAssessmentIds: string[];
}

/** Representa um curso sugerido para o usuário. */
export interface CourseRecommendation {
    theme: string; // ex.: "Administração e Negócios"
    courseName: string;
    /**
     * Nível educacional aproximado, inferido do nome do curso.
     * Usado apenas para explicações na UI.
     */
    levelLabel: 'Técnico / Livre' | 'Graduação' | 'Pós-graduação / MBA' | 'Mestrado / Doutorado';
    matchedSkills: string[]; // habilidades do usuário relacionadas por nome
    score: number; // score interno de relevância (para ordenação)
    /**
     * Quanto esse curso adicionaria aproximadamente ao score final
     * do usuário (em pontos, 0-99.9), se fosse concluído.
     */
    deltaScore: number;
}

/** Representa uma avaliação sugerida para o usuário. */
export interface AssessmentRecommendation {
    tag: string; // uma das MAIN_ASSESSMENT_TAGS
    assessmentId: string; // ex.: 'five-mind'
    assessmentName: string; // ex.: 'FiveMind'
    alreadyCompleted: boolean;
    /**
     * Quanto essa avaliação adicionaria aproximadamente ao score final
     * do usuário (em pontos, 0-99.9), se fosse concluída.
     * Se já concluída, geralmente será 0 (ou próximo disso).
     */
    deltaScore: number;
}

export interface UserRecommendations {
    coursesByTheme: Record<string, CourseRecommendation[]>;
    assessmentsByTag: Record<string, AssessmentRecommendation[]>;
}

/**
 * Mapeamento heurístico de palavras‑chave para cada tema de educação.
 *
 * OBS: não é exaustivo; serve como primeira versão fácil de manter.
 */
const COURSE_THEME_KEYWORDS: Record<string, string[]> = {
    'Administração e Negócios': [
        'administração',
        'administracao',
        'gestão',
        'gestao',
        'negócio',
        'negocio',
        'empreendedor',
        'financeira',
        'finanças',
        'financas',
        'recursos humanos',
        'logística',
        'logistica',
        'marketing',
        'comércio',
        'comercio',
    ],
    'Agricultura, Agropecuária e Agronegócio': ['agro', 'agropecuária', 'agropecuaria', 'agrícola', 'agricola', 'zootecnia', 'florestal'],
    'Artes, Design e Moda': ['arte', 'artes', 'design', 'moda', 'visuais', 'fotografia'],
    'Ciências Biológicas e Saúde': ['biologia', 'biomedicina', 'enfermagem', 'fisioterapia', 'nutrição', 'nutricao', 'saúde', 'saude', 'farmácia', 'farmacia'],
    'Ciências Exatas e Tecnologia da Informação': ['sistemas', 'computação', 'computacao', 'informática', 'informatica', 'software', 'programação', 'programacao', 'dados', 'analise de dados', 'ciência da computação', 'engenharia de software', 'redes de computadores'],
    'Ciências Humanas e Sociais': ['ciências humanas', 'ciencias humanas', 'sociologia', 'história', 'historia', 'filosofia', 'psicologia'],
    'Comunicação e Marketing': ['comunicação', 'comunicacao', 'jornalismo', 'publicidade', 'propaganda', 'mídias sociais', 'midias sociais', 'marketing'],
    'Direito e Ciências Jurídicas': ['direito', 'jurídic', 'juridic'],
    'Educação e Pedagogia': ['educação', 'educacao', 'pedagogia', 'licenciatura', 'docência', 'docencia'],
    'Engenharia e Arquitetura': ['engenharia', 'engenheiro', 'arquitetura', 'engenharia civil', 'engenharia de produção'],
    'Gastronomia e Nutrição': ['gastronomia', 'cozinha', 'nutrição', 'nutricao', 'alimentos'],
    'Idiomas e Linguística': ['inglês', 'ingles', 'espanhol', 'idiomas', 'língua', 'lingua', 'linguística', 'linguistica'],
    'Indústria e Produção': ['industrial', 'produção', 'producao', 'mecânica', 'mecanica', 'automação', 'automacao'],
    'Meio Ambiente e Sustentabilidade': ['meio ambiente', 'ambiental', 'sustentabilidade', 'florestal'],
    'Saúde e Bem-estar': ['saúde', 'saude', 'bem-estar', 'bem estar', 'psicologia'],
    'Serviços e Atendimento': ['atendimento', 'serviços', 'servicos', 'recepcionista', 'vendas', 'call center', 'telemarketing'],
    'Turismo, Hotelaria e Eventos': ['turismo', 'hotelaria', 'eventos', 'hospitalidade'],
};

/** Normaliza texto removendo acentos e deixando em minúsculas. */
function normalize(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
}

/**
 * Inferência aproximada de nível educacional a partir do nome do curso.
 * Mantém a mesma lógica conceitual do ranking, mas simplificada para explicações.
 */
function inferCourseLevelLabel(name: string): CourseRecommendation['levelLabel'] {
    const lower = name.toLowerCase();
    if (lower.includes('doutorado') || lower.includes('phd') || lower.includes('doutor')) {
        return 'Mestrado / Doutorado';
    }
    if (lower.includes('mestrado') || lower.includes('master')) {
        return 'Mestrado / Doutorado';
    }
    if (
        lower.includes('mba') ||
        lower.includes('pós-graduação') ||
        lower.includes('pos-graduacao') ||
        lower.includes('especializa')
    ) {
        return 'Pós-graduação / MBA';
    }
    if (
        lower.includes('graduação') ||
        lower.includes('graduacao') ||
        lower.includes('bacharel') ||
        lower.includes('licenciatura') ||
        lower.includes('superior')
    ) {
        return 'Graduação';
    }
    return 'Técnico / Livre';
}

/**
 * Atribui um tema principal (MAIN_EDUCATION_TAGS) a um curso, usando heurística de palavras‑chave.
 */
function inferCourseTheme(courseName: string): string | null {
    const norm = normalize(courseName);

    for (const theme of MAIN_EDUCATION_TAGS) {
        const keywords = COURSE_THEME_KEYWORDS[theme];
        if (!keywords) continue;
        if (keywords.some((kw) => norm.includes(normalize(kw)))) {
            return theme;
        }
    }

    return null;
}

interface InternalCourseCandidate {
    theme: string;
    courseName: string;
    levelLabel: CourseRecommendation['levelLabel'];
    matchedSkills: string[];
    score: number;
}

/**
 * Gera recomendações de cursos para o usuário atual.
 *
 * Importante:
 * - Retorna **no máximo N cursos no total** (e não N por tema).
 * - O agrupamento por tema é apenas para exibição na UI; a seleção é global.
 *
 * Heurísticas atuais:
 * - Nunca sugere cursos que o usuário já possui no perfil.
 * - Prioriza cursos de nível mais alto (Graduação, Pós, Mestrado/Doutorado).
 * - Dá bônus quando o nome do curso toca em alguma habilidade declarada.
 * - Dá bônus quando o tema do curso coincide com temas inferidos a partir
 *   dos cursos já cadastrados no perfil (prioriza a área de atuação atual).
 */
export function buildCourseRecommendations(
    signals: UserSignals,
    maxTotal: number = 5,
): Record<string, CourseRecommendation[]> {
    const userCoursesNorm = new Set(signals.courses.map((c) => normalize(c)));
    const userSkillsNorm = signals.skills.map((s) => ({ raw: s, norm: normalize(s) }));

    // Calcula o score atual do usuário (antes de adicionar novos cursos),
    // respeitando o mesmo cálculo usado no ranking (rawScore + multiplicador).
    const rawScoreBase = calculateRawScore(signals.courses, signals.skills, signals.profileAnalysis);
    const existingAssessmentIds = extractAssessmentIds(signals.profileAnalysis || null);
    const baseMultiplier = getBestAssessmentMultiplier(existingAssessmentIds);
    const maxRawScore = 200;
    const baseFinalScore = normalizeScore(rawScoreBase * baseMultiplier, maxRawScore);

    // Identifica os temas relacionados aos cursos que o usuário já possui
    const userCourseThemes = new Set<string>();
    for (const course of signals.courses) {
        const theme = inferCourseTheme(course);
        if (theme) {
            userCourseThemes.add(theme);
        }
    }

    const internalCandidates: InternalCourseCandidate[] = [];

    // Flatten de todos os cursos por categoria (chave do objeto original é mais "tipo" do curso)
    Object.entries(EDUCATION_COURSES).forEach(([categoryKey, courses]) => {
        for (const courseName of courses) {
            const normName = normalize(courseName);

            // Ignorar cursos que o usuário já tem cadastrados
            if (userCoursesNorm.has(normName)) continue;

            const theme = inferCourseTheme(courseName);
            if (!theme) continue; // se não encaixar em nenhum tema principal, ignoramos por enquanto

            const levelLabel = inferCourseLevelLabel(courseName);

            // Habilidades do usuário que aparecem no nome do curso
            const matchedSkills = userSkillsNorm
                .filter((skill) => skill.raw && normName.includes(skill.norm))
                .map((s) => s.raw);

            // Score simples de relevância
            let score = 0;
            // Prioriza níveis mais altos
            switch (levelLabel) {
                case 'Mestrado / Doutorado':
                    score += 40;
                    break;
                case 'Pós-graduação / MBA':
                    score += 30;
                    break;
                case 'Graduação':
                    score += 20;
                    break;
                case 'Técnico / Livre':
                    score += 10;
                    break;
            }

            // Bônus por habilidades relacionadas às skills declaradas
            if (matchedSkills.length > 0) {
                score += 15 + matchedSkills.length * 3;
            }

            // Bônus adicional se o tema do curso estiver alinhado aos temas
            // inferidos a partir dos cursos já cadastrados pelo usuário
            if (userCourseThemes.has(theme)) {
                score += 20;
            }

            const candidate: InternalCourseCandidate = {
                theme,
                courseName,
                levelLabel,
                matchedSkills,
                score,
            };

            internalCandidates.push(candidate);
        }
    });

    // Seleciona os top N cursos no geral, independente do tema
    const topCandidates = internalCandidates
        .filter((c) => c.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, maxTotal);

    // Reagrupa apenas os selecionados por tema para uso na UI
    const result: Record<string, CourseRecommendation[]> = {};
    for (const c of topCandidates) {
        if (!result[c.theme]) result[c.theme] = [];
        // Calcula o impacto em pontos desse curso específico
        const newRawScore = calculateRawScore(
            [...signals.courses, c.courseName],
            signals.skills,
            signals.profileAnalysis,
        );
        const newFinalScore = normalizeScore(newRawScore * baseMultiplier, maxRawScore);
        const deltaScore = newFinalScore - baseFinalScore;

        result[c.theme].push({
            theme: c.theme,
            courseName: c.courseName,
            levelLabel: c.levelLabel,
            matchedSkills: c.matchedSkills,
            score: c.score,
            deltaScore,
        });
    }

    return result;
}

/**
 * Gera recomendações de avaliações por tema, considerando o que o usuário já concluiu.
 *
 * Regras atuais:
 * - Usa MAIN_ASSESSMENT_TAGS e TAG_ASSESSMENTS_MAP como fonte de verdade.
 * - Para cada tag, recomenda os assessments mapeados (FiveMind/HexaMind em Fit Cultural, etc.).
 * - Marca se o usuário já concluiu aquele assessment.
 */
export function buildAssessmentRecommendations(signals: UserSignals): Record<string, AssessmentRecommendation[]> {
    const completedSet = new Set(signals.completedAssessmentIds);

    const byTag: Record<string, AssessmentRecommendation[]> = {};

    // Score base do usuário (sem considerar novas avaliações)
    const rawScoreBase = calculateRawScore(signals.courses, signals.skills, signals.profileAnalysis);
    const existingIds = extractAssessmentIds(signals.profileAnalysis || null);
    const baseMultiplier = getBestAssessmentMultiplier(existingIds);
    const maxRawScore = 200;
    const baseFinalScore = normalizeScore(rawScoreBase * baseMultiplier, maxRawScore);

    for (const tag of MAIN_ASSESSMENT_TAGS) {
        const assessmentIds = TAG_ASSESSMENTS_MAP[tag] ?? [];
        if (!assessmentIds.length) {
            // Não criar entrada se não houver avaliações associadas ainda
            continue;
        }

        const recs: AssessmentRecommendation[] = assessmentIds.map((id) => {
            const alreadyCompleted = completedSet.has(id);

            // Se o usuário já tem esse assessment, adicionar novamente não muda o multiplicador
            const newIds = alreadyCompleted || existingIds.includes(id) ? existingIds : [...existingIds, id];
            const newMultiplier = getBestAssessmentMultiplier(newIds);
            const newFinalScore = normalizeScore(rawScoreBase * newMultiplier, maxRawScore);
            const deltaScore = newFinalScore - baseFinalScore;

            return {
                tag,
                assessmentId: id,
                assessmentName: id === 'five-mind' ? 'FiveMind' : id === 'hexa-mind' ? 'HexaMind' : id,
                alreadyCompleted,
                deltaScore,
            };
        });

        if (recs.length) {
            byTag[tag] = recs;
        }
    }

    return byTag;
}

/**
 * Função utilitária para construir todas as recomendações de uma vez.
 */
export function buildUserRecommendations(signals: UserSignals, maxCoursesTotal = 5): UserRecommendations {
    return {
        coursesByTheme: buildCourseRecommendations(signals, maxCoursesTotal),
        assessmentsByTag: buildAssessmentRecommendations(signals),
    };
}
