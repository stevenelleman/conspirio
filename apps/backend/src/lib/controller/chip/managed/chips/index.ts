import {
  ChipIssuer,
  ChipIssuerSchema, ChipVariant,
  ChipVariantSchema,
  JsonSchema,
  CommunityLocations,
  CommunityLocation,
  UpdateChipRequest
} from "@types";
import { Chip, ChipSchema } from "../../types";
import { ManagedChipClient } from "../client";
import { z } from "zod";
import { LocationChip } from "@/scripts/embassy/loadLocationChips";

ManagedChipClient.prototype.UpdateChip = async function (
  updateChip: UpdateChipRequest
): Promise<Chip> {
  const chip = await this.prismaClient.chip.findFirst({
    where: { chipIssuer: updateChip.chipIssuer, chipId: updateChip.chipId },
  });
  if (!chip) {
    throw new Error("Chip not found");
  }

  // ensure user owns the chip
  const prismaAuthToken = await this.prismaClient.authToken.findUnique({
    where: { value: updateChip.authToken },
  });
  if (!prismaAuthToken) {
    throw new Error("Invalid auth token");
  }

  const authUser = await this.prismaClient.user.findUnique({
    where: { id: prismaAuthToken.userId },
  });
  if (!authUser) {
    throw new Error("User not found");
  }
  if (authUser.username !== chip.ownerUsername) {
    throw new Error("User does not own this chip");
  }

  // Update the chip with registration information
  const updatedChip = await this.prismaClient.chip.update({
    where: { id: chip.id },
    data: {
      ownerDisplayName: updateChip.ownerDisplayName,
      ownerBio: updateChip.ownerBio,
      // If the ownerUserData is null (equal to the Json null value), set it to undefined, which just doesn't update the field
      // This is due to how Prisma handles Json null types
      // https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types/working-with-json-fields#using-null-values
      ownerUserData:
        updateChip.ownerUserData === null
          ? undefined
          : updateChip.ownerUserData,
    },
  });

  // send notification to user
  await this.notificationClient.SendNotification(
    authUser.id,
    "Your chip has been updated!"
  );

  // Return the updated chip
  return ChipSchema.parse(updatedChip);
};

ManagedChipClient.prototype.GetChipId = async function (
  chipIssuer: ChipIssuer,
  username: string
): Promise<string> {
  const chip = await this.prismaClient.chip.findFirst({
    where: {
      chipIssuer,
      ownerUsername: username
    },
  });
  if (!chip) {
    throw new Error("Chip not found");
  }

  return chip.chipId;
};

ManagedChipClient.prototype.GetLocationChips = async function (
  chipIssuer: ChipIssuer,
): Promise<CommunityLocations> {
  const chips = await this.prismaClient.chip.findMany({
    where: {
      chipIssuer,
      isLocationChip: true,
    },
  });
  if (!chips) {
    throw new Error("Chips not found");
  }

  // Another way to port over values?
  const locations: CommunityLocation[] = [];
  for (const chip of chips) {
    const location: CommunityLocation = {
      id: chip.id,
      chipIssuer: chip.chipIssuer as ChipIssuer,
      chipVariant: chip.chipVariant as ChipVariant,
      chipIsRegistered: chip.chipIsRegistered,
      locationId: chip.locationId,
      locationName: chip.locationName,
      locationDescription: chip.locationDescription,
    }

    locations.push(location);
  }

  return locations;
};

ManagedChipClient.prototype.GetLocationChip = async function (
  chipIssuer: ChipIssuer,
  id: string
): Promise<CommunityLocation> {
  const chip = await this.prismaClient.chip.findFirst({
    where: {
      chipIssuer,
      id,
      isLocationChip: true,
    },
  });
  if (!chip) {
    throw new Error("Chip not found");
  }

  // TODO: Another way to port over values?
  const publicLocation = {
    id: chip.id,
    chipIssuer: chip.chipIssuer as ChipIssuer,
    chipId: chip.chipId,
    chipVariant: chip.chipVariant as ChipVariant,
    chipIsRegistered: chip.chipIsRegistered,
    locationId: chip.locationId,
    locationName: chip.locationName,
    locationDescription: chip.locationDescription,
  };

  return publicLocation;
};