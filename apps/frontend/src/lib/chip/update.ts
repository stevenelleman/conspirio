import { BASE_API_URL } from "@/config";
import { ChipIssuer, errorToString, GetChipIdResponse, GetChipIdResponseSchema, Json, UpdateChipRequest } from "@types";
import { storage } from "../storage";

interface UpdateChipArgs {
  authToken: string;
  chipIssuer: ChipIssuer;
  chipId: string;
  ownerDisplayName: string | null;
  ownerBio: string | null;
  ownerTwitterUsername: string | null;
  ownerTelegramUsername: string | null;
  ownerSignalUsername: string | null;
  ownerInstagramUsername: string | null;
  ownerFarcasterUsername: string | null;
  ownerPronouns: string | null;
}

export async function updateChip(args: UpdateChipArgs): Promise<void> {
  const ownerUserData: Json = {};
  if (args.ownerTwitterUsername) {
    ownerUserData.twitter = {
      username: args.ownerTwitterUsername,
    };
  }
  if (args.ownerTelegramUsername) {
    ownerUserData.telegram = {
      username: args.ownerTelegramUsername,
    };
  }
  if (args.ownerSignalUsername) {
    ownerUserData.signal = {
      username: args.ownerSignalUsername,
    };
  }
  if (args.ownerInstagramUsername) {
    ownerUserData.instagram = {
      username: args.ownerInstagramUsername,
    };
  }
  if (args.ownerFarcasterUsername) {
    ownerUserData.farcaster = {
      username: args.ownerFarcasterUsername,
    };
  }
  if (args.ownerPronouns) {
    ownerUserData.pronouns = args.ownerPronouns;
  }

  const request: UpdateChipRequest = {
    authToken: args.authToken,
    chipIssuer: args.chipIssuer,
    chipId: args.chipId,
    ownerDisplayName: args.ownerDisplayName ?? null,
    ownerBio: args.ownerBio ?? null,
    ownerUserData,
  };

  try {
    const response = await fetch(`${BASE_API_URL}/chip/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to update chip");
    }

    const user = await storage.getUser();

    if (!user) {
      throw new Error("User not found");
    }

    await storage.updateUserData({
      ...user.userData,
      displayName: args.ownerDisplayName ?? "",
      bio: args.ownerBio ?? "",
      twitter: {
        username: args.ownerTwitterUsername ?? undefined,
      },
      telegram: {
        username: args.ownerTelegramUsername ?? undefined,
      },
      signal: {
        username: args.ownerSignalUsername ?? undefined,
      },
      instagram: {
        username: args.ownerInstagramUsername ?? undefined,
      },
      farcaster: {
        username: args.ownerFarcasterUsername ?? undefined,
      },
      pronouns: args.ownerPronouns ?? undefined,
    });
  } catch (error) {
    console.error("Error updating chip:", errorToString(error));
    throw error;
  }
}

export async function getChipId(authTokenValue: string, chipIssuer: ChipIssuer, connectionUsername: string): Promise<GetChipIdResponse> {
  try {
    const response = await fetch(`${BASE_API_URL}/chip/id?authToken=${authTokenValue}&chipIssuer=${chipIssuer.toString()}&username=${connectionUsername}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to update chip");
    }

    const data = await response.json();
    if (data && data.error) {
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${data.error}, consider checking environment variables or redirect_uri`
      );
    }

    return GetChipIdResponseSchema.parse(data);
  } catch (error) {
    console.error("Error updating chip:", errorToString(error));
    throw error;
  }
}
