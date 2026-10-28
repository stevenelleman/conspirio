import {z} from "zod";

/*
{
access_token:"***"
expires_in:3599
refresh_token:"***"
scope:"https://www.googleapis.com/auth/calendar.freebusy"
token_type:"Bearer"
}
 */

export const GoogleCalendarBearerTokenSchema = z.object({
  access_token: z.string(),
  // Seconds until expiration, typically 3599
  expires_in: z.number(),
  scope: z.string(),
  token_type: z.string(),
  // Only returned on the initial exchange (with access_type=offline), refresh responses omit it
  refresh_token: z.string().optional(),
});

export type GoogleCalendarBearerToken = z.infer<typeof GoogleCalendarBearerTokenSchema>;

/*
{
"kind": "calendar#freeBusy",
"timeMin": "2024-11-15T00:00:00.000Z",
"timeMax": "2024-11-22T00:00:00.000Z",
"calendars": {
  "primary": {
    "busy": [
      {
        "start": "2024-11-15T17:00:00Z",
        "end": "2024-11-15T18:00:00Z"
      }
    ]
  }
}
}
*/

export const GoogleCalendarBusyIntervalSchema = z.object({
  start: z.string(),
  end: z.string(),
});

export type GoogleCalendarBusyInterval = z.infer<typeof GoogleCalendarBusyIntervalSchema>;

export const GoogleCalendarFreeBusyResponseSchema = z.object({
  calendars: z.record(
    z.string(),
    z.object({
      busy: z.array(GoogleCalendarBusyIntervalSchema),
    })
  ),
});

export type GoogleCalendarFreeBusyResponse = z.infer<typeof GoogleCalendarFreeBusyResponseSchema>;
