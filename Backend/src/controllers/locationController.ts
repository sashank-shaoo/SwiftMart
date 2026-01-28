import { Request, Response } from "express";
import { UserDao } from "../daos/UserDao";
import MapboxService from "../services/MapboxService";
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  InternalServerError,
} from "../utils/errors";

/**
 * Update user location with address geocoding
 * POST /api/auth/update-location
 */
export const updateUserLocation = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { address, latitude, longitude } = req.body;

  if (!userId) {
    throw new UnauthorizedError("Unauthorized");
  }

  let locationData: any = null;

  // Option 1: Address provided - geocode it
  if (address) {
    const geocoded = await MapboxService.geocodeAddress(address);

    if (!geocoded) {
      throw new BadRequestError(
        "Could not geocode address. Please check the address.",
      );
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
    throw new BadRequestError(
      "Please provide either an address or coordinates (latitude, longitude)",
    );
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
    throw new InternalServerError("Failed to update location");
  }

  return res.success(locationData, "Location updated successfully");
};

/**
 * Get user's current location
 * GET /api/auth/location
 */
export const getUserLocation = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  if (!userId) {
    throw new UnauthorizedError("Unauthorized");
  }

  const user = await UserDao.findUserById(userId);

  if (!user || !user.location) {
    throw new NotFoundError("No location found for user");
  }

  // Extract coordinates from GeoJSON Point
  const [longitude, latitude] = user.location.coordinates;

  // Reverse geocode to get address
  const locationData = await MapboxService.reverseGeocode(latitude, longitude);

  return res.success(
    locationData || {
      latitude,
      longitude,
    },
    "Location fetched successfully",
  );
};

/**
 * Calculate distance from user to a location
 * POST /api/auth/calculate-distance
 */
export const calculateDeliveryDistance = async (
  req: Request,
  res: Response,
) => {
  const userId = (req as any).user?.id;
  const { targetLatitude, targetLongitude } = req.body;

  if (!userId) {
    throw new UnauthorizedError("Unauthorized");
  }

  if (!targetLatitude || !targetLongitude) {
    throw new BadRequestError("Target coordinates required");
  }

  const user = await UserDao.findUserById(userId);

  if (!user || !user.location) {
    throw new NotFoundError(
      "User location not set. Please update your location first.",
    );
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

  return res.success(
    {
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
    },
    "Distance calculated successfully",
  );
};
