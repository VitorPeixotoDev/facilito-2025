/**
 * Course level mapping and scoring
 * 
 * Maps courses to their educational levels and assigns points accordingly.
 * Levels: 1 (Técnico) to 5 (Doutorado)
 */

export enum CourseLevel {
    TECHNICAL = 1,      // Técnico
    UNDERGRADUATE = 2,  // Graduação
    SPECIALIZATION = 3, // Especialização
    MASTERS = 4,        // Mestrado
    DOCTORATE = 5,      // Doutorado
}

/**
 * Base points per course level
 */
export const COURSE_LEVEL_POINTS: Record<CourseLevel, number> = {
    [CourseLevel.TECHNICAL]: 5,      // Técnico: 5 pontos
    [CourseLevel.UNDERGRADUATE]: 10, // Graduação: 10 pontos
    [CourseLevel.SPECIALIZATION]: 15, // Especialização: 15 pontos
    [CourseLevel.MASTERS]: 18,       // Mestrado: 18 pontos
    [CourseLevel.DOCTORATE]: 20,     // Doutorado: 20 pontos
};

/**
 * Course level keywords for identification
 */
const LEVEL_KEYWORDS: Record<CourseLevel, string[]> = {
    [CourseLevel.TECHNICAL]: [
        'técnico', 'tecnico', 'curso técnico',
        'curso tecnico', 'tecnologia'
    ],
    [CourseLevel.UNDERGRADUATE]: [
        'graduação', 'graduacao', 'graduado', 'bacharelado',
        'licenciatura', 'superior', 'faculdade', 'universidade'
    ],
    [CourseLevel.SPECIALIZATION]: [
        'especialização', 'especializacao', 'especialista',
        'pós-graduação lato sensu', 'pos graduacao lato sensu'
    ],
    [CourseLevel.MASTERS]: [
        'mestrado', 'mestre', 'máster', 'master',
        'pós-graduação stricto sensu', 'pos graduacao stricto sensu'
    ],
    [CourseLevel.DOCTORATE]: [
        'doutorado', 'doutor', 'doutora', 'phd',
        'pós-doutorado', 'pos doutorado'
    ],
};

/**
 * Educational level categories from EDUCATION_COURSES
 */
const CATEGORY_LEVEL_MAPPING: Record<string, CourseLevel> = {
    'Alfabetização e Educação Básica': CourseLevel.TECHNICAL, // Lower level
    'Cursos Livres e Qualificação Profissional': CourseLevel.TECHNICAL,
    'Cursos Técnicos': CourseLevel.TECHNICAL,
    'Graduação': CourseLevel.UNDERGRADUATE,
    'Pós-Graduação': CourseLevel.SPECIALIZATION, // Default for Pós-Graduação
    'Mestrado': CourseLevel.MASTERS,
    'Doutorado': CourseLevel.DOCTORATE,
};

/**
 * Identifies the course level from course name
 * 
 * @param courseName - Name of the course
 * @param category - Optional category name (from EDUCATION_COURSES)
 * @returns Course level (default: TECHNICAL if not identified)
 */
export function identifyCourseLevel(courseName: string, category?: string): CourseLevel {
    const lowerName = courseName.toLowerCase();

    // First check category mapping (more reliable)
    if (category && CATEGORY_LEVEL_MAPPING[category]) {
        return CATEGORY_LEVEL_MAPPING[category];
    }

    // Then check keywords (most specific to least specific)
    for (let level = CourseLevel.DOCTORATE; level >= CourseLevel.TECHNICAL; level--) {
        const keywords = LEVEL_KEYWORDS[level];
        if (keywords.some(keyword => lowerName.includes(keyword))) {
            return level;
        }
    }

    // Default to technical level if not identified
    return CourseLevel.TECHNICAL;
}

/**
 * Gets points for a course based on its level
 * 
 * @param courseName - Name of the course
 * @param category - Optional category name
 * @returns Points for the course
 */
export function getCoursePoints(courseName: string, category?: string): number {
    const level = identifyCourseLevel(courseName, category);
    return COURSE_LEVEL_POINTS[level];
}

/**
 * Calculates total course score from array of course names
 * 
 * @param courses - Array of course names
 * @param categories - Optional map of course to category
 * @returns Total points from courses
 */
export function calculateCourseScore(
    courses: string[],
    categories?: Record<string, string>
): number {
    if (!courses || courses.length === 0) {
        return 0;
    }

    return courses.reduce((total, course) => {
        const category = categories?.[course];
        return total + getCoursePoints(course, category);
    }, 0);
}

