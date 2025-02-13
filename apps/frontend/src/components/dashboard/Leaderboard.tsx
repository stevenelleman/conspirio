import {
  LeaderboardDetails,
  LeaderboardEntries,
  LeaderboardEntry,
} from "@types";

interface LeaderboardProps {
  leaderboardEntries: LeaderboardEntries;
  leaderboardDetails: LeaderboardDetails;
  prize?: boolean;
  markedRank?: number;
}

const RING_USERNAMES = [
  "vivek",
  "rachel",
  "Tessla",
  "stevenelleman",
  "andrew",
  "Janine",
  "Cheyenne",
  "Sophiemophie",
  "Timour",
  "Colton",
  "albicodes",
  "James",
  "marcusaurelius",
  "timber",
];

export function Leaderboard({
  leaderboardEntries,
  leaderboardDetails,
  prize = false,
  markedRank = 10,
}: LeaderboardProps) {
  let lastEntryValue = -1;
  let tiedPosition = -1;
  let cursiveCount = 0;
  let dividerSet = false;

  return (
    <div>
      <div className="px-4 py-2 bg-background  justify-between items-start inline-flex w-full">
        <div className="grid grid-cols-[40px_1fr_1fr] justify-start items-start gap-3 w-full">
          <div className="text-label-tertiary text-xs text-center font-medium leading-[140%]">
            #
          </div>
          <div className="text-label-tertiary text-xs font-medium leading-[140%]">
            User name
          </div>
          <div className="text-right text-label-tertiary text-xs font-medium leading-[140%]">
            Entry
          </div>
        </div>
      </div>

      {leaderboardEntries?.entries?.map((entry: LeaderboardEntry, index) => {
        let position = index + 1;

        // Handle ties
        if (entry.entryValue == lastEntryValue) {
          // If equal, use tiedPosition (which is the first position, not last, of the tied entries)
          position = tiedPosition;
        } else {
          // If not equal, update tiedPosition
          tiedPosition = position;
        }

        // Update lastEntryValue
        lastEntryValue = entry.entryValue;

        const styling = {
          positionColor: "bg-background/20",
          positionTextColor: "",
          fontStyling: "text-label-secondary text-[14px] font-normal",
          divider: false,
        };

        const adjustedIndex = prize ? index - cursiveCount : index;

        if (adjustedIndex > markedRank - 1) {
          styling.fontStyling = "text-label-tertiary text-[14px] font-normal";
        }
        if (adjustedIndex === markedRank - 1 && !dividerSet) {
          styling.divider = true;
          dividerSet = true;
        }

        let username = entry.username;
        if (RING_USERNAMES.includes(entry.username)) {
          cursiveCount++;
        }
        const entryValue = entry.entryValue;

        if (position == 1) {
          styling.positionColor = "bg-background";
          styling.positionTextColor = "text-label-primary";
          styling.fontStyling = "text-label-secondary text-[16px] font-medium";
        }

        if (entry.username == leaderboardDetails.username) {
          styling.positionColor = "bg-[#FF9DF8]";
          styling.positionTextColor = "text-label-primary";
          styling.fontStyling = "text-label-primary text-[16px] font-medium";
          username += " (me)";

          if (leaderboardDetails?.userPosition != tiedPosition) {
            // Update position if you're tied with another user
            leaderboardDetails.username = entry.username;
            leaderboardDetails.userPosition = tiedPosition;
          }
        }

        return (
          <div key={index}>
            <div className="h-6 px-4 justify-between items-center inline-flex w-full mb-1 mt-1">
              <div className="grow shrink basis-0 justify-start items-center gap-3 flex">
                <div
                  className={`w-10 h-6 px-1 py-2 ${styling.positionColor} rounded-[67px] justify-center items-center gap-2 flex`}
                >
                  <div
                    className={`text-center text-label-primary ${styling.positionTextColor}  text-sm font-medium leading-[140%]`}
                  >
                    {position}
                  </div>
                </div>
                <div
                  className={`flex flex-row grow shrink basis-0 text-label-secondary ${styling.fontStyling} leading-[140%]`}
                >
                  {username}
                  {prize && RING_USERNAMES.includes(username) && <>{" 💍"}</>}
                </div>
                <div className="justify-start items-start gap-[5px] flex">
                  <div
                    className={`text-right text-label-secondary ${styling.fontStyling} font-sans leading-[140%]`}
                  >
                    {Number.isInteger(entryValue)
                      ? entryValue
                      : entryValue.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
            {styling.divider && (
              <div className="py-2">
                <div className="h-[0px] border border-white/20"></div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
