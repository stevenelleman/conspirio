import express, { Request, Response } from "express";
import { Controller } from "@/lib/controller";
import {
  ChipIssuer,
  CommunityParams, CommunityParamsSchema,
  ErrorResponse, errorToString, GetLocationRequest, GetLocationRequestSchema,
  GetLocationsRequest, GetLocationsRequestSchema,
  CommunityLocations, CommunityLocation
} from "@types";

// NOTE: must set mergeParams for the params to be passed into downstream routers
const router = express.Router({ mergeParams: true });
const controller = new Controller();

/**
 * @route GET /api/community/:community/location
 * @desc Gets the location chip entries for a chip issuer
 */
router.get(
  "",
  async (
    req: Request<CommunityParams, {}, GetLocationsRequest>,
    res: Response<CommunityLocations | ErrorResponse>
  ) => {
    try {
      const validatedParams = CommunityParamsSchema.parse(req.params)
      const { community } = validatedParams;

      if (!community) {
        return res.status(404).json({ error: "Missing community" });
      }

      const validatedReq = GetLocationsRequestSchema.parse(req.query);
      const { authToken } = validatedReq;

      // Fetch user by auth token
      // While the user isn't specifically required, it ensures the request is from an authenticated user
      const user = await controller.GetUserByAuthToken(authToken);

      if (!user) {
        return res.status(401).json({ error: "Invalid auth token" });
      }

      const chipIssuer = community.toUpperCase() as ChipIssuer;

      const locations = await controller.GetLocationChips(
        chipIssuer,
      );

      if (locations) {
        return res.status(200).json(locations);
      }

      throw new Error("Failed to get locations");
    } catch (error) {
      return res.status(500).json({
        error: errorToString(error),
      });
    }
  }
);

/**
 * @route GET /api/community/:community/location/id
 * @desc Gets the location chip entries for a chip issuer
 */
router.get(
  "/id",
  async (
    req: Request<CommunityParams, {}, GetLocationRequest>,
    res: Response<CommunityLocation | ErrorResponse>
  ) => {
    try {
      const validatedParams = CommunityParamsSchema.parse(req.params)
      const { community } = validatedParams;
      const validatedData = GetLocationRequestSchema.parse(req.query);
      const { authToken, id } = validatedData;

      if (!community) {
        return res.status(401).json({ error: "Missing community" }); // Check right status code
      }

      // Fetch user by auth token
      // While the user isn't specifically required, it ensures the request is from an authenticated user
      const user = await controller.GetUserByAuthToken(authToken);

      if (!user) {
        return res.status(401).json({ error: "Invalid auth token" });
      }

      const chipIssuer = community.toUpperCase() as ChipIssuer;

      const location = await controller.GetLocationChip(
        chipIssuer,
        id,
      );

      if (location) {
        return res.status(200).json(location);
      }

      throw new Error("Failed to get location");
    } catch (error) {
      return res.status(500).json({
        error: errorToString(error),
      });
    }
  }
);

export default router;