/**
 * Ranking Algorithm - Main Export
 * 
 * This module exports all the public APIs for the ranking system.
 * Use these exports to integrate ranking functionality into your application.
 */

export * from './types';
export { CandidateRankingAlgorithm, DEFAULT_RANKING_CONFIG } from './algorithm';
export {
    fetchCandidatesFromDatabase,
    fetchUserProfile,
    fetchAndRankCandidates,
} from './service';

