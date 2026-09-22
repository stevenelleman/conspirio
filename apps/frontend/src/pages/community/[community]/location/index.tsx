

// Use UI for connection for locations
// Implement ProfilePicture

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { storage } from "@/lib/storage";
import { Locations, Location } from "@/lib/storage/types";
import AppLayout from "@/layouts/AppLayout";
import { MdKeyboardArrowRight as ArrowRight } from "react-icons/md";
//import { ProfileImage } from "@/components/ui/ProfileImage";
import useSettings from "@/hooks/useSettings";
import { useRouter } from "next/router";
import { cn } from "@/lib/frontend/util";
//import { logClientEvent } from "@/lib/frontend/metrics";
import { Icons } from "@/components/icons/Icons";
import { AppInput } from "@/components/ui/AppInput";
import { getCommunityLocations } from "@/lib/chip/location";
import { ChipIssuer } from "@types";

const LocationListItem: React.FC<{
  location: Location;
  index: number;
  darkTheme: boolean;
}> = ({index, darkTheme, location }) => {
  return (
    <li
      key={location.id}
      className="p-4"
      style={{
        borderTop:
          index === 0 && darkTheme
            ? "0.5px solid rgba(255, 255, 255, 0.20)"
            : "0.5px solid rgba(0, 0, 0, 0.20)",
        borderBottom: darkTheme
          ? "0.5px solid rgba(255, 255, 255, 0.20)"
          : "0.5px solid rgba(0, 0, 0, 0.20)",
      }}
    >
      <Link
        className="grid grid-cols-[1fr_20px] items-center gap-4"
        href={`/community/${location.chipIssuer.toLowerCase()}/location/${location.id}`}
      >
        <div className="flex items-center gap-4">
          {/*<ProfileImage user={connection.user} />*/}
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-label-primary">
              {location.locationName /*connection.user.displayName*/}
            </span>
            <span className="text-xs text-label-secondary font-medium">
              @{/*connection.user.username*/}
            </span>
          </div>
        </div>
        <ArrowRight className="ml-auto" />
      </Link>
    </li>
  );
};

type SearchResults = {
  names: Record<string, Location>;
  bios: Record<string, Location>;
  notes: Record<string, Location>;
  labels: Record<string, Location>;
};

const LocationsPage: React.FC = () => {
  const router = useRouter();
  const { community } = router.query;
  const { darkTheme } = useSettings();
  const [locations, setLocations] = useState<Locations | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResults | null>(
    null
  );

  useEffect(() => {
    const fetchLocations = async () => {
      const user = await storage.getUser();
      if (!user) {
        router.push("/");
        return;
      }

      // Get ChipIssuer from path param
      const communityUpperCase = community?.toString().toUpperCase() || "";
      const chipIssuer = Object.values(ChipIssuer).includes(communityUpperCase as ChipIssuer) ? communityUpperCase as ChipIssuer : null;
      if (!chipIssuer) {
        // Only possible option is that the given community isn't an option
        router.push("/community");
        return;
      }

      const locations = await getCommunityLocations(chipIssuer);
      setLocations(locations);
    };

    fetchLocations();
  }, [router]);

  const handleUpdateSearchQuery = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    const query = e.target.value.toLowerCase();

    if (!query) {
      setSearchResults(null);
      return;
    }

    // TODO: Add back search results in a follow up PR.
    /*const results: SearchResults = {
      names: {},
      descriptions: {},
      //notes: {},
      //labels: {},
    };*/

    // Still use, but for location chips
    /*Object.entries(connections).forEach(([key, connection]) => {
      // Search display name and username
      const displayName = connection.user.displayName;
      const username = connection.user.username;
      if (
        (displayName && displayName.toLowerCase().includes(query)) ||
        (username && username.toLowerCase().includes(query))
      ) {
        results.names[key] = connection;
      }

      // Search bio
      const bio = connection.user.bio;
      if (bio && bio.toLowerCase().includes(query)) {
        results.bios[key] = connection;
      }

      // Search private notes
      const note = connection.comment?.note;
      if (note && note.toLowerCase().includes(query)) {
        results.notes[key] = connection;
      }

      // Search emoji labels
      const emoji = connection.comment?.emoji;
      if (emoji && emoji.toLowerCase().includes(query)) {
        results.labels[key] = connection;
      }
    });*/

    // setSearchResults(results);
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
  };

  if (isSearchOpen) {
    return (
      <AppLayout
        seoTitle="Locations"
        header={
          <div className="flex flex-col w-full mx-2">
            <div className="flex items-center gap-4 py-4">
              <button
                onClick={handleCloseSearch}
                className={cn("p-2 rounded-full transition-colors",
                  darkTheme ? "invert hover:bg-gray-800 dark:hover:bg-gray-100" :
                    "hover:bg-gray-100 dark:hover:bg-gray-800")}
                aria-label="Back"
              >
                <span className="text-xl">&lt;</span>
              </button>
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Icons.Search size={24} />
                </div>
                <AppInput
                  type="text"
                  placeholder="Search locations..."
                  value={searchQuery}
                  onChange={handleUpdateSearchQuery}
                />
              </div>
            </div>
            {!searchQuery && (
              <div className="flex justify-center">
                <p className="text-sm text-gray-500 text-center mx-auto">
                  Search across names, bios, notes, and labels
                </p>
              </div>
            )}
          </div>
        }
        className="mx-auto"
        withContainer={false}
      >
        {searchQuery && searchResults && (
          <div className="flex flex-col gap-4 p-4">
            {Object.keys(searchResults.names).length > 0 && (
              <section>
                <h2 className="text-label-secondary mb-2">Contact</h2>
                <div
                  className="h-[2px]"
                  style={{
                    background: `linear-gradient(90deg, #7A74BC 0%, #FF9DF8 39%, #FB5D42 71%, #F00 100%)`,
                  }}
                ></div>
                <ul className="flex flex-col">
                  {Object.values(searchResults.names).map(
                    (location, index) => (
                      <LocationListItem
                        key={location.id}
                        location={location}
                        index={index}
                        darkTheme={darkTheme}
                      />
                    )
                  )}
                </ul>
              </section>
            )}

            {Object.keys(searchResults.bios).length > 0 && (
              <section>
                <h2 className="text-label-secondary mb-2">Bio</h2>
                <div
                  className="h-[2px]"
                  style={{
                    background: `linear-gradient(90deg, #7A74BC 0%, #FF9DF8 39%, #FB5D42 71%, #F00 100%)`,
                  }}
                ></div>
                <ul className="flex flex-col">
                  {Object.values(searchResults.bios).map(
                    (location, index) => (
                      <LocationListItem
                        key={location.id}
                        location={location}
                        index={index}
                        darkTheme={darkTheme}
                      />
                    )
                  )}
                </ul>
              </section>
            )}

            {Object.keys(searchResults.notes).length > 0 && (
              <section>
                <h2 className="text-label-secondary mb-2">Notes</h2>
                <div
                  className="h-[2px]"
                  style={{
                    background: `linear-gradient(90deg, #7A74BC 0%, #FF9DF8 39%, #FB5D42 71%, #F00 100%)`,
                  }}
                ></div>
                <ul className="flex flex-col">
                  {Object.values(searchResults.notes).map(
                    (location, index) => (
                      <LocationListItem
                        key={location.id}
                        location={location}
                        index={index}
                        darkTheme={darkTheme}
                      />
                    )
                  )}
                </ul>
              </section>
            )}

            {Object.keys(searchResults.labels).length > 0 && (
              <section>
                <h2 className="text-label-secondary mb-2">Emoji</h2>
                <div
                  className="h-[2px]"
                  style={{
                    background: `linear-gradient(90deg, #7A74BC 0%, #FF9DF8 39%, #FB5D42 71%, #F00 100%)`,
                  }}
                ></div>
                <ul className="flex flex-col">
                  {Object.values(searchResults.labels).map(
                    (location, index) => (
                      <LocationListItem
                        key={location.id}
                        location={location}
                        index={index}
                        darkTheme={darkTheme}
                      />
                    )
                  )}
                </ul>
              </section>
            )}
          </div>
        )}
      </AppLayout>
    );
  }

  return (
    <AppLayout
      seoTitle="Locations"
      back={{ label: "Back", href: "/community" }}
      header={
        <div className="flex flex-col w-full">
          <div className="flex items-center py-4">
            <span className="text-label-primary text-xl leading-none font-bold tracking-[-0.1px]">
              {`Locations (${locations?.length})`}
            </span>
            <div className="flex ml-auto">
              <button
                onClick={() => setIsSearchOpen(true)}
                className={cn("p-2 rounded-full transition-colors",
                  darkTheme ? "invert hover:bg-gray-800 dark:hover:bg-gray-100":
                    "hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
                aria-label="Search locations"
              >
                <Icons.Search size={24} />
              </button>
            </div>
          </div>
        </div>
      }
      className="mx-auto"
      withContainer={false}
    >
      {/*<div className="w-full px-4 py-4">
        <Banner
          className="justify-center"
          italic={false}
          title={
            <span className="!font-normal text-center">
              <b>Grow your garden </b> by discovering overlap after tap!
              Troubleshoot tapping{" "}
              <a
                href="https://cursive.team/tap-help"
                // TODO: Update url
                className="underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                here
              </a>
              .
            </span>
          }
        />
      </div>*/}
      {!locations || locations.length === 0 ? (
        <div className="p-4 text-center text-label-secondary px-16">
          {`No locations registered yet!`}
        </div>
      ) : (
        <ul className="flex flex-col">
          {/*locations && locations.map((location, index) => (
            <LocationListItem
              key={location.id}
              location={location}
              index={index}
              darkTheme={darkTheme}
            />
          ))*/}
          {locations && (
            <ul className="py-3 grid grid-cols-2 gap-[1px]">
              {Object.values(locations).map((location: Location) => {

                return (
                  <li key={location.id} className=" bg-pink">
                    <div className="grid grid-cols-[1fr_65px] h-[124px] items-center gap-0.5 pt-2 px-4">
                      <div className="flex w-full h-full">
                        <div className="flex flex-col gap-1 pb-2 h-full">
                          <span
                            className={cn(
                              "text-base leading-[22px] font-bold mt-auto line-clamp-2 break-words",
                              darkTheme ? "text-black" : "text-white"
                            )}
                          >
                      <Link
                        className="mt-auto"
                        href={`/community/${location.chipIssuer.toLowerCase()}/location/${location.id}`}
                      >
                        {
                          location.locationName?.split(" ").map((word, index) => word.length > 8 && index === 0 ? `${word.slice(0, 8)}-${word.slice(8)}` : word).join(" ")
                        }
                      </Link>
                    </span>
                        </div>
                      </div>
                      <div className="mt-auto relative w-full h-full">
                        <Link
                          className="mt-auto"
                          href={`/community/${location.chipIssuer.toLowerCase()}/location/${location.id}`}
                        >
                        </Link>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </ul>
      )}
    </AppLayout>
  );
};

export default LocationsPage;
