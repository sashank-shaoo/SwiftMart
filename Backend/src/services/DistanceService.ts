/**
 * Distance Calculation Service
 * Uses Haversine formula for geographic distance calculations
 * and provides delivery time estimation
 */

class DistanceService {
  /**
   * Calculate distance between two geographic points using Haversine formula
   * @param lat1 Latitude of point 1
   * @param lng1 Longitude of point 1
   * @param lat2 Latitude of point 2
   * @param lng2 Longitude of point 2
   * @returns Distance in kilometers (with 1.4x multiplier for realistic road distance)
   */
  calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const straightLineDistance = R * c;

    // Apply 1.4x multiplier for realistic road distance
    const actualDistance = straightLineDistance * 1.4;

    return Math.round(actualDistance * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Calculate estimated delivery time using dynamic formula
   * @param distanceKm Distance in kilometers
   * @returns Estimated delivery time in minutes
   */
  calculateDeliveryTime(distanceKm: number): number {
    // Dynamic formula based on distance ranges
    let minutesPerKm: number;

    if (distanceKm < 5) {
      minutesPerKm = 10; // 10 min/km for short distances (traffic, last-mile)
    } else if (distanceKm < 20) {
      minutesPerKm = 5; // 5 min/km for medium distances
    } else {
      minutesPerKm = 3; // 3 min/km for long distances (highway speeds)
    }

    const travelTime = distanceKm * minutesPerKm;
    const baseProcessingTime = 30; // 30 minutes for processing and pickup

    return Math.ceil(baseProcessingTime + travelTime);
  }

  /**
   * Get estimated delivery timestamp
   * @param distanceKm Distance in kilometers
   * @param fromTimestamp Starting timestamp (default: now)
   * @returns Estimated delivery Date
   */
  getEstimatedDeliveryDate(
    distanceKm: number,
    fromTimestamp: Date = new Date(),
  ): Date {
    const deliveryMinutes = this.calculateDeliveryTime(distanceKm);
    const deliveryDate = new Date(fromTimestamp);
    deliveryDate.setMinutes(deliveryDate.getMinutes() + deliveryMinutes);
    return deliveryDate;
  }

  /**
   * Parse location string to coordinates
   * @param location Location string in format "lat,lng"
   * @returns { lat: number, lng: number }
   */
  parseLocation(location: string): { lat: number; lng: number } {
    const [lat, lng] = location.split(",").map(Number);
    if (isNaN(lat) || isNaN(lng)) {
      throw new Error("Invalid location format. Expected 'lat,lng'");
    }
    return { lat, lng };
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

export default new DistanceService();
