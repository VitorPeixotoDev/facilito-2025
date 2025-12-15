/**
 * Candidate Ranking Algorithm
 * 
 * This is the main algorithm implementation for ranking candidates
 * based on similarity to a user's profile. The algorithm considers:
 * 
 * - Service categories similarity
 * - Hard skills similarity
 * - Experience similarity
 * - Courses similarity
 * - Profile completeness
 * - Differential skills (multipliers)
 * - Geographic proximity (within 20km)
 * 
 * The algorithm is designed to work with missing parameters,
 * gracefully degrading when data is not available.
 */

import type {
    CandidateProfile,
    CandidateRankingResult,
    RankingAlgorithmConfig,
    RankingResult,
    SimilarityHighlight,
} from './types';
import { checkProximity } from './utils/distance';
import {
    calculateServicesSimilarity,
    calculateHardSkillsSimilarity,
    calculateExperienceSimilarity,
    calculateCoursesSimilarity,
    calculateProfileCompleteness,
    calculateDifferentialMultiplier,
} from './calculators';

/**
 * Default configuration for the ranking algorithm
 * 
 * These values can be adjusted based on business requirements
 * and A/B testing results.
 */
export const DEFAULT_RANKING_CONFIG: RankingAlgorithmConfig = {
    maxDistance: 20000, // 20km in meters
    maxCandidates: 25,
    weights: {
        serviceCategories: 0.40,    // Services that both offer
        hardSkills: 0.30,           // Technical skills in common
        experience: 0.15,           // Years of experience comparison
        courses: 0.10,              // Similar courses
        profileCompleteness: 0.05,   // Profile completeness incentive
    },
    categoryHierarchy: {}, // Will be populated when category mapping is implemented
    differentialMultipliers: {
        'certificacao_ouro': 1.4,      // Gold certification
        'certificacao_prata': 1.25,    // Silver certification
        'certificacao_bronze': 1.15,   // Bronze certification
        'teste_especializado': 1.3,    // Specialized test passed
        'instituicao_reconhecida': 1.2, // Recognized institution
        'profile_analysis': 1.1,       // Profile analysis in database
    },
    experienceConfig: {
        maxYears: 30,
        weightPerYear: 0.03,
        diminishingFactor: 0.9,
    },
};

/**
 * Main ranking algorithm class
 * 
 * This class orchestrates all the similarity calculations and
 * produces a ranked list of candidates.
 */
export class CandidateRankingAlgorithm {
    private config: RankingAlgorithmConfig;

    constructor(config: Partial<RankingAlgorithmConfig> = {}) {
        // Merge provided config with defaults
        this.config = {
            ...DEFAULT_RANKING_CONFIG,
            ...config,
            weights: {
                ...DEFAULT_RANKING_CONFIG.weights,
                ...(config.weights || {}),
            },
            differentialMultipliers: {
                ...DEFAULT_RANKING_CONFIG.differentialMultipliers,
                ...(config.differentialMultipliers || {}),
            },
            experienceConfig: {
                ...DEFAULT_RANKING_CONFIG.experienceConfig,
                ...(config.experienceConfig || {}),
            },
        };
    }

    /**
     * Generates similarity highlights between user and candidate
     * 
     * Creates a list of what they have in common to show to the user.
     * This helps explain why a candidate was ranked highly.
     * 
     * @param user - User's profile
     * @param candidate - Candidate's profile
     * @returns Array of similarity highlights
     */
    private generateSimilarityHighlights(
        user: CandidateProfile,
        candidate: CandidateProfile
    ): SimilarityHighlight[] {
        const highlights: SimilarityHighlight[] = [];

        // Check services in common
        const userServices = user.freelancer_services || [];
        const candidateServices = candidate.freelancer_services || [];
        const commonServices = userServices.filter(s => candidateServices.includes(s));

        if (commonServices.length > 0) {
            highlights.push({
                type: 'services',
                category: 'services',
                count: commonServices.length,
                items: commonServices.slice(0, 5), // Limit to 5 items
            });
        }

        // Check skills in common
        const userSkills = user.skills || [];
        const candidateSkills = candidate.skills || [];
        const commonSkills = userSkills.filter(s => candidateSkills.includes(s));

        if (commonSkills.length > 0) {
            highlights.push({
                type: 'skills',
                category: 'skills',
                count: commonSkills.length,
                items: commonSkills.slice(0, 5), // Limit to 5 items
            });
        }

        return highlights;
    }

    /**
     * Calculates the complete similarity score between user and candidate
     * 
     * This is the core function that combines all similarity components
     * into a final score (0-100).
     * 
     * @param user - User's profile
     * @param candidate - Candidate's profile
     * @returns Complete ranking result with score and breakdown, or null if outside radius
     */
    calculateSimilarityScore(
        user: CandidateProfile,
        candidate: CandidateProfile
    ): CandidateRankingResult | null {
        // Check geographic proximity first
        const proximity = checkProximity(
            user.home_address,
            candidate.home_address,
            this.config.maxDistance
        );

        // If outside radius, exclude from ranking
        if (!proximity.withinRadius) {
            return null;
        }

        // Calculate individual similarity components
        const serviceScore = calculateServicesSimilarity(
            user,
            candidate,
            this.config.categoryHierarchy
        );
        const skillsScore = calculateHardSkillsSimilarity(
            user,
            candidate,
            this.config.categoryHierarchy
        );
        const experienceScore = calculateExperienceSimilarity(
            user,
            candidate,
            this.config.experienceConfig
        );
        const coursesScore = calculateCoursesSimilarity(user, candidate);
        const profileScore = calculateProfileCompleteness(candidate);

        // Calculate combined score (before multipliers)
        let combinedScore =
            serviceScore * this.config.weights.serviceCategories +
            skillsScore * this.config.weights.hardSkills +
            experienceScore * this.config.weights.experience +
            coursesScore * this.config.weights.courses +
            profileScore * this.config.weights.profileCompleteness;

        // Apply differential skills multiplier
        const diffMultiplier = calculateDifferentialMultiplier(
            candidate,
            this.config.differentialMultipliers
        );
        combinedScore *= diffMultiplier;

        // Apply proximity factor
        combinedScore *= proximity.proximityFactor;

        // Normalize to 0-100
        const finalScore = Math.min(Math.max(combinedScore * 100, 0), 100);

        // Generate highlights
        const highlights = this.generateSimilarityHighlights(user, candidate);

        // Return complete result
        return {
            candidateId: candidate.id,
            candidateName: candidate.full_name,
            finalScore: parseFloat(finalScore.toFixed(2)),
            rank: 0, // Will be set during ranking
            breakdown: {
                services: parseFloat((serviceScore * 100).toFixed(2)),
                hardSkills: parseFloat((skillsScore * 100).toFixed(2)),
                experience: parseFloat((experienceScore * 100).toFixed(2)),
                courses: parseFloat((coursesScore * 100).toFixed(2)),
                profileCompleteness: parseFloat((profileScore * 100).toFixed(2)),
                differentialMultiplier: parseFloat(diffMultiplier.toFixed(2)),
                proximityFactor: parseFloat((proximity.proximityFactor * 100).toFixed(2)),
            },
            similarityHighlights: highlights,
        };
    }

    /**
     * Ranks candidates for a user
     * 
     * Takes a list of candidates and ranks them by similarity to the user.
     * Returns the user's own position plus the top N candidates.
     * 
     * @param user - User's profile
     * @param candidates - Array of candidate profiles to rank
     * @returns Complete ranking result with user position and top candidates
     */
    rankCandidatesForUser(
        user: CandidateProfile,
        candidates: CandidateProfile[]
    ): RankingResult {
        // Calculate scores for all candidates
        const scoredCandidates = candidates
            .filter(c => c.id !== user.id) // Exclude user from candidates list
            .map(candidate => this.calculateSimilarityScore(user, candidate))
            .filter((score): score is CandidateRankingResult => score !== null); // Remove nulls

        // Sort by score (highest first)
        scoredCandidates.sort((a, b) => b.finalScore - a.finalScore);

        // Assign ranks
        scoredCandidates.forEach((candidate, index) => {
            candidate.rank = index + 1;
        });

        // Find user's position in the ranking
        // User's score is always 100 (perfect match with themselves)
        const userRanking: CandidateRankingResult = {
            candidateId: user.id,
            candidateName: user.full_name || 'Você',
            finalScore: 100,
            rank: this.findUserRank(user, scoredCandidates),
            breakdown: {
                services: 100,
                hardSkills: 100,
                experience: 100,
                courses: 100,
                profileCompleteness: 100,
                differentialMultiplier: 1.0,
                proximityFactor: 100,
            },
            similarityHighlights: [],
            isSelf: true,
        };

        // Get top N candidates
        const topCandidates = scoredCandidates.slice(0, this.config.maxCandidates);

        // Calculate statistics
        const stats = {
            totalCandidates: candidates.length,
            withinRadius: scoredCandidates.length,
            averageScore:
                topCandidates.length > 0
                    ? parseFloat(
                        (
                            topCandidates.reduce((sum, c) => sum + c.finalScore, 0) /
                            topCandidates.length
                        ).toFixed(2)
                    )
                    : 0,
        };

        return {
            user: userRanking,
            rankedCandidates: topCandidates,
            stats,
        };
    }

    /**
     * Finds the user's rank in the sorted list of candidates
     * 
     * The user's rank is determined by how many candidates have a score
     * higher than or equal to a threshold (e.g., 80). This gives a realistic
     * position in the ranking.
     * 
     * @param user - User's profile
     * @param rankedCandidates - Sorted list of ranked candidates
     * @returns User's rank (1-based)
     */
    private findUserRank(
        user: CandidateProfile,
        rankedCandidates: CandidateRankingResult[]
    ): number {
        // If no candidates, user is rank 1
        if (rankedCandidates.length === 0) {
            return 1;
        }

        // Count how many candidates have a score >= 80
        // This represents "high similarity" threshold
        const highSimilarityThreshold = 80;
        const candidatesAboveThreshold = rankedCandidates.filter(
            c => c.finalScore >= highSimilarityThreshold
        ).length;

        // User's rank is 1 + number of candidates with high similarity
        // This gives a realistic position
        return candidatesAboveThreshold + 1;
    }
}

