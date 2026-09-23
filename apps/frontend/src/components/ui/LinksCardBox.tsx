import Link from "next/link";

export const LinksCardBox = ({ label, values, hrefs }: {label: string, values: string[], hrefs: string[] }) => {
  return (
      <div className="grid items-center grid-cols-[auto_1fr_auto] gap-1">
        <span className="text-[14px] text-label-tertiary font-sans font-normal">
          {label}
        </span>
        <div className="h-[1px] bg-stroke-quaternary w-full"></div>
        <span className="text-[14px] text-right" style={{ color: "#FF9DF8" }}>
          {
            values && values.map((value: string, index: number) => {
              if (index < values.length - 1) {
                // Add break between values
                return (
                  <>
                    <Link key={index} href={hrefs[index] ?? "#"} target="_blank">
                      {value ?? "N/A"}
                    </Link>
                    <br/>
                  </>
                );
              }

              return (
                <Link key={index} href={hrefs[index] ?? "#"} target="_blank">
                    {value ?? "N/A"}
                </Link>
              );
            })
          }
        </span>
      </div>
  );
};
