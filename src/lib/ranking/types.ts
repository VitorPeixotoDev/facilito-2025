/**
 * Types and interfaces for the candidate ranking algorithm
 * 
 * This module defines all the data structures used throughout the ranking system,
 * ensuring type safety and clear contracts between components.
 */

/**
 * Represents a user's location with latitude and longitude coordinates
 */
export interface UserLocation {
    latitude: number;
    longitude: number;
    description?: string;
}

/**
 * Represents a candidate/user profile data structure
 * All fields are optional to support gradual implementation
 */
export interface CandidateProfile {
    id: string;
    full_name: string | null;
    description: string | null;
    skills: string[];
    courses: string[];
    freelancer_services: string[];
    experience: string | null;
    academic_background: string | null;
    home_address: UserLocation | null;
    profile_analysis: string[] | null;
    profile_completed: boolean;
    // Future fields (optional for gradual implementation)
    experience_years?: number | null;
    profile_photo?: boolean | null;
    bio?: string | null;
    education?: Array<{ level: string; field: string }> | null;
}

/**
 * Configuration for category hierarchy in the ranking algorithm
 * Defines how skills and services are organized and weighted
 */
export interface CategoryConfig {
    name: string;
    subcategories: string[];
    weights: {
        baseMatch: number;        // Base weight for matching items
        breadthBonus: number;     // Bonus for having more subcategories
        completenessBonus: number; // Bonus for having all user's subcategories
    };
}

/**
 * Configuration for differential skills multipliers
 * These skills act as multipliers to boost a candidate's score
 */
export interface DifferentialMultipliers {
    [key: string]: number;
}

/**
 * Configuration for experience calculation
 */
export interface ExperienceConfig {
    maxYears: number;           // Maximum years for normalization
    weightPerYear: number;       // Weight per year of experience
    diminishingFactor: number;   // Diminishing factor for extra years
}

/**
 * Weights for each component of the similarity score
 */
export interface RankingWeights {
    serviceCategories: number;    // Services that both offer
    hardSkills: number;           // Technical skills in common
    experience: number;          // Comparative years of experience
    courses: number;             // Similar courses
    profileCompleteness: number;  // Profile completeness (incentive)
}

/**
 * Result of proximity check between two locations
 */
export interface ProximityResult {
    withinRadius: boolean;
    proximityFactor: number;     // 0-1 factor based on distance
    distance?: number;           // Distance in meters (optional)
}

/**
 * Breakdown of similarity score components
 * Shows how each component contributed to the final score
 */
export interface ScoreBreakdown {
    services: number;            // Service similarity score (0-100)
    hardSkills: number;         // Skills similarity score (0-100)
    experience: number;        // Experience similarity score (0-100)
    courses: number;            // Courses similarity score (0-100)
    profileCompleteness: number; // Profile completeness score (0-100)
    differentialMultiplier: number; // Multiplier from differential skills
    proximityFactor: number;     // Proximity factor (0-100)
}

/**
 * Highlight of similarity between user and candidate
 * Used to show what they have in common
 */
export interface SimilarityHighlight {
    type: 'services' | 'skills';
    category: string;
    count: number;
    items: string[];
}

/**
 * Complete ranking result for a single candidate
 */
export interface CandidateRankingResult {
    candidateId: string;
    candidateName: string | null;
    finalScore: number;         // Final score (0-100)
    rank: number;               // Position in ranking (1-based)
    breakdown: ScoreBreakdown;
    similarityHighlights: SimilarityHighlight[];
    isSelf?: boolean;           // True if this is the user's own profile
    // Display-only fields (for UI, does not affect ranking logic)
    coursesCount?: number;      // Number of courses (for display)
    skillsCount?: number;       // Number of skills (for display)
    profileAnalysis?: string[] | null; // Profile analysis strings (for display)
}

/**
 * Complete ranking result with user's position and other candidates
 */
export interface RankingResult {
    user: CandidateRankingResult;      // User's own ranking
    rankedCandidates: CandidateRankingResult[]; // Other candidates
    userInTop20: boolean;              // Whether user is in top 20
    stats: {
        totalCandidates: number;       // Total candidates analyzed
        relevantCandidates: number;    // Candidates with common skills within radius
        withinRadius: number;          // Candidates within 20km radius
        averageScore?: number;         // Average score of ranked candidates (optional)
    };
}

/**
 * Configuration for the ranking algorithm
 */
export interface RankingAlgorithmConfig {
    maxDistance: number;              // Maximum distance in meters (default: 20000 = 20km)
    maxCandidates: number;            // Maximum candidates to return (default: 25)
    weights: RankingWeights;         // Weights for score components
    categoryHierarchy: Record<string, CategoryConfig>; // Category definitions
    differentialMultipliers: DifferentialMultipliers; // Multipliers for differential skills
    experienceConfig: ExperienceConfig; // Experience calculation config
}

