import { z } from "zod";
import { ChipIssuerSchema, nullToUndefined } from "@types";
import { TapDataSchema } from "../connection";

export const LocationDataSchema = z.object({});

export type LocationData = z.infer<typeof LocationDataSchema>;

export const LocationTapsSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  data: nullToUndefined(LocationDataSchema),
  chipIssuer: ChipIssuerSchema,
  chipPublicKey: z.string(),
  taps: z.array(TapDataSchema),
});

export type LocationTaps = z.infer<typeof LocationTapsSchema>;
