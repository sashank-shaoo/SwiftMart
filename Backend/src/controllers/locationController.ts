import { Request, Response } from "express";
import { UserDao } from "../daos/UserDao";
import MapboxService from "../services/MapboxService";

/**
 * Update user location with address geocoding
 * POST /api/auth/update-location
 */
export const updateUserLocation = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { address, latitude, longitude } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    let locationData: any = null;

    // Option 1: Address provided - geocode it
    if (address) {
      const geocoded = await MapboxService.geocodeAddress(address);

      if (!geocoded) {
        return res.status(400).json({
          success: false,
          message: "Could not geocode address. Please check the address.",
        });
      }

      locationData = {
        latitude: geocoded.latitude,
        longitude: geocoded.longitude,
        formattedAddress: geocoded.formattedAddress,
        place: geocoded.place,
        region: geocoded.region,
        country: geocoded.country,
      };
    }

    // Option 2: Coordinates provided - reverse geocode
    else if (latitude !== undefined && longitude !== undefined) {
      const reverseGeocoded = await MapboxService.reverseGeocode(
        latitude,
        longitude,
      );

      if (reverseGeocoded) {
        locationData = {
          latitude: reverseGeocoded.latitude,
          longitude: reverseGeocoded.longitude,
          formattedAddress: reverseGeocoded.formattedAddress,
          place: reverseGeocoded.place,
          region: reverseGeocoded.region,
          country: reverseGeocoded.country,
        };
      } else {
        // If reverse geocoding fails, still use coordinates
        locationData = {
          latitude,
          longitude,
        };
      }
    } else {
      return res.status(400).json({
        success: false,
        message:
          "Please provide either an address or coordinates (latitude, longitude)",
      });
    }

    // Store as GeoJSON Point format (matches User model)
    const geoJsonPoint = {
      type: "Point" as const,
      coordinates: [locationData.longitude, locationData.latitude] as [
        number,
        number,
      ],
    };

    const updated = await UserDao.updateUser(userId, {
      location: geoJsonPoint,
    });

    if (!updated) {
      return res.status(500).json({
        success: false,
        message: "Failed to update location",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Location updated successfully",
      location: locationData,
    });
  } catch (error: any) {
    console.error("Update Location Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update location",
      error: error.message,
    });
  }
};

/**
 * Get user's current location
 * GET /api/auth/location
 */
export const getUserLocation = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await UserDao.findUserById(userId);

    if (!user || !user.location) {
      return res.status(404).json({
        success: false,
        message: "No location found for user",
      });
    }

    // Extract coordinates from GeoJSON Point
    const [longitude, latitude] = user.location.coordinates;

    // Reverse geocode to get address
    const locationData = await MapboxService.reverseGeocode(
      latitude,
      longitude,
    );

    return res.status(200).json({
      success: true,
      location: locationData || {
        latitude,
        longitude,
      },
    });
  } catch (error: any) {
    console.error("Get Location Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get location",
      error: error.message,
    });
  }
};

/**
 * Calculate distance from user to a location
 * POST /api/auth/calculate-distance
 */
export const calculateDeliveryDistance = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = (req as any).user?.id;
    const { targetLatitude, targetLongitude } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!targetLatitude || !targetLongitude) {
      return res.status(400).json({
        success: false,
        message: "Target coordinates required",
      });
    }

    const user = await UserDao.findUserById(userId);

    if (!user || !user.location) {
      return res.status(404).json({
        success: false,
        message: "User location not set. Please update your location first.",
      });
    }

    // Extract coordinates from GeoJSON Point
    const [userLongitude, userLatitude] = user.location.coordinates;

    // Calculate distance
    const distance = MapboxService.calculateDistance(
      userLatitude,
      userLongitude,
      targetLatitude,
      targetLongitude,
    );

    return res.status(200).json({
      success: true,
      distance: {
        kilometers: distance,
        miles: Math.round(distance * 0.621371 * 100) / 100,
      },
      userLocation: {
        latitude: userLatitude,
        longitude: userLongitude,
      },
      targetLocation: {
        latitude: targetLatitude,
        longitude: targetLongitude,
      },
    });
  } catch (error: any) {
    console.error("Calculate Distance Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to calculate distance",
      error: error.message,
    });
  }
};
