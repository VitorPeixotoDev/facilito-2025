/**
 * Score calculators for ranking algorithm
 * 
 * This module contains all the individual score calculation functions
 * that are combined to produce the final ranking score.
 * Each calculator is independent and can be tested/modified separately.
 */

import type {
    CandidateProfile,
    CategoryConfig,
    DifferentialMultipliers,
    ExperienceConfig,
    RankingWeights,
} from '../types';
import { calculateCategorySimilarity, jaccardSimilarity } from '../utils/similarity';

/**
 * Calculates similarity score for services offered
 * 
 * Compares services that both user and candidate offer, grouped by category.
 * Gives higher scores to candidates who offer more services in the same
 * categories as the user, with bonuses for breadth and completeness.
 * 
 * @param user - User's profile data
 * @param candidate - Candidate's profile data
 * @param categoryHierarchy - Category configuration mapping
 * @returns Similarity score between 0 and 1
 */
export function calculateServicesSimilarity(
    user: CandidateProfile,
    candidate: CandidateProfile,
    categoryHierarchy: Record<string, CategoryConfig>
): number {
    const userServices = user.freelancer_services || [];
    const candidateServices = candidate.freelancer_services || [];

    // If user has no services, return 0
    if (userServices.length === 0) {
        return 0;
    }

    // For now, use simple Jaccard similarity
    // TODO: Implement category-based grouping when category mapping is available
    const similarity = jaccardSimilarity(userServices, candidateServices);

    return similarity;
}

/**
 * Calculates similarity score for hard skills
 * 
 * Compares technical skills between user and candidate.
 * Currently uses simple Jaccard similarity, but can be enhanced
 * with category-based matching when category hierarchy is fully defined.
 * 
 * @param user - User's profile data
 * @param candidate - Candidate's profile data
 * @param categoryHierarchy - Category configuration mapping (for future use)
 * @returns Similarity score between 0 and 1
 */
export function calculateHardSkillsSimilarity(
    user: CandidateProfile,
    candidate: CandidateProfile,
    categoryHierarchy: Record<string, CategoryConfig> = {}
): number {
    const userSkills = user.skills || [];
    const candidateSkills = candidate.skills || [];

    // If user has no skills, return 0
    if (userSkills.length === 0) {
        return 0;
    }

    // Calculate common skills ratio
    const commonSkills = userSkills.filter(skill => candidateSkills.includes(skill));
    const matchRatio = commonSkills.length / userSkills.length;

    return matchRatio;
}

/**
 * Calculates similarity score for experience
 * 
 * Compares years of experience between user and candidate.
 * Gives bonus if candidate has more experience than user.
 * 
 * @param user - User's profile data
 * @param candidate - Candidate's profile data
 * @param experienceConfig - Configuration for experience calculation
 * @returns Similarity score between 0 and 1
 */
export function calculateExperienceSimilarity(
    user: CandidateProfile,
    candidate: CandidateProfile,
    experienceConfig: ExperienceConfig
): number {
    // Extract years from experience text (future: use experience_years field)
    const userExp = extractExperienceYears(user.experience) || 0;
    const candidateExp = extractExperienceYears(candidate.experience) || 0;

    // Normalize experience (0-1)
    const normalizedUserExp = Math.min(userExp / experienceConfig.maxYears, 1);
    const normalizedCandidateExp = Math.min(candidateExp / experienceConfig.maxYears, 1);

    // Similarity: closer is better, but more experience is slightly better
    const expDiff = Math.abs(normalizedUserExp - normalizedCandidateExp);
    const similarity = 1 - expDiff;

    // Bonus if candidate has more experience
    const experienceBonus = normalizedCandidateExp > normalizedUserExp
        ? (normalizedCandidateExp - normalizedUserExp) * 0.2
        : 0;

    return Math.min(similarity + experienceBonus, 1);
}

/**
 * Extracts years of experience from experience text
 * 
 * Tries to parse years from the experience description.
 * This is a temporary solution until experience_years field is implemented.
 * 
 * @param experienceText - Experience description text
 * @returns Number of years, or 0 if cannot be determined
 */
function extractExperienceYears(experienceText: string | null): number {
    if (!experienceText) {
        return 0;
    }

    // Try to find patterns like "5 anos", "5 years", "5+ anos", etc.
    const yearPatterns = [
        /(\d+)\s*(?:ano|anos|year|years)/i,
        /(\d+)\+/,
        /(\d+)\s*yr/i,
    ];

    for (const pattern of yearPatterns) {
        const match = experienceText.match(pattern);
        if (match) {
            return parseInt(match[1], 10);
        }
    }

    return 0;
}

/**
 * Calculates similarity score for courses
 * 
 * Compares courses between user and candidate.
 * Currently uses simple overlap, but can be enhanced with
 * category-based matching when course categories are defined.
 * 
 * @param user - User's profile data
 * @param candidate - Candidate's profile data
 * @returns Similarity score between 0 and 1
 */
export function calculateCoursesSimilarity(
    user: CandidateProfile,
    candidate: CandidateProfile
): number {
    const userCourses = user.courses || [];
    const candidateCourses = candidate.courses || [];

    // If user has no courses, return 0
    if (userCourses.length === 0) {
        return 0;
    }

    // Use Jaccard similarity for course overlap
    return jaccardSimilarity(userCourses, candidateCourses);
}

/**
 * Calculates profile completeness score
 * 
 * Evaluates how complete a candidate's profile is.
 * More complete profiles get a higher score as an incentive.
 * 
 * @param candidate - Candidate's profile data
 * @returns Completeness score between 0 and 1
 */
export function calculateProfileCompleteness(candidate: CandidateProfile): number {
    const factors = {
        hasName: candidate.full_name ? 0.15 : 0,
        hasDescription: candidate.description && candidate.description.length > 50 ? 0.15 : 0,
        hasSkills: candidate.skills && candidate.skills.length > 0 ? 0.2 : 0,
        hasServices: candidate.freelancer_services && candidate.freelancer_services.length > 0 ? 0.2 : 0,
        hasExperience: candidate.experience ? 0.1 : 0,
        hasCourses: candidate.courses && candidate.courses.length > 0 ? 0.1 : 0,
        hasEducation: candidate.academic_background ? 0.1 : 0,
    };

    return Object.values(factors).reduce((sum, val) => sum + val, 0);
}

/**
 * Calculates differential skills multiplier
 * 
 * Applies multipliers based on differential skills (assessments, certifications, etc.).
 * Each additional skill has diminishing returns to prevent over-weighting.
 * 
 * @param candidate - Candidate's profile data
 * @param differentialMultipliers - Mapping of skill types to multiplier values
 * @returns Multiplier value (typically 1.0 to 2.5)
 */
export function calculateDifferentialMultiplier(
    candidate: CandidateProfile,
    differentialMultipliers: DifferentialMultipliers
): number {
    // Get differential skills from profile_analysis (assessments)
    const differentialSkills = candidate.profile_analysis || [];

    if (differentialSkills.length === 0) {
        return 1.0;
    }

    let multiplier = 1.0;

    // Sort skills by multiplier value (highest first)
    const sortedMultipliers = differentialSkills
        .map(skill => {
            // Try to match skill to a multiplier
            // For now, use a default multiplier for any assessment
            return differentialMultipliers['profile_analysis'] || 1.1;
        })
        .sort((a, b) => b - a);

    // Apply multipliers with diminishing returns
    sortedMultipliers.forEach((skillMultiplier, index) => {
        // Each additional skill has less impact (square root decay)
        const diminishingFactor = 1 / Math.sqrt(index + 1);
        const effectiveMultiplier = 1 + ((skillMultiplier - 1) * diminishingFactor);
        multiplier *= effectiveMultiplier;
    });

    // Cap maximum multiplier
    return Math.min(multiplier, 2.5);
}

