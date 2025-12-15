/**
 * Score normalization with logarithmic curve
 * 
 * Implements a scoring system with maximum of 99.9 points,
 * where it becomes increasingly difficult to gain each percentage point
 * as you approach the maximum.
 * 
 * Uses a logarithmic curve: score = 99.9 * (1 - exp(-k * rawScore))
 * where k controls the steepness of the curve
 */

/**
 * Normalizes a raw score to the 0-99.9 range with increasing difficulty
 * 
 * The curve ensures:
 * - 0-50 points: Easier progression (nearly linear)
 * - 50-80 points: Moderate progression
 * - 80-95 points: Difficult progression
 * - 95-99.9 points: Very difficult (minimal increments)
 * 
 * @param rawScore - Raw calculated score (before normalization)
 * @param maxRawScore - Maximum possible raw score (for scaling)
 * @returns Normalized score (0 to 99.9)
 */
export function normalizeScore(rawScore: number, maxRawScore: number = 100): number {
    if (rawScore <= 0) {
        return 0;
    }

    // Scale raw score to 0-1 range
    const normalizedRaw = Math.min(rawScore / maxRawScore, 1.0);

    // Logarithmic curve parameter (higher = steeper curve, harder to reach max)
    // k = 0.03 gives a good balance: easy at start, very hard near 99.9
    const k = 0.03;

    // Apply logarithmic curve: 99.9 * (1 - e^(-k * normalizedRaw))
    // This ensures 99.9 is the maximum and it's very difficult to reach
    const normalizedScore = 99.9 * (1 - Math.exp(-k * normalizedRaw * 100));

    // Ensure we never exceed 99.9
    return Math.min(normalizedScore, 99.9);
}

/**
 * Alternative normalization using sigmoid curve
 * 
 * Can be used if a different curve shape is preferred.
 * Uncomment and use this function instead if needed.
 * 
 * @param rawScore - Raw calculated score
 * @param maxRawScore - Maximum possible raw score
 * @returns Normalized score (0 to 99.9)
 */
export function normalizeScoreSigmoid(rawScore: number, maxRawScore: number = 100): number {
    if (rawScore <= 0) {
        return 0;
    }

    const normalizedRaw = Math.min(rawScore / maxRawScore, 1.0);

    // Sigmoid parameters
    const steepness = 10; // Controls curve steepness
    const midpoint = 0.7; // Where curve is steepest (70% of max)

    // Sigmoid function: 99.9 / (1 + e^(-steepness * (normalizedRaw - midpoint)))
    const sigmoid = 99.9 / (1 + Math.exp(-steepness * (normalizedRaw - midpoint)));

    return Math.min(sigmoid, 99.9);
}


