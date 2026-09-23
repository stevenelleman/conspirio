import { BASE_API_URL } from "@/config";
import { ChipIssuer, errorToString, GetChipIdResponse, GetChipIdResponseSchema, Json, UpdateChipRequest } from "@types";
import { storage } from "../storage";
import { validateEmail, validateHttpsDomain } from "@/lib/frontend/util";

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
  ownerEmail: string | null;
  ownerSMSNumber: string | null;
  ownerWhatsappNumber: string | null;
  ownerPersonalWebsites: string[] | null;
  ownerSubstack: string | null;
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
  if (args.ownerEmail) {
    if (!validateEmail(args.ownerEmail)) {
      throw new Error("Email not valid");
    }
    ownerUserData.email = {
      address: args.ownerEmail,
    };
  }
  if (args.ownerSMSNumber) {
    if (args.ownerSMSNumber.length < 11) {
      throw new Error("SMS number too short, did you include the country code?");
    }

    ownerUserData.sms = {
      number: args.ownerSMSNumber,
    };
  }
  if (args.ownerWhatsappNumber) {
    if (args.ownerWhatsappNumber.length < 11) {
      throw new Error("Whatsapp number too short, did you include the country code?");
    }
    ownerUserData.whatsapp = {
      number: args.ownerWhatsappNumber,
    };
  }
  if (args.ownerPersonalWebsites) {
    for (const website of args.ownerPersonalWebsites) {
      const valid = validateHttpsDomain(website);
      if (!valid) {
        throw new Error(`Website '${website}' missing https`);
      }
    }

    ownerUserData.personalWebsites = {
      websites: args.ownerPersonalWebsites,
    };
  }
  if (args.ownerSubstack) {
    ownerUserData.substack = {
      handle: args.ownerSubstack,
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
      email: {
        address: args.ownerEmail ?? undefined,
      },
      sms: {
        number: args.ownerSMSNumber ?? undefined,
      },
      whatsapp: {
        number: args.ownerWhatsappNumber ?? undefined,
      },
      personalWebsites: {
        websites: args.ownerPersonalWebsites ?? undefined,
      },
      substack: {
        handle: args.ownerSubstack ?? undefined,
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
