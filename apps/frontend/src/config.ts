import { Inter } from "next/font/google";
import { RouterItem } from "@/lib/frontend/types";
import { Icons } from "@/components/icons/Icons";
import {
  DataImportSource,
  ImportDataType,
  OAuthAppDetails,
  RefreshRateType,
} from "@types";
import { SUPPORT_EMAIL } from "@/constants";

export const fontBase = Inter({ subsets: ["latin"], variable: "--font-base" });

export const FRONTEND_URL =
  process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";

export const BASE_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export const BASE_API_WS =
  process.env.NEXT_PUBLIC_API_WS || "ws://localhost:8080";

export const GITHUB_IMPORT_URL = `https://www.github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_OAUTH_GITHUB_CLIENT_ID}&state=github&response_type=code&redirect_uri=${FRONTEND_URL}/oauth/exchange_token&approval_prompt=force&scope=read`

// Free/busy scope only exposes busy intervals, not event titles, attendees, or locations
const GOOGLE_CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.freebusy";

// access_type=offline and prompt=consent ensure Google returns a refresh token on every grant
export const GOOGLE_CALENDAR_IMPORT_URL = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
  client_id: process.env.NEXT_PUBLIC_OAUTH_GOOGLE_CLIENT_ID || "",
  state: DataImportSource.GOOGLE_CALENDAR,
  response_type: "code",
  redirect_uri: `${FRONTEND_URL}/oauth/exchange_token`,
  scope: GOOGLE_CALENDAR_SCOPE,
  access_type: "offline",
  prompt: "consent",
}).toString()}`;

export const OAUTH_APP_DETAILS: Record<DataImportSource, OAuthAppDetails> = {
  strava: {
    client_side_fetching: true,
    can_import: true,
    token_url: "https://www.strava.com/api/v3/oauth/token",
    redirect_uri: `${FRONTEND_URL}/oauth/exchange_token&approval_prompt=force&scope=read`,
    id: process.env.NEXT_PUBLIC_OAUTH_STRAVA_CLIENT_ID || "",
    secret: process.env.NEXT_PUBLIC_OAUTH_STRAVA_CLIENT_SECRET || "",
    data_options: [
      {
        type: ImportDataType.STRAVA_PREVIOUS_MONTH_RUN_DISTANCE,
        scope: "read",
        refreshRate: RefreshRateType.DAILY,
      },
    ],
  },
  github: {
    client_side_fetching: false,
    can_import: true,
    token_url: "https://github.com/login/oauth/access_token",
    redirect_uri: `${FRONTEND_URL}/oauth/exchange_token&approval_prompt=force&scope=read`,
    id: process.env.NEXT_PUBLIC_OAUTH_GITHUB_CLIENT_ID || "",
    secret: "",
    data_options: [
      {
        type: ImportDataType.GITHUB_LANNA_CONTRIBUTIONS,
        scope: "read",
        refreshRate: RefreshRateType.DAILY,
      },
      {
        type: ImportDataType.GITHUB_CONTRIBUTIONS_LAST_YEAR,
        scope: "read",
        refreshRate: RefreshRateType.WEEKLY,
      },
      {
        type: ImportDataType.GITHUB_STARRED_REPOS,
        scope: "read",
        refreshRate: RefreshRateType.WEEKLY,
      },
      {
        type: ImportDataType.GITHUB_PROGRAMMING_LANGUAGES,
        scope: "read",
        refreshRate: RefreshRateType.WEEKLY,
      },
    ],
  },
  google_calendar: {
    client_side_fetching: false,
    can_import: true,
    token_url: "https://oauth2.googleapis.com/token",
    redirect_uri: `${FRONTEND_URL}/oauth/exchange_token`,
    id: process.env.NEXT_PUBLIC_OAUTH_GOOGLE_CLIENT_ID || "",
    secret: "",
    data_options: [
      {
        type: ImportDataType.GOOGLE_CALENDAR_UPCOMING_BUSY,
        scope: GOOGLE_CALENDAR_SCOPE,
        refreshRate: RefreshRateType.DAILY,
      },
    ],
  },
};

export const APP_CONFIG = {
  APP_NAME: "Conspirio",
  APP_DESCRIPTION: "Conspirio",
  SUPPORT_EMAIL: SUPPORT_EMAIL,
  ALLOW_INCOGNITO: false, // Set to false to disable incognito mode
  IS_MOBILE_ONLY: true, // Set to true to disable the web version
  FOOTER_ICON_SIZE: 10,
};

export const ROUTER_ITEMS: RouterItem[] = [
  {
    label: "About",
    href: "/about",
    icon: Icons.CursiveFooter,
    iconSize: 20,
  },
  {
    label: "New Features",
    href: "/new-features",
    icon: Icons.NarrowCast,
    iconSize: 20,
  },
  {
    label: "People",
    href: "/people",
    icon: Icons.People,
    iconSize: 20,
  },
  {
    label: "Community",
    href: "/community",
    icon: Icons.Community,
    iconSize: 20,
  },
  {
    label: "Account",
    href: "/profile",
    icon: Icons.Profile,
    iconSize: 20,
  },
];
