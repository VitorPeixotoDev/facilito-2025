/**
 * Score calculation utilities
 * 
 * Centralized score calculation logic that can be used both
 * in main thread and in Web Workers
 */

import { calculateSkillScore } from './skillCategoryAnalyzer';
import { calculateCourseScore } from './courseLevelMapper';
import { normalizeScore } from './scoreNormalizer';
import { getLatestAssessmentId, extractAssessmentIds } from '@/lib/assessment/profileAnalysisMapper';
import { getBestAssessmentMultiplier } from './assessmentConfig';

/**
 * Calculates the raw score before normalization
 * 
 * @param courses - Array of course names
 * @param skills - Array of skill names
 * @param profileAnalysis - Array of profile analysis strings (with prefixes)
 * @returns Raw score (before normalization and multiplier)
 */
export function calculateRawScore(
    courses: string[],
    skills: string[],
    profileAnalysis: string[] | null
): number {
    // Calculate course score with level-based weighting
    const courseScore = calculateCourseScore(courses);

    // Calculate skill score with decreasing weights for subcategories
    const skillScore = calculateSkillScore(skills);

    // Total raw score (skills are more valued than courses)
    // Skills contribute more to the base score
    return courseScore + skillScore;
}

/**
 * Gets assessment multiplier from profile analysis
 * 
 * @param profileAnalysis - Array of profile analysis strings
 * @returns Multiplier value (default: 1.0)
 */
export function getAssessmentMultiplierFromProfile(profileAnalysis: string[] | null): number {
    if (!profileAnalysis || profileAnalysis.length === 0) {
        return 1.0;
    }

    const assessmentIds = extractAssessmentIds(profileAnalysis);
    return getBestAssessmentMultiplier(assessmentIds);
}

/**
 * Calculates final normalized score for a candidate
 * 
 * This is the main scoring function that:
 * 1. Calculates raw score from courses and skills
 * 2. Applies assessment multiplier (fixed, not based on quantity)
 * 3. Normalizes to 0-99.9 with logarithmic curve
 * 
 * @param courses - Array of course names
 * @param skills - Array of skill names
 * @param profileAnalysis - Array of profile analysis strings
 * @returns Final normalized score (0 to 99.9)
 */
export function calculateFinalScore(
    courses: string[],
    skills: string[],
    profileAnalysis: string[] | null
): number {
    // Calculate raw score
    const rawScore = calculateRawScore(courses, skills, profileAnalysis);

    // Apply assessment multiplier (fixed, e.g., 1.05)
    const assessmentMultiplier = getAssessmentMultiplierFromProfile(profileAnalysis);
    const multipliedScore = rawScore * assessmentMultiplier;

    // Normalize to 0-99.9 with logarithmic curve
    // Estimate max raw score (assume reasonable max: 200 points)
    const maxRawScore = 200;
    const normalizedScore = normalizeScore(multipliedScore, maxRawScore);

    return normalizedScore;
}

/**
 * Worker-friendly version of score calculation
 * 
 * This version uses inline implementations to avoid imports
 * in the Web Worker context. It's a string representation that
 * will be inserted into the worker code.
 */
export const WORKER_SCORE_CALCULATION_CODE = `
    /**
     * Identifies course level and returns points
     * Level 1 (Técnico): 5pts, Level 2 (Graduação): 10pts,
     * Level 3 (Especialização): 15pts, Level 4 (Mestrado): 18pts,
     * Level 5 (Doutorado): 20pts
     */
    function getCoursePoints(courseName) {
        const lower = courseName.toLowerCase();
        if (lower.includes('doutorado') || lower.includes('doutor') || lower.includes('phd')) return 20;
        if (lower.includes('mestrado') || lower.includes('mestre') || lower.includes('master')) return 18;
        if (lower.includes('especialização') || lower.includes('especializacao') || lower.includes('pós-graduação lato sensu')) return 15;
        if (lower.includes('graduação') || lower.includes('graduacao') || lower.includes('bacharelado') || lower.includes('licenciatura') || lower.includes('superior')) return 10;
        return 5; // Default: técnico
    }

    /**
     * Calculates course score based on levels
     */
    function calculateCourseScore(courses) {
        if (!courses || courses.length === 0) return 0;
        return courses.reduce((total, course) => total + getCoursePoints(course), 0);
    }

    /**
     * Calculates skill score with decreasing weights
     * Main categories get full weight, subcategories get decreasing weight
     */
    function calculateSkillScore(skills) {
        if (!skills || skills.length === 0) return 0;
        
        // Simplified: first skill gets 10pts, subsequent skills get decreasing weight
        // In production, this should analyze categories more carefully
        let total = 0;
        skills.forEach((skill, index) => {
            if (index === 0) {
                total += 10; // First/main skill: full weight
            } else {
                // Decreasing weight: 0.8, 0.6, 0.4, ...
                const weight = Math.max(0.3, 1.0 - (index * 0.15));
                total += 10 * weight;
            }
        });
        return total;
    }

    /**
     * Extracts assessment ID from profile analysis
     */
    function extractAssessmentId(profileAnalysis) {
        if (!profileAnalysis || profileAnalysis.length === 0) return null;
        for (const analysis of profileAnalysis) {
            if (analysis.startsWith('five_mind_result -> ')) return 'five-mind';
            if (analysis.startsWith('hexa_mind_result -> ')) return 'hexa-mind';
        }
        return null;
    }

    /**
     * Gets assessment multiplier (fixed: 1.05 for now)
     * Future: can be 1.12 for premium partner tests
     */
    function getAssessmentMultiplier(assessmentId) {
        if (!assessmentId) return 1.0;
        // Default: 1.05 (5% increase)
        // Future: can map different assessments to different multipliers
        const multipliers = {
            'five-mind': 1.05,
            'hexa-mind': 1.05,
        };
        return multipliers[assessmentId] || 1.0;
    }

    /**
     * Normalizes score to 0-99.9 with logarithmic curve
     */
    function normalizeScore(rawScore, maxRawScore) {
        if (rawScore <= 0) return 0;
        const normalizedRaw = Math.min(rawScore / maxRawScore, 1.0);
        const k = 0.03; // Curve parameter
        const normalizedScore = 99.9 * (1 - Math.exp(-k * normalizedRaw * 100));
        return Math.min(normalizedScore, 99.9);
    }

    /**
     * Calculates final score for a candidate
     */
    function calculateAbsoluteScore(profile) {
        const courses = profile.courses || [];
        const skills = profile.skills || [];
        const profileAnalysis = profile.profile_analysis || [];
        
        // Calculate raw scores
        const courseScore = calculateCourseScore(courses);
        const skillScore = calculateSkillScore(skills);
        const rawScore = courseScore + skillScore;
        
        // Apply assessment multiplier (fixed, not based on quantity)
        const assessmentId = extractAssessmentId(profileAnalysis);
        const assessmentMultiplier = getAssessmentMultiplier(assessmentId);
        const multipliedScore = rawScore * assessmentMultiplier;
        
        // Normalize to 0-99.9
        const maxRawScore = 200; // Estimated maximum
        const finalScore = normalizeScore(multipliedScore, maxRawScore);
        
        return finalScore;
    }
`;


