/**
 * Similarity calculation utilities
 * 
 * Contains functions to calculate similarity scores between user and candidate
 * profiles across different dimensions (skills, services, courses, etc.)
 */

import type { CategoryConfig } from '../types';

/**
 * Calculates similarity within a category considering hierarchy
 * 
 * This function evaluates how similar two sets of items are within a category,
 * considering:
 * 1. Direct matches (items in common)
 * 2. Breadth bonus (candidate has more subcategories)
 * 3. Completeness bonus (candidate has all user's subcategories)
 * 
 * @param userItems - Items from the user's profile
 * @param candidateItems - Items from the candidate's profile
 * @param categoryConfig - Configuration for the category (subcategories and weights)
 * @returns Similarity score between 0 and 1
 * 
 * @example
 * const score = calculateCategorySimilarity(
 *   ['carro', 'motocicleta'],
 *   ['carro', 'motocicleta', 'caminhao'],
 *   { subcategories: [...], weights: {...} }
 * );
 */
export function calculateCategorySimilarity(
    userItems: string[],
    candidateItems: string[],
    categoryConfig: CategoryConfig
): number {
    // If user has no items in this category, no similarity
    if (!userItems || userItems.length === 0) {
        return 0;
    }

    // If candidate has no items, no similarity
    if (!candidateItems || candidateItems.length === 0) {
        return 0;
    }

    // 1. Calculate direct matches (items in common)
    const commonItems = userItems.filter(item => candidateItems.includes(item));
    const matchRatio = commonItems.length / userItems.length;

    // 2. Calculate breadth bonus (candidate has more subcategories)
    const userCoverage = userItems.length / categoryConfig.subcategories.length;
    const candidateCoverage = candidateItems.length / categoryConfig.subcategories.length;
    // Bonus is limited to prevent over-weighting
    const breadthBonus = Math.min(
        Math.max(candidateCoverage - userCoverage, 0) * categoryConfig.weights.breadthBonus,
        0.5
    );

    // 3. Calculate completeness bonus (candidate has all user's subcategories)
    const completenessBonus = commonItems.length === userItems.length
        ? categoryConfig.weights.completenessBonus
        : 0;

    // 4. Calculate final score
    const score = (matchRatio * categoryConfig.weights.baseMatch) + breadthBonus + completenessBonus;

    // Cap at 1.0
    return Math.min(score, 1.0);
}

/**
 * Groups items by category based on predefined category mappings
 * 
 * This is a helper function to organize flat arrays of skills/services
 * into category-based structures for similarity calculation.
 * 
 * @param items - Flat array of items (skills or services)
 * @param categoryMapping - Mapping of items to their categories
 * @returns Object with categories as keys and arrays of items as values
 * 
 * @example
 * const grouped = groupItemsByCategory(
 *   ['JavaScript', 'React', 'Node.js'],
 *   { 'JavaScript': 'frontend', 'React': 'frontend', 'Node.js': 'backend' }
 * );
 * // Returns: { frontend: ['JavaScript', 'React'], backend: ['Node.js'] }
 */
export function groupItemsByCategory(
    items: string[],
    categoryMapping: Record<string, string>
): Record<string, string[]> {
    const grouped: Record<string, string[]> = {};

    items.forEach(item => {
        const category = categoryMapping[item];
        if (category) {
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(item);
        }
    });

    return grouped;
}

/**
 * Calculates Jaccard similarity coefficient between two sets
 * 
 * Jaccard similarity = |A ∩ B| / |A ∪ B|
 * Returns a value between 0 (no overlap) and 1 (identical sets)
 * 
 * @param setA - First set of items
 * @param setB - Second set of items
 * @returns Similarity coefficient between 0 and 1
 * 
 * @example
 * const similarity = jaccardSimilarity(
 *   ['a', 'b', 'c'],
 *   ['b', 'c', 'd']
 * );
 * // Returns: 0.5 (2 common items / 4 unique items)
 */
export function jaccardSimilarity(setA: string[], setB: string[]): number {
    if (setA.length === 0 && setB.length === 0) {
        return 1.0;
    }

    if (setA.length === 0 || setB.length === 0) {
        return 0.0;
    }

    const setASet = new Set(setA);
    const setBSet = new Set(setB);

    // Intersection
    const intersection = new Set([...setASet].filter(x => setBSet.has(x)));

    // Union
    const union = new Set([...setASet, ...setBSet]);

    return intersection.size / union.size;
}

