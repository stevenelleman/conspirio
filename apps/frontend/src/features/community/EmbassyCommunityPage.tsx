import {
  CommunityCard,
  CommunityCardProps,
  DisplayedDashboard,
} from "@/components/cards/CommunityCard";
import { DashboardDetail } from "@/components/dashboard/DashboardDetail";
import { ChipPickup } from "@/components/ChipPickup";
import { CursiveLogo } from "@/components/ui/HeaderCover";
import {
  getTopLeaderboardEntries,
  getUserLeaderboardDetails,
} from "@/lib/chip";
import { logClientEvent } from "@/lib/frontend/metrics";
import { storage } from "@/lib/storage";
import {
  ChipIssuer,
  LeaderboardDetails,
  LeaderboardEntries,
  LeaderboardEntryType,
} from "@types";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { User } from "@/lib/storage/types";
import ImportGithubButton from "@/features/oauth/ImportGithubButton";
import ImportStravaButton from "@/features/oauth/ImportStravaButton";

// NOTE: Consider moving to constants.ts?
const UserOnboardingTarget = 100;
const GithubCommitTarget = 200;
const TapTarget = 100;
const StravaRunTarget = 100;
const WorkoutTarget = 50;

export default function EmbassyCommunityPage({
  displayedDashboard,
  setDisplayedDashboard,
}: {
  displayedDashboard: DisplayedDashboard;
  setDisplayedDashboard: (dashboard: DisplayedDashboard) => void;
}) {
  const router = useRouter();

  const [user, setUser] = useState<User | undefined>(undefined);

  const [leaderboardTapDetails, setLeaderboardTapDetails] =
    useState<LeaderboardDetails | null>(null);
  const [leaderboardTapEntries, setLeaderboardTapEntries] =
    useState<LeaderboardEntries | null>(null);

  const [leaderboardOnboardingDetails, setLeaderboardOnboardingDetails] =
    useState<LeaderboardDetails | null>(null);
  const [leaderboardOnboardingEntries, setLeaderboardOnboardingEntries] =
    useState<LeaderboardEntries | null>(null);

  const [githubLeaderboardDetails, setGithubLeaderboardDetails] =
    useState<LeaderboardDetails | null>(null);
  const [githubLeaderboardEntries, setGithubLeaderboardEntries] =
    useState<LeaderboardEntries | null>(null);

  const [stravaLeaderboardDetails, setStravaLeaderboardDetails] =
    useState<LeaderboardDetails | null>(null);
  const [stravaLeaderboardEntries, setStravaLeaderboardEntries] =
    useState<LeaderboardEntries | null>(null);

  const [embassyTotalWorkoutDetails, setEmbassyTotalWorkoutDetails] =
    useState<LeaderboardDetails | null>(null);
  const [embassyTotalWorkoutEntries, setEmbassyTotalWorkoutEntries] =
    useState<LeaderboardEntries | null>(null);

  const [cardProps, setCardProps] = useState<CommunityCardProps[]>([]);

  useEffect(() => {
    const fetchInfo = async () => {
      const { user, session } = await storage.getUserAndSession();
      if (!user || !session || session.authTokenExpiresAt < new Date()) {
        toast.error("Please log in to view the leaderboard.");
        router.push("/");
        return;
      }

      const communityIssuer: ChipIssuer = ChipIssuer.EMBASSY;

      let fetchedUser: User | undefined = undefined;
      let totalTapDetails: LeaderboardDetails | null = null;
      let totalTapEntries: LeaderboardEntries | null = null;
      let githubDetails: LeaderboardDetails | null = null;
      let githubEntries: LeaderboardEntries | null = null;
      let stravaDetails: LeaderboardDetails | null = null;
      let stravaEntries: LeaderboardEntries | null = null;
      let embassyTotalWorkoutDetails: LeaderboardDetails | null = null;
      let embassyTotalWorkoutEntries: LeaderboardEntries | null = null;

      let totalOnboardingDetails: LeaderboardDetails | null = null;
      let totalOnboardingEntries: LeaderboardEntries | null = null;

      try {
        [
          fetchedUser,
          totalTapDetails,
          totalTapEntries,
          githubDetails,
          githubEntries,
          stravaDetails,
          stravaEntries,
          embassyTotalWorkoutDetails,
          embassyTotalWorkoutEntries,
        ] = await Promise.all([
          storage.getUser(),
          getUserLeaderboardDetails(
            communityIssuer,
            LeaderboardEntryType.EMBASSY_TAP_COUNT
          ),
          getTopLeaderboardEntries(
            communityIssuer,
            LeaderboardEntryType.EMBASSY_TAP_COUNT
          ),
          getUserLeaderboardDetails(
            communityIssuer,
            LeaderboardEntryType.GITHUB_CONTRIBUTIONS_LAST_YEAR
          ),
          getTopLeaderboardEntries(
            communityIssuer,
            LeaderboardEntryType.GITHUB_CONTRIBUTIONS_LAST_YEAR
          ),
          getUserLeaderboardDetails(
            communityIssuer,
            LeaderboardEntryType.STRAVA_PREVIOUS_MONTH_RUN_DISTANCE
          ),
          getTopLeaderboardEntries(
            communityIssuer,
            LeaderboardEntryType.STRAVA_PREVIOUS_MONTH_RUN_DISTANCE
          ),
          getUserLeaderboardDetails(
            communityIssuer,
            LeaderboardEntryType.EMBASSY_TOTAL_WORKOUT_COUNT
          ),
          getTopLeaderboardEntries(
            communityIssuer,
            LeaderboardEntryType.EMBASSY_TOTAL_WORKOUT_COUNT
          )
        ]);

        [totalOnboardingDetails, totalOnboardingEntries] = await Promise.all([
          getUserLeaderboardDetails(
            communityIssuer,
            LeaderboardEntryType.USER_REGISTRATION_ONBOARDING
          ),
          getTopLeaderboardEntries(
            communityIssuer,
            LeaderboardEntryType.USER_REGISTRATION_ONBOARDING
          ),
        ]);
      } catch (error) {
        console.error("Error getting user leaderboard info:", error);
        toast.error("Error getting user leaderboard info.");
        router.push("/profile");
        return;
      }

      if (
        !fetchedUser ||
        !totalTapDetails ||
        !totalTapEntries ||
        !githubDetails ||
        !githubEntries ||
        !stravaDetails ||
        !stravaEntries ||
        !embassyTotalWorkoutDetails ||
        !embassyTotalWorkoutEntries
      ) {
        toast.error("User leaderboard info not found.");
        router.push("/profile");
        return;
      }

      if (!totalOnboardingDetails || !totalOnboardingEntries) {
        toast.error("User onboarding leaderboard info not found.");
        router.push("/profile");
        return;
      }

      setUser(fetchedUser);

      setLeaderboardTapDetails(totalTapDetails);
      setLeaderboardTapEntries(totalTapEntries);

      setLeaderboardOnboardingDetails(totalOnboardingDetails);
      setLeaderboardOnboardingEntries(totalOnboardingEntries);

      setGithubLeaderboardDetails(githubDetails);
      setGithubLeaderboardEntries(githubEntries);

      setStravaLeaderboardDetails(stravaDetails);
      setStravaLeaderboardEntries(stravaEntries);

      setEmbassyTotalWorkoutDetails(embassyTotalWorkoutDetails);
      setEmbassyTotalWorkoutEntries(embassyTotalWorkoutEntries);

      const props: CommunityCardProps[] = [
        {
          image: "/images/week.png",
          title: "User Onboarding Leaderboard 🤝",
          description: `${totalOnboardingDetails.totalValue} of ${UserOnboardingTarget} onboardings`,
          type: "active",
          position: totalOnboardingDetails.userPosition,
          totalContributors: totalOnboardingDetails.totalContributors,
          progressPercentage: Math.min(
            100,
            Math.round((totalOnboardingDetails.totalValue / UserOnboardingTarget) * 100)
          ),
          dashboard: DisplayedDashboard.USER_REGISTRATION_ONBOARDING,
        },
        {
          image: "/images/buildclub.png",
          title: "GitHub Commit Leaderboard 👩‍💻",
          description: `${githubDetails.totalValue} of ${GithubCommitTarget} contributions`,
          type: "active",
          position: githubDetails.userPosition,
          totalContributors: githubDetails.totalContributors,
          progressPercentage: Math.min(
            100,
            Math.round((githubDetails.totalValue / GithubCommitTarget) * 100)
          ),
          dashboard: DisplayedDashboard.GITHUB,
        },
        {
          image: "/images/hand.png",
          title: "Tap Leaderboard 🏆",
          description: `${totalTapDetails.totalValue} of ${TapTarget} taps`,
          type: "active",
          position: totalTapDetails.userPosition,
          totalContributors: totalTapDetails.totalContributors,
          progressPercentage: Math.min(
            100,
            Math.round((totalTapDetails.totalValue / TapTarget) * 100)
          ),
          dashboard: DisplayedDashboard.EMBASSY_TAP_COUNT,
        },
        {
          image: "/images/runclub.png",
          title: "Embassy Run Club 🏃‍♂️",
          description: `${(stravaDetails.totalValue / 1000).toFixed(
            2
          )} of ${StravaRunTarget} km`,
          type: "active",
          position: stravaDetails.userPosition,
          totalContributors: stravaDetails.totalContributors,
          progressPercentage: Math.min(
            100,
            Math.round((stravaDetails.totalValue / (StravaRunTarget * 1000)) * 100)
          ),
          dashboard: DisplayedDashboard.STRAVA,
        },
        {
          image: "/images/yoga.png",
          title: "Embassy Workouts 🥊",
          description: `${embassyTotalWorkoutDetails.totalValue} of ${WorkoutTarget} workouts`,
          type: "active",
          position: embassyTotalWorkoutDetails.userPosition,
          totalContributors: embassyTotalWorkoutDetails.totalContributors,
          progressPercentage: Math.min(
            100,
            Math.round((embassyTotalWorkoutDetails.totalValue / WorkoutTarget) * 100)
          ),
          dashboard: DisplayedDashboard.EMBASSY_TOTAL_WORKOUTS,
        },
      ];

      setCardProps(props);
    };

    fetchInfo();
  }, [router]);

  if (
    leaderboardTapDetails &&
    leaderboardTapEntries &&
    displayedDashboard === DisplayedDashboard.EMBASSY_TAP_COUNT
  ) {
    return (
      <DashboardDetail
        image="/images/social-graph-wide.png"
        title="Tap Leaderboard 🏆"
        description={
          <>
            <span>
              Grow the Embassy Social Graph by tapping NFC chips to share
              socials and discover common and complementary interests!
            </span>
          </>
        }
        leaderboardDetails={leaderboardTapDetails}
        leaderboardEntries={leaderboardTapEntries}
        goal={TapTarget}
        unit="tap"
        organizer="Conspirio"
        organizerDescription="Cryptography for human connection"
        type="active"
        returnToHome={() => setDisplayedDashboard(DisplayedDashboard.NONE)}
      />
    );
  }

  if (
    leaderboardOnboardingDetails &&
    leaderboardOnboardingEntries &&
    displayedDashboard === DisplayedDashboard.USER_REGISTRATION_ONBOARDING
  ) {
    return (
      <DashboardDetail
        image="/images/week-wide.png"
        title="User Onboarding Leaderboard 🤝"
        description={
          <>
            <span>
              Bring your friends into the Conspirio community! Tap them before
              registration, guide them through the registration process, and get
              credit for onboarding.
            </span>
          </>
        }
        leaderboardDetails={leaderboardOnboardingDetails}
        leaderboardEntries={leaderboardOnboardingEntries}
        goal={UserOnboardingTarget}
        unit="invites"
        organizer="Conspirio"
        organizerDescription="Cryptography for human connection"
        type="active"
        returnToHome={() => setDisplayedDashboard(DisplayedDashboard.NONE)}
      />
    );
  }

  if (
    githubLeaderboardDetails &&
    githubLeaderboardEntries &&
    displayedDashboard === DisplayedDashboard.GITHUB
  ) {
    return (
      <DashboardDetail
        image="/images/buildclub_wide.png"
        title="Hacker Club 👩‍💻"
        description={`Share your open source GitHub contributions over the last year with the Builder community!`}
        leaderboardDetails={githubLeaderboardDetails}
        leaderboardEntries={githubLeaderboardEntries}
        goal={GithubCommitTarget}
        unit="contribution"
        organizer="Conspirio"
        organizerDescription="Cryptography for human connection"
        actionItem={
          user &&
          (!user.oauth ||
            (user.oauth && !Object.keys(user?.oauth).includes("github"))) && (
            <div
              className="w-full"
              onClick={() => logClientEvent("community-github-clicked", {})}
            >
              <ImportGithubButton fullWidth />
            </div>
          )
        }
        type="active"
        returnToHome={() => setDisplayedDashboard(DisplayedDashboard.NONE)}
      />
    );
  }

  if (
    stravaLeaderboardDetails &&
    stravaLeaderboardEntries &&
    displayedDashboard === DisplayedDashboard.STRAVA
  ) {
    return (
      <DashboardDetail
        image="/images/runclub_wide.png"
        title="Embassy Run Club 🏃‍♂️"
        description={`Share your Strava running distance to participate in the Embassy Run Club!`}
        leaderboardDetails={{
          ...stravaLeaderboardDetails,
          totalValue: stravaLeaderboardDetails.totalValue / 1000,
        }}
        leaderboardEntries={{
          entries: stravaLeaderboardEntries.entries.map((entry) => ({
            ...entry,
            entryValue: entry.entryValue / 1000,
          })),
        }}
        goal={StravaRunTarget}
        unit="km"
        organizer="Conspirio"
        organizerDescription="Cryptography for human connection"
        actionItem={
          user &&
          (!user.oauth ||
            (user.oauth && !Object.keys(user?.oauth).includes("strava"))) && (
            <div
              className="w-full"
              onClick={() => logClientEvent("community-strava-clicked", {})}
            >
              <ImportStravaButton fullWidth />
            </div>
          )
        }
        type="active"
        returnToHome={() => setDisplayedDashboard(DisplayedDashboard.NONE)}
      />
    );
  }

  if (
    embassyTotalWorkoutDetails &&
    embassyTotalWorkoutEntries &&
    displayedDashboard === DisplayedDashboard.EMBASSY_TOTAL_WORKOUTS
  ) {
    return (
      <DashboardDetail
        image="/images/runclub_wide.png"
        title="Embassy Workouts 🥊"
        description={
          "Help us reach the Embassy goal of 50 workouts during the month!"
        }
        leaderboardDetails={embassyTotalWorkoutDetails}
        leaderboardEntries={embassyTotalWorkoutEntries}
        goal={WorkoutTarget}
        unit="workout"
        organizer="Conspirio"
        organizerDescription="Cryptography for human connection"
        type="active"
        returnToHome={() => setDisplayedDashboard(DisplayedDashboard.NONE)}
        prize={true}
      />
    );
  }

  // NOTE: Add a Banner about picking up chip -- who to get from? how to register?
  return (
    <>
      <div className="py-3">
        <ChipPickup />
      </div>
      {!leaderboardTapDetails ||
      !leaderboardTapEntries ||
      !leaderboardOnboardingDetails ||
      !leaderboardOnboardingEntries ? (
        <div className="flex justify-center items-center pt-4">
          <CursiveLogo isLoading />
        </div>
      ) : (
        <div className="flex flex-col gap-6 pt-2 pb-6">
          <div className="flex flex-col gap-2">
            <span className="text-base font-bold text-label-primary font-sans">
              {`Dashboards`}
            </span>
            {cardProps?.map((prop: CommunityCardProps, index) => {
              return prop.past ? (
                <></>
              ) : (
                <div
                  key={index}
                  onClick={() => {
                    logClientEvent("community-dashboard-clicked", {
                      title: prop?.title,
                    });
                    setDisplayedDashboard(
                      prop?.dashboard || DisplayedDashboard.NONE
                    );
                  }}
                >
                  <CommunityCard
                    image={prop?.image}
                    type="active"
                    title={prop?.title}
                    description={prop?.description}
                    progressPercentage={prop?.progressPercentage}
                    position={prop?.position}
                    totalContributors={prop?.totalContributors}
                    dashboard={prop?.dashboard}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
