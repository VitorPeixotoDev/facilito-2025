/**
 * Distance calculation utilities
 * 
 * Implements the Haversine formula to calculate distances between
 * two geographic coordinates (latitude/longitude).
 */

/**
 * Calculates the distance between two geographic coordinates using the Haversine formula
 * 
 * The Haversine formula determines the great-circle distance between two points
 * on a sphere given their longitudes and latitudes.
 * 
 * @param lat1 - Latitude of the first point in degrees
 * @param lon1 - Longitude of the first point in degrees
 * @param lat2 - Latitude of the second point in degrees
 * @param lon2 - Longitude of the second point in degrees
 * @returns Distance in meters between the two points
 * 
 * @example
 * const distance = calculateDistance(-23.5505, -46.6333, -23.5510, -46.6340);
 * // Returns distance in meters
 */
export function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    // Earth's radius in meters
    const R = 6371e3;

    // Convert degrees to radians
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    // Haversine formula
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

/**
 * Checks if a candidate is within the maximum distance radius
 * and calculates a proximity factor for scoring
 * 
 * The proximity factor decreases linearly from 1.0 (at 0km) to 0.7 (at maxDistance)
 * to give a slight advantage to closer candidates while still including
 * candidates up to the maximum distance.
 * 
 * @param userLocation - User's location coordinates
 * @param candidateLocation - Candidate's location coordinates
 * @param maxDistance - Maximum distance in meters (default: 20000 = 20km)
 * @returns Object with withinRadius flag and proximityFactor (0-1)
 * 
 * @example
 * const { withinRadius, proximityFactor } = checkProximity(
 *   { latitude: -23.5505, longitude: -46.6333 },
 *   { latitude: -23.5510, longitude: -46.6340 },
 *   20000
 * );
 */
export function checkProximity(
    userLocation: { latitude: number; longitude: number } | null,
    candidateLocation: { latitude: number; longitude: number } | null,
    maxDistance: number = 20000
): { withinRadius: boolean; proximityFactor: number; distance?: number } {
    // If either location is missing, assume within radius with neutral factor
    if (!userLocation || !candidateLocation) {
        return { withinRadius: true, proximityFactor: 1.0 };
    }

    const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        candidateLocation.latitude,
        candidateLocation.longitude
    );

    // If outside maximum distance, exclude from ranking
    if (distance > maxDistance) {
        return { withinRadius: false, proximityFactor: 0, distance };
    }

    // Calculate proximity factor: 1.0 at 0km, 0.7 at maxDistance
    // Linear interpolation
    const proximityFactor = 1 - (distance / maxDistance) * 0.3;

    return {
        withinRadius: true,
        proximityFactor: Math.max(proximityFactor, 0.7), // Minimum 0.7
        distance
    };
}

