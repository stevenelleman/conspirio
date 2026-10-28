import { Icons } from "@/components/icons/Icons";
import { Tag } from "@/components/ui/Tag";
import { cn } from "@/lib/frontend/util";
import Link from "next/link";
import { GOOGLE_CALENDAR_IMPORT_URL } from "@/config";

const ImportGoogleCalendarButton = ({
  addElement = true,
  fullWidth = false,
}: {
  addElement?: boolean;
  fullWidth?: boolean;
}) => {
  return (
    <Link
      href={GOOGLE_CALENDAR_IMPORT_URL}
    >
      <Tag
        emoji={<Icons.GoogleCalendar />}
        variant="gray"
        text="Google Calendar"
        className={cn("pl-4 pr-8", fullWidth ? "w-full" : "min-w-max")}
        addElement={addElement}
        refresh={!addElement}
        fullWidth={fullWidth}
      />
    </Link>
  );
};

export default ImportGoogleCalendarButton;
