import { Icons } from "@/components/icons/Icons";
import { Tag } from "@/components/ui/Tag";
import { cn } from "@/lib/frontend/util";
import { getSpotifyAuthorizeUrl } from "@/lib/oauth";
import { errorToString } from "@types";
import { toast } from "sonner";

const ImportSpotifyButton = ({
  addElement = true,
  fullWidth = false,
}: {
  addElement?: boolean;
  fullWidth?: boolean;
}) => {
  // PKCE challenge must be generated before redirecting, so this can't be a static Link
  const handleClick = async () => {
    try {
      window.location.href = await getSpotifyAuthorizeUrl();
    } catch (error) {
      console.error("Unable to start Spotify OAuth flow:", errorToString(error));
      toast.error("Unable to connect Spotify");
    }
  };

  return (
    <div className="cursor-pointer" onClick={handleClick}>
      <Tag
        emoji={<Icons.Spotify />}
        variant="transparent"
        text="Spotify"
        className={cn(
          "!bg-[#1DB954] !text-white self-start pl-4",
          addElement ? "pr-8" : "pr-4",
          fullWidth ? "w-full" : "min-w-max"
        )}
        addElement={addElement}
        refresh={!addElement}
        fullWidth={fullWidth}
      />
    </div>
  );
};

export default ImportSpotifyButton;
