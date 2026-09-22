import { z } from "zod";
import { ChipIssuerSchema, ChipVariantSchema } from "@types";

export const LocationSchema = z.object({
  id: z.string(),
  chipIssuer: ChipIssuerSchema,
  chipVariant: ChipVariantSchema,
  chipIsRegistered: z.boolean(),
  locationId: z.string().nullable(),
  locationName: z.string().nullable(),
  locationDescription: z.string().nullable(),
});

export type Location = z.infer<typeof LocationSchema>;

export const LocationsSchema = z.array(LocationSchema);

export type Locations = z.infer<typeof LocationsSchema>;