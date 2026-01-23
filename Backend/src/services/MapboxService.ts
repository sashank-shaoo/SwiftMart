import mbxGeocoding from "@mapbox/mapbox-sdk/services/geocoding";
import logger from "../config/logger";

/**
 * Mapbox Service
 * Handles geocoding and location features using Mapbox API
 */

interface GeocodingResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  place: string;
  region: string;
  country: string;
}

class MapboxService {
  private geocodingClient: any = null;
  private isConfigured: boolean = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    if (!process.env.MAPBOX_ACCESS_TOKEN) {
      logger.warn(
        "⚠️  MAPBOX_ACCESS_TOKEN not configured - Location features disabled",
      );
      return;
    }

    try {
      this.geocodingClient = mbxGeocoding({
        accessToken: process.env.MAPBOX_ACCESS_TOKEN,
      });
      this.isConfigured = true;
      logger.info("✅ Mapbox configured");
    } catch (error: any) {
      logger.error(`❌ Mapbox initialization failed: ${error.message}`);
    }
  }

  /**
   * Check if Mapbox is available
   */
  isAvailable(): boolean {
    return this.geocodingClient !== null && this.isConfigured;
  }

  /**
   * Geocode an address to coordinates
   * Converts address string to latitude/longitude
   */
  async geocodeAddress(address: string): Promise<GeocodingResult | null> {
    if (!this.isAvailable()) {
      logger.warn("Mapbox not available - geocoding skipped");
      return null;
    }

    try {
      const response = await this.geocodingClient
        .forwardGeocode({
          query: address,
          limit: 1,
        })
        .send();

      if (!response.body.features || response.body.features.length === 0) {
        logger.warn(`No geocoding results found for: ${address}`);
        return null;
      }

      const feature = response.body.features[0];
      const [longitude, latitude] = feature.geometry.coordinates;

      // Extract place components
      const placeContext = feature.context || [];
      const getContextValue = (type: string) => {
        const item = placeContext.find((c: any) => c.id.startsWith(type));
        return item ? item.text : "";
      };

      const result: GeocodingResult = {
        latitude,
        longitude,
        formattedAddress: feature.place_name,
        place: feature.text || getContextValue("place"),
        region: getContextValue("region"),
        country: getContextValue("country"),
      };

      logger.debug(`[Mapbox] Geocoded: ${address} → ${latitude}, ${longitude}`);
      return result;
    } catch (error: any) {
      logger.error(`Geocoding error for "${address}": ${error.message}`);
      return null;
    }
  }

  /**
   * Reverse geocode coordinates to address
   * Converts latitude/longitude to address string
   */
  async reverseGeocode(
    latitude: number,
    longitude: number,
  ): Promise<GeocodingResult | null> {
    if (!this.isAvailable()) {
      logger.warn("Mapbox not available - reverse geocoding skipped");
      return null;
    }

    try {
      const response = await this.geocodingClient
        .reverseGeocode({
          query: [longitude, latitude],
          limit: 1,
        })
        .send();

      if (!response.body.features || response.body.features.length === 0) {
        logger.warn(
          `No reverse geocoding results for: ${latitude}, ${longitude}`,
        );
        return null;
      }

      const feature = response.body.features[0];
      const placeContext = feature.context || [];
      const getContextValue = (type: string) => {
        const item = placeContext.find((c: any) => c.id.startsWith(type));
        return item ? item.text : "";
      };

      const result: GeocodingResult = {
        latitude,
        longitude,
        formattedAddress: feature.place_name,
        place: feature.text || getContextValue("place"),
        region: getContextValue("region"),
        country: getContextValue("country"),
      };

      logger.debug(
        `[Mapbox] Reverse geocoded: ${latitude}, ${longitude} → ${result.formattedAddress}`,
      );
      return result;
    } catch (error: any) {
      logger.error(`Reverse geocoding error: ${error.message}`);
      return null;
    }
  }

  /**
   * Calculate distance between two coordinates (in kilometers)
   * Using Haversine formula
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Helper: Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Generate static map image URL
   * Returns URL for a static map image (for emails, etc.)
   */
  getStaticMapUrl(
    latitude: number,
    longitude: number,
    width: number = 400,
    height: number = 300,
    zoom: number = 14,
  ): string {
    if (!this.isAvailable()) return "";

    return `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+ff0000(${longitude},${latitude})/${longitude},${latitude},${zoom}/${width}x${height}?access_token=${process.env.MAPBOX_ACCESS_TOKEN}`;
  }
}

export default new MapboxService();
