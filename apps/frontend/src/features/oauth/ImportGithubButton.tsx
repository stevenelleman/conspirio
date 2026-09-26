import { Icons } from "@/components/icons/Icons";
import { Tag } from "@/components/ui/Tag";
import { cn } from "@/lib/frontend/util";
import Link from "next/link";
import { GITHUB_IMPORT_URL } from "@/config";

const ImportGithubButton = ({
  addElement = true,
  fullWidth = false,
}: {
  addElement?: boolean;
  fullWidth?: boolean;
}) => {
  return (
    <Link
      href={GITHUB_IMPORT_URL}
    >
      <Tag
        emoji={<Icons.GitHub />}
        variant="gray"
        text="GitHub"
        className={cn("pl-4 pr-8", fullWidth ? "w-full" : "min-w-max")}
        addElement={addElement}
        refresh={!addElement}
        fullWidth={fullWidth}
      />
    </Link>
  );
};

export default ImportGithubButton;
