import useSettings from "@/hooks/useSettings";
import { cn } from "@/lib/frontend/util";
import Image from "next/image";
// import Link from "next/link";

export const StoreBanner = () => {
  const { darkTheme } = useSettings();
  return (
    <div className="flex flex-col gap-1">
      <span className="text-base font-bold font-sans text-label-primary">
        Merch store
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
              src="/images/shop-cover-ethindia.png"
              alt="shop cover"
              width={80}
              height={80}
              className="w-20 h-20 rounded-lg object-cover"
            />
          </div>
          <div className="flex flex-col flex-1">
            {/* <p className="text-xs font-bold text-label-quaternary">47 taps</p> */}
            <h2 className="text-sm font-bold text-label-primary">
              Get merch by onboarding people!
            </h2>
            <p className="text-xs font-medium text-label-quaternary">
              Featuring hand-made NFC bracelets and Cursive T-shirts. Find them
              at the Cursive / PSE booth!
            </p>
          </div>
        </div>
      </div>
    </div>
    // </Link>
  );
};
