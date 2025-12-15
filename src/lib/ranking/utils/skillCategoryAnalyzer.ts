/**
 * Skill category analysis and weighting
 * 
 * Analyzes skills to identify main professional categories and applies
 * decreasing weights to subcategories.
 * 
 * Main categories (full weight): Vendedor, Jornalista, Marketing, etc.
 * Subcategories (decreasing weight): Sub-habilidades derivadas
 */

import { SKILLS_CATEGORIES } from '@/lib/constants/skills_categories';

/**
 * Main professional categories that should receive full weight
 * These are broad professional areas, not specific subcategories
 */
const MAIN_PROFESSIONAL_CATEGORIES = new Set([
    // Sales
    'vendedor', 'vendas', 'venda',
    // Journalism
    'jornalista', 'jornalismo',
    // Marketing
    'marketing', 'mídia', 'publicidade', 'propaganda',
    // Administration
    'administrador', 'administração', 'gestão', 'gerente',
    // Programming/Tech
    'programador', 'desenvolvedor', 'desenvolvimento', 'engenheiro de software',
    // Design
    'designer', 'design',
    // Education
    'professor', 'educador', 'pedagogo',
    // Health
    'enfermeiro', 'médico', 'fisioterapeuta',
    // Law
    'advogado', 'jurídico',
    // Finance
    'contador', 'contabilidade', 'financeiro',
    // HR
    'recursos humanos', 'rh', 'recrutador',
]);

/**
 * Checks if a skill name represents a main professional category
 * 
 * @param skillName - Name of the skill
 * @returns True if it's a main category
 */
function isMainCategory(skillName: string): boolean {
    const lowerSkill = skillName.toLowerCase();
    return Array.from(MAIN_PROFESSIONAL_CATEGORIES).some(category =>
        lowerSkill.includes(category) || category.includes(lowerSkill)
    );
}

/**
 * Groups skills by their category from SKILLS_CATEGORIES
 * 
 * @param skills - Array of skill names
 * @returns Map of category name to array of skills
 */
function groupSkillsByCategory(skills: string[]): Record<string, string[]> {
    const grouped: Record<string, string[]> = {};

    skills.forEach(skill => {
        // Find which category this skill belongs to
        // NOTE:
        // We avoid using Object.entries directly because its inferred type for
        // the value can become a union of many readonly arrays, which may cause
        // TypeScript to infer `never` as the element type for `includes`.
        // By iterating over Object.keys and indexing, we preserve `string[]`.
        for (const category of Object.keys(SKILLS_CATEGORIES)) {
            const categorySkills = SKILLS_CATEGORIES[category as keyof typeof SKILLS_CATEGORIES] as unknown as string[];
            if (categorySkills && categorySkills.includes(skill)) {
                if (!grouped[category]) {
                    grouped[category] = [];
                }
                grouped[category].push(skill);
                return;
            }
        }

        // If not found in any category, put in "Other"
        if (!grouped['Outros']) {
            grouped['Outros'] = [];
        }
        grouped['Outros'].push(skill);
    });

    return grouped;
}

/**
 * Identifies the main professional category from skills
 * 
 * @param skills - Array of skill names
 * @returns Main category name or null
 */
export function identifyMainCategory(skills: string[]): string | null {
    if (!skills || skills.length === 0) {
        return null;
    }

    // First, check for main category keywords in skill names
    for (const skill of skills) {
        if (isMainCategory(skill)) {
            return skill;
        }
    }

    // If no main category found, use the category with most skills
    const grouped = groupSkillsByCategory(skills);
    let maxCount = 0;
    let mainCategory: string | null = null;

    for (const [category, categorySkills] of Object.entries(grouped)) {
        if (categorySkills.length > maxCount) {
            maxCount = categorySkills.length;
            mainCategory = category;
        }
    }

    return mainCategory;
}

/**
 * Calculates skill score with decreasing weights for subcategories
 * 
 * Main category skills: Full weight (1.0)
 * Subcategory skills: Decreasing weight (0.8, 0.6, 0.4, ...)
 * 
 * @param skills - Array of skill names
 * @returns Total skill score
 */
export function calculateSkillScore(skills: string[]): number {
    if (!skills || skills.length === 0) {
        return 0;
    }

    const grouped = groupSkillsByCategory(skills);
    let totalScore = 0;

    // Process each category
    for (const [category, categorySkills] of Object.entries(grouped)) {
        // Check if this category is a main professional category
        const isMain = categorySkills.some(skill => isMainCategory(skill));

        if (isMain) {
            // Main category: first skill gets full weight, others get decreasing
            categorySkills.forEach((skill, index) => {
                if (index === 0) {
                    totalScore += 10; // Full weight for main category
                } else {
                    // Decreasing weight: 0.8, 0.6, 0.4, 0.2, ...
                    const weight = Math.max(0.2, 1.0 - (index * 0.2));
                    totalScore += 10 * weight;
                }
            });
        } else {
            // Subcategory: all skills get decreasing weight
            categorySkills.forEach((skill, index) => {
                // Decreasing weight based on position
                const weight = Math.max(0.3, 1.0 - (index * 0.15));
                totalScore += 10 * weight;
            });
        }
    }

    return totalScore;
}

