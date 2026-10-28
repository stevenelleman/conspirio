import {
  AccessToken,
  GoogleCalendarFreeBusyResponse,
  GoogleCalendarFreeBusyResponseSchema,
} from "@types";

// Number of days ahead to import busy intervals for
const UPCOMING_BUSY_WINDOW_DAYS = 7;

export async function googleCalendarFetchUpcomingBusy(token: AccessToken): Promise<Response> {
  const timeMin = new Date();
  const timeMax = new Date(
    timeMin.getTime() + UPCOMING_BUSY_WINDOW_DAYS * 24 * 60 * 60 * 1000
  );

  return fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.access_token}`,
    },
    body: JSON.stringify({
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      items: [{ id: "primary" }],
    }),
  });
}

// Map busy intervals to ISO 8601 interval strings, e.g. "2024-11-15T17:00:00Z/2024-11-15T18:00:00Z"
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function MapGoogleCalendarFreeBusyToIntervals(resp: any): string[] {
  const parsed: GoogleCalendarFreeBusyResponse =
    GoogleCalendarFreeBusyResponseSchema.parse(resp);

  const intervals: string[] = [];
  for (const calendar of Object.values(parsed.calendars)) {
    for (const busy of calendar.busy) {
      intervals.push(`${busy.start}/${busy.end}`);
    }
  }
  return intervals;
}
