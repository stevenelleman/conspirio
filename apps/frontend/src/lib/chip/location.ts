import {
  ChipIssuer,
  CommunityLocations,
  CommunityLocationsSchema, CommunityLocation, CommunityLocationSchema
} from "@types";
import { storage } from "@/lib/storage";
import { BASE_API_URL } from "@/config";


export async function getCommunityLocations(
  chipIssuer: ChipIssuer,
): Promise<CommunityLocations | null> {
  const { session } = await storage.getUserAndSession();

  try {
    const response = await fetch(
      `${BASE_API_URL}/community/${chipIssuer.toLowerCase()}/location?authToken=${session.authTokenValue}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorResponse = await response.json();
      console.error(
        `HTTP error! status: ${response.status}, message: ${errorResponse.error}`
      );
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorResponse.error}`
      );
    }

    const data = await response.json();
    const parsedData = CommunityLocationsSchema.parse(data);

    return parsedData;
  } catch (error) {
    console.error("Error getting locations:", error);
    throw error;
  }
}

export async function getCommunityLocation(
  chipIssuer: ChipIssuer,
  id: string,
): Promise<CommunityLocation | null> {
  const { session } = await storage.getUserAndSession();

  try {
    const response = await fetch(
      `${BASE_API_URL}/community/${chipIssuer}/location/id?id=${id}&authToken=${session.authTokenValue}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorResponse = await response.json();
      console.error(
        `HTTP error! status: ${response.status}, message: ${errorResponse.error}`
      );
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorResponse.error}`
      );
    }

    const data = await response.json();
    const parsedData = CommunityLocationSchema.parse(data);

    return parsedData;
  } catch (error) {
    console.error("Error getting locations:", error);
    throw error;
  }
}


