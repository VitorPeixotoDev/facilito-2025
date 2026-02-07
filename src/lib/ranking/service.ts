/**
 * Ranking Service
 * 
 * Service layer for fetching candidates from the database
 * and running the ranking algorithm with parallel processing.
 */

import { createClient } from '@/utils/supabase/client';
import { getCourseDisplayName } from '@/lib/constants/education_courses';
import type { CandidateProfile, RankingResult } from './types';

/**
 * Fetches candidates from the database within a reasonable range
 * 
 * Currently fetches all candidates (with a limit) and filters by distance
 * in the application layer. In the future, this can be optimized with
 * PostGIS or similar spatial extensions.
 * 
 * @param userId - ID of the user to rank against
 * @param limit - Maximum number of candidates to fetch (default: 200)
 * @returns Array of candidate profiles
 */
export async function fetchCandidatesFromDatabase(
    userId: string,
    limit: number = 200
): Promise<CandidateProfile[]> {
    const supabase = createClient();

    try {
        // Fetch candidates (excluding the user)
        const { data, error } = await supabase
            .from('users')
            .select(`
                id,
                full_name,
                description,
                skills,
                courses,
                freelancer_services,
                experience,
                academic_background,
                home_address,
                profile_analysis,
                profile_completed,
                graduations
            `)
            .neq('id', userId)
            .limit(limit);

        if (error) {
            console.error('Error fetching candidates:', error);
            return [];
        }

        // Transform database rows to CandidateProfile format (courses stored as id/custom -> resolve to name)
        return ((data || []) as any[]).map((row: any) => ({
            id: row.id,
            full_name: row.full_name,
            description: row.description,
            skills: row.skills || [],
            courses: (row.courses || []).map((c: string) => getCourseDisplayName(c)),
            freelancer_services: row.freelancer_services || [],
            experience: row.experience,
            academic_background: row.academic_background,
            home_address: row.home_address
                ? {
                    latitude: typeof (row.home_address as any).latitude === 'string'
                        ? parseFloat((row.home_address as any).latitude)
                        : (row.home_address as any).latitude,
                    longitude: typeof (row.home_address as any).longitude === 'string'
                        ? parseFloat((row.home_address as any).longitude)
                        : (row.home_address as any).longitude,
                    description: (row.home_address as any).description,
                }
                : null,
            profile_analysis: row.profile_analysis || [],
            profile_completed: row.profile_completed || false,
            graduations: row.graduations || [],
        }));
    } catch (error) {
        console.error('Error in fetchCandidatesFromDatabase:', error);
        return [];
    }
}

/**
 * Fetches user profile from database
 * 
 * @param userId - ID of the user
 * @returns User profile or null if not found
 */
export async function fetchUserProfile(userId: string): Promise<CandidateProfile | null> {
    const supabase = createClient();

    try {
        const { data, error } = await supabase
            .from('users')
            .select(`
                id,
                full_name,
                description,
                skills,
                courses,
                freelancer_services,
                experience,
                academic_background,
                home_address,
                profile_analysis,
                profile_completed,
                graduations
            `)
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error fetching user profile:', error);
            return null;
        }

        const profile = data as any;
        return {
            id: profile.id,
            full_name: profile.full_name,
            description: profile.description,
            skills: profile.skills || [],
            courses: (profile.courses || []).map((c: string) => getCourseDisplayName(c)),
            freelancer_services: profile.freelancer_services || [],
            experience: profile.experience,
            academic_background: profile.academic_background,
            home_address: profile.home_address
                ? {
                    latitude: typeof (profile.home_address as any).latitude === 'string'
                        ? parseFloat((profile.home_address as any).latitude)
                        : (profile.home_address as any).latitude,
                    longitude: typeof (profile.home_address as any).longitude === 'string'
                        ? parseFloat((profile.home_address as any).longitude)
                        : (profile.home_address as any).longitude,
                    description: (profile.home_address as any).description,
                }
                : null,
            profile_analysis: profile.profile_analysis || [],
            profile_completed: profile.profile_completed || false,
            graduations: profile.graduations || [],
        };
    } catch (error) {
        console.error('Error in fetchUserProfile:', error);
        return null;
    }
}

/**
 * Calculates distance between two geographic coordinates (Haversine formula)
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Runs ranking computation in a Web Worker for parallel processing
 * 
 * @param user - User's profile
 * @param candidates - Array of candidate profiles
 * @param maxDistance - Maximum distance in meters (default: 20000 = 20km)
 * @returns Promise with ranking result
 */
function runRankingInWorker(
    user: CandidateProfile,
    candidates: CandidateProfile[],
    maxDistance: number = 20000
): Promise<RankingResult & { userInTop20: boolean }> {
    return new Promise((resolve, reject) => {
        // Create worker from blob URL
        const workerCode = `
            function calculateDistance(lat1, lon1, lat2, lon2) {
                const R = 6371e3;
                const φ1 = lat1 * Math.PI / 180;
                const φ2 = lat2 * Math.PI / 180;
                const Δφ = (lat2 - lat1) * Math.PI / 180;
                const Δλ = (lon2 - lon1) * Math.PI / 180;
                const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                          Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                return R * c;
            }
            
            function checkProximity(userLocation, candidateLocation, maxDistance) {
                // If user has no location, include all candidates
                if (!userLocation) return true;
                // If candidate has no location, exclude them (user has location requirement)
                if (!candidateLocation) return false;
                const distance = calculateDistance(
                    userLocation.latitude, userLocation.longitude,
                    candidateLocation.latitude, candidateLocation.longitude
                );
                return distance <= maxDistance;
            }
            
            function hasCommonSkills(user, candidate) {
                const userSkills = user.skills || [];
                const candidateSkills = candidate.skills || [];
                if (userSkills.length === 0 || candidateSkills.length === 0) return false;
                return userSkills.some(skill => candidateSkills.includes(skill));
            }
            
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
                if (lower.includes('especialização') || lower.includes('especializacao') || lower.includes('pós-graduação lato sensu') || lower.includes('pos graduacao lato sensu')) return 15;
                if (lower.includes('graduação') || lower.includes('graduacao') || lower.includes('bacharelado') || lower.includes('licenciatura') || lower.includes('superior') || lower.includes('faculdade') || lower.includes('universidade')) return 10;
                return 5; // Default: técnico/cursos livres
            }

            /**
             * Calculates course score based on educational levels
             */
            function calculateCourseScore(courses) {
                if (!courses || courses.length === 0) return 0;
                return courses.reduce((total, course) => total + getCoursePoints(course), 0);
            }

            /**
             * Calculates skill score with decreasing weights for subcategories
             * Main professional categories get full weight, subcategories get decreasing weight
             */
            function calculateSkillScore(skills) {
                if (!skills || skills.length === 0) return 0;
                
                // First skill (typically main category) gets full weight
                // Subsequent skills get decreasing weight: 0.8, 0.6, 0.4, ...
                let total = 0;
                skills.forEach((skill, index) => {
                    if (index === 0) {
                        total += 10; // First/main skill: full weight (10 points)
                    } else {
                        // Decreasing weight: 0.8, 0.6, 0.4, 0.2, ... (minimum 0.3)
                        const weight = Math.max(0.3, 1.0 - (index * 0.15));
                        total += 10 * weight;
                    }
                });
                return total;
            }

            /**
             * Extracts assessment ID from profile analysis (uses prefixes)
             */
            function extractAssessmentId(profileAnalysis) {
                if (!profileAnalysis || profileAnalysis.length === 0) return null;
                for (let i = 0; i < profileAnalysis.length; i++) {
                    const analysis = profileAnalysis[i];
                    if (analysis.startsWith('five_mind_result -> ')) return 'five-mind';
                    if (analysis.startsWith('hexa_mind_result -> ')) return 'hexa-mind';
                }
                return null;
            }

            /**
             * Gets assessment multiplier (fixed: 1.05 default, configurable for future premium tests)
             * 
             * FUTURE IMPLEMENTATION: Can map different assessments to different multipliers
             * Example: Premium partner test: 1.12 (12% increase)
             */
            function getAssessmentMultiplier(assessmentId) {
                if (!assessmentId) return 1.0;
                
                // Default multipliers: 1.05 (5% increase) for standard tests
                const multipliers = {
                    'five-mind': 1.05,
                    'hexa-mind': 1.05,
                    // Future: 'premium-partner-test': 1.12,
                };
                
                return multipliers[assessmentId] || 1.0;
            }

            /**
             * Normalizes score to 0-99.9 with logarithmic curve
             * 
             * Uses exponential decay: score = 99.9 * (1 - exp(-k * normalizedRaw))
             * - 0-50 points: Easier progression (nearly linear)
             * - 50-80 points: Moderate progression
             * - 80-95 points: Difficult progression
             * - 95-99.9 points: Very difficult (minimal increments)
             */
            function normalizeScore(rawScore, maxRawScore) {
                if (rawScore <= 0) return 0;
                const normalizedRaw = Math.min(rawScore / maxRawScore, 1.0);
                const k = 0.03; // Curve parameter (higher = steeper, harder to reach max)
                const normalizedScore = 99.9 * (1 - Math.exp(-k * normalizedRaw * 100));
                return Math.min(normalizedScore, 99.9);
            }

            /**
             * Calculates an absolute score for a candidate based on their own profile
             * 
             * NEW LOGIC:
             * 1. Skills are more valued than courses (no limit on skills)
             * 2. Skills use decreasing weights (first/main category gets full weight)
             * 3. Courses use level-based weighting (técnico to doutorado)
             * 4. Assessment multiplier is FIXED (1.05), not based on quantity
             * 5. Final score normalized to 0-99.9 with logarithmic curve
             */
            function calculateAbsoluteScore(profile) {
                const courses = profile.courses || [];
                const skills = profile.skills || [];
                const profileAnalysis = profile.profile_analysis || [];
                
                // Calculate raw scores
                const courseScore = calculateCourseScore(courses);
                const skillScore = calculateSkillScore(skills); // Skills more valued, no limit
                const rawScore = courseScore + skillScore;
                
                // Apply assessment multiplier (FIXED, not based on quantity)
                // Each assessment gives the same multiplier regardless of how many analyses it has
                const assessmentId = extractAssessmentId(profileAnalysis);
                const assessmentMultiplier = getAssessmentMultiplier(assessmentId);
                const multipliedScore = rawScore * assessmentMultiplier;
                
                // Normalize to 0-99.9 with logarithmic curve (increasingly difficult)
                const maxRawScore = 200; // Estimated maximum raw score
                const finalScore = normalizeScore(multipliedScore, maxRawScore);
                
                return finalScore;
            }
            
            /**
             * Calculates similarity score between user and candidate
             * 
             * NOTE: This function is kept for backward compatibility but uses
             * the same absolute score calculation for consistency.
             * The ranking system now uses calculateAbsoluteScore for all scoring.
             */
            function calculateSimilarityScore(user, candidate) {
                // Use the same absolute score calculation for consistency
                return calculateAbsoluteScore(candidate);
            }
            
            self.onmessage = function(e) {
                const { user, candidates, maxDistance } = e.data;
                try {
                    // Step 1: Filter other candidates by common skills and proximity
                    const otherCandidates = candidates.filter(c => c.id !== user.id);
                    const withCommonSkills = otherCandidates.filter(c => hasCommonSkills(user, c));
                    const relevantCandidates = withCommonSkills.filter(c => checkProximity(user.home_address, c.home_address, maxDistance));
                    
                    // Step 2: Calculate absolute scores for all candidates (including user)
                    // This ensures fair comparison - everyone is scored the same way
                    const allCandidates = [...relevantCandidates, user];
                    
                    const scoredCandidates = allCandidates.map(candidate => ({
                        candidateId: candidate.id,
                        candidateName: candidate.full_name,
                        finalScore: calculateAbsoluteScore(candidate),
                        rank: 0,
                        breakdown: { services: 0, hardSkills: 0, experience: 0, courses: 0, profileCompleteness: 0, differentialMultiplier: 1.0, proximityFactor: 100 },
                        similarityHighlights: [],
                        isSelf: candidate.id === user.id,
                        // Display-only fields (for UI, does not affect ranking logic)
                        coursesCount: candidate.courses?.length || 0,
                        skillsCount: candidate.skills?.length || 0,
                        profileAnalysis: candidate.profile_analysis || null,
                        graduations: candidate.graduations || []
                    }));
                    
                    // Step 3: Sort all candidates by score (descending)
                    // With the new scoring system, tiebreakers are handled within the score itself
                    // (skills with decreasing weights, course levels, etc.)
                    scoredCandidates.sort((a, b) => {
                        // Primary: Final score (already normalized and differentiated)
                        return b.finalScore - a.finalScore;
                    });
                    
                    // Step 4: Assign ranks (user is now part of the list)
                    scoredCandidates.forEach((c, i) => { c.rank = i + 1; });
                    
                    // Step 5: Get top 20 from all candidates (user included if in top 20)
                    const top20All = scoredCandidates.slice(0, 20);
                    const userEntry = scoredCandidates.find(c => c.candidateId === user.id);
                    const userInTop20 = userEntry && userEntry.rank <= 20;
                    
                    // Step 6: Separate user from other candidates in top 20
                    const top20 = top20All.filter(c => c.candidateId !== user.id);
                    
                    self.postMessage({
                        success: true,
                        result: {
                            user: userEntry || {
                                candidateId: user.id,
                                candidateName: user.full_name || 'Você',
                                finalScore: calculateAbsoluteScore(user),
                                rank: scoredCandidates.length,
                                breakdown: { services: 0, hardSkills: 0, experience: 0, courses: 0, profileCompleteness: 0, differentialMultiplier: 1.0, proximityFactor: 100 },
                                similarityHighlights: [],
                                isSelf: true,
                                // Display-only fields (for UI, does not affect ranking logic)
                                coursesCount: user.courses?.length || 0,
                                skillsCount: user.skills?.length || 0,
                                profileAnalysis: user.profile_analysis || null,
                                graduations: user.graduations || []
                            },
                            rankedCandidates: top20,
                            userInTop20: userInTop20 || false,
                            stats: {
                                totalCandidates: candidates.length,
                                relevantCandidates: relevantCandidates.length,
                                withinRadius: relevantCandidates.length
                            }
                        }
                    });
                } catch (error) {
                    self.postMessage({
                        success: false,
                        error: error instanceof Error ? error.message : 'Unknown error'
                    });
                }
            };
        `;

        const blob = new Blob([workerCode], { type: 'application/javascript' });
        const workerUrl = URL.createObjectURL(blob);
        const worker = new Worker(workerUrl);

        worker.onmessage = (e) => {
            worker.terminate();
            URL.revokeObjectURL(workerUrl);

            if (e.data.success) {
                resolve(e.data.result);
            } else {
                reject(new Error(e.data.error));
            }
        };

        worker.onerror = (error) => {
            worker.terminate();
            URL.revokeObjectURL(workerUrl);
            reject(error);
        };

        worker.postMessage({ user, candidates, maxDistance });
    });
}

/**
 * Main function to fetch and rank candidates with parallel processing
 * 
 * This is the primary entry point for the ranking system.
 * It fetches the user profile, fetches candidates, and runs the ranking algorithm
 * in a Web Worker to prevent UI blocking.
 * 
 * @param userId - ID of the user to rank against
 * @param maxDistance - Maximum distance in meters (default: 20000 = 20km)
 * @returns Ranking result with user position and top 20 candidates
 */
export async function fetchAndRankCandidates(
    userId: string,
    maxDistance: number = 20000
): Promise<(RankingResult & { userInTop20: boolean }) | null> {
    try {
        // Fetch user profile
        const user = await fetchUserProfile(userId);
        if (!user) {
            console.error('User profile not found');
            return null;
        }

        // Fetch candidates
        const candidates = await fetchCandidatesFromDatabase(userId);

        // Run ranking in worker for parallel processing
        const result = await runRankingInWorker(user, candidates, maxDistance);

        return result;
    } catch (error) {
        console.error('Error in fetchAndRankCandidates:', error);
        return null;
    }
}
