import { z } from "zod";
import { nullToUndefined, UpdatableStringArraySchema } from "@types";

export const GoogleCalendarDataSchema = z.object({
  // ISO 8601 intervals ("start/end") the user is busy over the upcoming week
  upcomingBusy: nullToUndefined(UpdatableStringArraySchema),
});

export type GoogleCalendarData = z.infer<typeof GoogleCalendarDataSchema>;
