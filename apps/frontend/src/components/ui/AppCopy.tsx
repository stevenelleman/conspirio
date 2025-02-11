import { cn } from "@/lib/frontend/util";
import Link from "next/link";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const AppCopy = ({ className }: any) => {
  return (
    <span
      className={cn(
        className,
        "text-label-tertiary text-xs font-medium font-sans"
      )}
    >
      Built by{" "}
      <Link
        href="https://github.com/stevenelleman/conspirio/"
        target="_blank"
        className="underline font-bold"
      >
        Conspirio
      </Link>
      .
    </span>
  );
};
