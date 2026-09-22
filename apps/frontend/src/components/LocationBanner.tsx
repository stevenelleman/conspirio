import useSettings from "@/hooks/useSettings";
import { cn } from "@/lib/frontend/util";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/router";

export const LocationBanner = ({ community }: {community: string}) => {
  const router = useRouter();
  const { darkTheme } = useSettings();
  if (!community) {
    toast.error("Error getting community.");
    router.push("/community");
  }
  console.log("Community", community)
  const lower = community.toString().toLowerCase();
  return (
    <Link href={`/community/${lower}/location`}>
      <div className="flex flex-col gap-1">
        <span className="text-base font-bold font-sans text-label-primary">
          Chip Locations
        </span>
        <div
          className={cn(
            "w-full rounded-lg border border-primary ",
            darkTheme ? "!border !border-white bg-card-gray" : "bg-white"
          )}
        >
          <div className="p-2 flex items-center gap-[10px]">
            <div className="flex-shrink-0">
              <Image
                src="/images/location-chip-purple.png"
                alt="chip pickup"
                width={80}
                height={80}
                className="w-20 h-20 rounded-lg object-cover"
              />
            </div>
            <div className="flex flex-col flex-1">
              {/* <p className="text-xs font-bold text-label-quaternary">47 taps</p> */}
              <h2 className="text-sm font-bold text-label-primary">
                Discover location chips around Embassy!
              </h2>
              <p className="text-xs font-medium text-label-quaternary">
                To track activities and narrowcast to friends to join (or stay away!).
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};