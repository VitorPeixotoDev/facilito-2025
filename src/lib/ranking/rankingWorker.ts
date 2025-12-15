/**
 * Web Worker for parallel ranking computation
 * 
 * This worker processes ranking calculations in a separate thread
 * to prevent blocking the main UI thread.
 */

import type { CandidateProfile, CandidateRankingResult } from './types';

// Import distance calculation (inline to avoid module issues in worker)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

function checkProximity(
    userLocation: { latitude: number; longitude: number } | null,
    candidateLocation: { latitude: number; longitude: number } | null,
    maxDistance: number
): boolean {
    if (!userLocation || !candidateLocation) {
        return true; // If no location, include by default
    }

    const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        candidateLocation.latitude,
        candidateLocation.longitude
    );

    return distance <= maxDistance;
}

/**
 * Checks if candidate has at least one skill in common with user
 */
function hasCommonSkills(user: CandidateProfile, candidate: CandidateProfile): boolean {
    const userSkills = user.skills || [];
    const candidateSkills = candidate.skills || [];

    if (userSkills.length === 0 || candidateSkills.length === 0) {
        return false;
    }

    return userSkills.some(skill => candidateSkills.includes(skill));
}

/**
 * Calculates score based on new priority: Courses > Skills > Differential
 */
function calculateRankingScore(
    user: CandidateProfile,
    candidate: CandidateProfile
): number {
    let score = 0;

    // 1. COURSES (highest weight - 0.60)
    const userCourses = user.courses || [];
    const candidateCourses = candidate.courses || [];

    if (userCourses.length > 0 && candidateCourses.length > 0) {
        const commonCourses = userCourses.filter(c => candidateCourses.includes(c));
        const coursesRatio = commonCourses.length / userCourses.length;
        score += coursesRatio * 0.60 * 100; // Weight: 60%
    }

    // 2. SKILLS (medium weight - 0.30) - used for grouping, but also counts
    const userSkills = user.skills || [];
    const candidateSkills = candidate.skills || [];

    if (userSkills.length > 0 && candidateSkills.length > 0) {
        const commonSkills = userSkills.filter(s => candidateSkills.includes(s));
        const skillsRatio = commonSkills.length / userSkills.length;
        score += skillsRatio * 0.30 * 100; // Weight: 30%
    }

    // 3. DIFFERENTIAL SKILLS (tiebreaker - 0.10)
    const candidateDiffSkills = candidate.profile_analysis || [];
    const diffMultiplier = candidateDiffSkills.length > 0
        ? 1 + (candidateDiffSkills.length * 0.05) // Small boost per differential skill
        : 1.0;

    score *= diffMultiplier;
    score += candidateDiffSkills.length * 1; // Small bonus per differential skill

    return Math.min(score, 100); // Cap at 100
}

// Worker message handler
self.onmessage = function (e: MessageEvent) {
    const { user, candidates, maxDistance } = e.data as {
        user: CandidateProfile;
        candidates: CandidateProfile[];
        maxDistance: number;
    };

    try {
        // Step 1: Filter by common skills AND proximity
        const relevantCandidates = candidates
            .filter(c => c.id !== user.id)
            .filter(c => hasCommonSkills(user, c))
            .filter(c => checkProximity(user.home_address, c.home_address, maxDistance));

        // Step 2: Calculate scores
        const scoredCandidates: CandidateRankingResult[] = relevantCandidates.map(candidate => ({
            candidateId: candidate.id,
            candidateName: candidate.full_name,
            finalScore: calculateRankingScore(user, candidate),
            rank: 0, // Will be set after sorting
            breakdown: {
                services: 0,
                hardSkills: 0,
                experience: 0,
                courses: 0,
                profileCompleteness: 0,
                differentialMultiplier: 1.0,
                proximityFactor: 100,
            },
            similarityHighlights: [],
        }));

        // Step 3: Sort by score (descending)
        scoredCandidates.sort((a, b) => {
            // Primary: Final score
            if (b.finalScore !== a.finalScore) {
                return b.finalScore - a.finalScore;
            }
            // Tiebreaker: Differential skills count
            const aDiffCount = candidates.find(c => c.id === a.candidateId)?.profile_analysis?.length || 0;
            const bDiffCount = candidates.find(c => c.id === b.candidateId)?.profile_analysis?.length || 0;
            return bDiffCount - aDiffCount;
        });

        // Step 4: Assign ranks
        scoredCandidates.forEach((candidate, index) => {
            candidate.rank = index + 1;
        });

        // Step 5: Calculate user's score and rank
        const userScore = calculateRankingScore(user, user);
        let userRank = 1;

        // Find user's position in ranking
        for (let i = 0; i < scoredCandidates.length; i++) {
            if (userScore >= scoredCandidates[i].finalScore) {
                userRank = i + 1;
                break;
            }
            userRank = i + 2;
        }

        // Step 6: Get top 20
        const top20 = scoredCandidates.slice(0, 20);

        // Step 7: Check if user is in top 20
        const userInTop20 = userRank <= 20;

        self.postMessage({
            success: true,
            result: {
                userRanking: {
                    candidateId: user.id,
                    candidateName: user.full_name || 'Você',
                    finalScore: userScore,
                    rank: userRank,
                    breakdown: {
                        services: 0,
                        hardSkills: 0,
                        experience: 0,
                        courses: 0,
                        profileCompleteness: 0,
                        differentialMultiplier: 1.0,
                        proximityFactor: 100,
                    },
                    similarityHighlights: [],
                    isSelf: true,
                },
                top20,
                userInTop20,
                stats: {
                    totalCandidates: candidates.length,
                    relevantCandidates: relevantCandidates.length,
                    withinRadius: relevantCandidates.length,
                },
            },
        });
    } catch (error) {
        self.postMessage({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};

