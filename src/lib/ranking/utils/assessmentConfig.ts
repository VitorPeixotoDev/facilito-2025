/**
 * Configuration for assessment/test multipliers
 * 
 * Each assessment can have a different multiplier based on:
 * - Quality/robustness of the test
 * - Partner/institution providing the test
 * - Future implementations can add more assessments with different multipliers
 * 
 * @example
 * - Standard tests (FiveMind, HexaMind): 1.05 (default)
 * - Premium partner test: 1.12 (future implementation)
 */

export interface AssessmentMultiplierConfig {
    [assessmentId: string]: number;
}

/**
 * Default assessment multipliers
 * 
 * Base multiplier: 1.05 (5% increase)
 * Future premium assessments: 1.12 (12% increase)
 */
export const DEFAULT_ASSESSMENT_MULTIPLIERS: AssessmentMultiplierConfig = {
    'five-mind': 1.05,
    'hexa-mind': 1.05,
    // Future implementations can add:
    // 'premium-partner-test': 1.12,
};

/**
 * Gets the multiplier for a specific assessment
 * 
 * @param assessmentId - ID of the assessment
 * @returns Multiplier value (default: 1.0 if not found)
 */
export function getAssessmentMultiplier(assessmentId: string): number {
    return DEFAULT_ASSESSMENT_MULTIPLIERS[assessmentId] || 1.0;
}

/**
 * Gets the multiplier for the best assessment in a list
 * 
 * If a user has multiple assessments, we use the highest multiplier.
 * However, with the new logic, only one assessment should exist at a time.
 * 
 * @param assessmentIds - Array of assessment IDs
 * @returns Highest multiplier value (default: 1.0 if no assessments)
 */
export function getBestAssessmentMultiplier(assessmentIds: string[]): number {
    if (!assessmentIds || assessmentIds.length === 0) {
        return 1.0;
    }

    const multipliers = assessmentIds.map(id => getAssessmentMultiplier(id));
    return Math.max(...multipliers, 1.0);
}

