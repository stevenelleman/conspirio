import { AppButton } from "@/components/ui/Button";
import AppLayout from "@/layouts/AppLayout";
import { storage } from "@/lib/storage";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { logClientEvent } from "@/lib/frontend/metrics";
import { SupportToast } from "@/components/ui/SupportToast";
import { errorToString } from "@types";
import { SUPPORT_CONTACT } from "@/constants";
import { AppInputsFuzzyMatch } from "@/components/ui/AppInputsFuzzyMatch";
import { cares } from "@/lib/storage/types/user/cares";
import { fuzzyMatch } from "@/lib/frontend/util";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { updateChip } from "@/lib/chip/update";

type CareFormData = {
  publicOfferings?: string[],
  privateOfferings?: string[],
  publicAsks?: string[],
  privateAsks?: string[],
};

export default function ComplementaryCarePage() {
  const router = useRouter();
  const [contributeAnonymously, setContributeAnonymously] = useState(false);
  const [revealAnswers, setRevealAnswers] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset } = useForm<CareFormData>();

  useEffect(() => {
    const fetchUser = async () => {
      const { user, session } = await storage.getUserAndSession();
      if (user && session && new Date() < session.authTokenExpiresAt) {
        reset({
          publicOfferings: user.userData?.publicCareOfferings || [],
          privateOfferings: user.userData?.privateCareOfferings || [],
          publicAsks: user.userData?.publicCareAsks || [],
          privateAsks: user.userData?.privateCareAsks || [],
        });
      } else {
        toast.error("Please log in to view your profile.");
        router.push("/");
      }
    };

    fetchUser();
  }, [router]);

  const onHandleSubmit = async (formData: CareFormData) => {
    setLoading(true);
    const {
      publicOfferings,
      privateOfferings,
      publicAsks,
      privateAsks,
    } = formData;

    // Implement save functionality here
    console.log("Contribute anonymously:", contributeAnonymously);
    // You can add logic to save these preferences to your backend or local storage

    const { user, session } = await storage.getUserAndSession();
    if (!user || !session) {
      toast.error("Please log in to submit your cares.");
      router.push("/");
      return;
    }

    // TODO: Similar to other personalWebsites what is difference between null vs undefined vs []?

    try {
      await storage.updateUserData({
        ...user.userData,
        publicCareOfferings: publicOfferings,
        privateCareOfferings: privateOfferings,
        publicCareAsks: publicAsks,
        privateCareAsks: privateAsks,
      });

      // Only update chips if public offerings or asks defined
      if (publicOfferings || publicAsks) {
        try {
          // Once UserData successfully updated, update userChips
          for (const chip of user!.chips) {

            // This fixes the website value if it was [] accidentally:
            // const personalWebsites = user.userData.personalWebsites?.websites &&
            // user.userData.personalWebsites?.websites.length > 0 ? user.userData.personalWebsites?.websites: null;

            // TODO: Add a function that updates only the inputted value, it'd be safer from forgetting values
            await updateChip({
              authToken: session!.authTokenValue,
              chipIssuer: chip.issuer,
              chipId: chip.id,

              // Updated values
              ownerPublicCareOfferings: publicOfferings ?? null,
              ownerPublicCareAsks: publicAsks ?? null,
              // Specifically do not add private offerings or asks

              // All other retain existing values
              ownerPublicInterests: user.userData.publicInterests ?? null,
              ownerDisplayName: user.userData.displayName ?? null,
              ownerBio: user.userData.bio ?? null,
              ownerTwitterUsername: user.userData.twitter?.username ?? null,
              ownerTelegramUsername: user.userData.telegram?.username ?? null,
              ownerSignalUsername: user.userData.signal?.username ?? null,
              ownerInstagramUsername: user.userData.instagram?.username ?? null,
              ownerFarcasterUsername: user.userData.farcaster?.username ?? null,
              ownerEmail: user.userData.email?.address ?? null,
              ownerSMSNumber: user.userData.sms?.number ?? null,
              ownerWhatsappNumber: user.userData.whatsapp?.number ?? null,
              ownerPersonalWebsites: user.userData.personalWebsites?.websites ?? null,
              ownerSubstack: user.userData.substack?.handle ?? null,
              ownerPronouns: user.userData.pronouns ?? null,
              ownerDislikesPublicDefender: user.userData.dislikesPublicDefender ?? null,
              ownerDislikesPetPeeves: user.userData.dislikesPetPeeves ?? null,
              ownerDislikesLoveToHate: user.userData.dislikesLoveToHate ?? null,
              ownerSettings: {
                ...user.userData?.settings,
              },
            });
          }

        } catch (error) {
          console.log("uh oh", errorToString(error))
          toast.error("Complementary care did not save successfully!");
          router.push("/profile");
        }
      }


      logClientEvent("submit-complementary-care", {});

      toast.success("Complementary care saved successfully!");
      router.push("/profile");
    } catch (error) {
      console.error(error);
      toast(
        SupportToast(
          "",
          true,
          "Failed to save complementary care. Please try again",
          SUPPORT_CONTACT,
          errorToString(error)
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout
      withContainer={false}
      showFooter={false}
      back={{ label: "Back", href: "/profile" }}
    >
      <div className="flex flex-col p-4 gap-4">
        <div className="flex flex-col gap-2">
          <span className="text-[14px] font-semibold text-label-primary">
            🫶 Complementary Care 🥰
          </span>
          <span className="text-[14px] font-normal text-label-secondary">
            {`For the right person, it can be a gift to give, while for the wrong person, it is a burden. Often the trick is make the difference explicit and not expect forms of care from people who regard them as a chore, rather than a gift. In this template we want to make it explicit where such complementary offerings and asks meet, where it is both a gift to give and gift to receive.`}
            <br/>
            <br/>
            Missing any cares? <Link className="underline font-bold" href={SUPPORT_CONTACT}>Inform the support team...</Link>
          </span>
        </div>
        <div className="flex flex-col gap-4">
          <AppInputsFuzzyMatch
            label="Public Offerings"
            placeholder="Offerings"
            options={cares}
            fuzzySearch={fuzzyMatch}
            autoCapitalize="off"
            {...register("publicOfferings")}
          />
        </div>
        <div className="flex flex-col gap-4">
          <AppInputsFuzzyMatch
            label="Private Offerings"
            placeholder="Offerings"
            options={cares}
            fuzzySearch={fuzzyMatch}
            autoCapitalize="off"
            {...register("privateOfferings")}
          />
        </div>
        <div className="flex flex-col gap-4">
          <AppInputsFuzzyMatch
            label="Public Asks"
            placeholder="Asks"
            options={cares}
            fuzzySearch={fuzzyMatch}
            autoCapitalize="off"
            {...register("publicAsks")}
          />
        </div>
        <div className="flex flex-col gap-4">
          <AppInputsFuzzyMatch
            label="Private Asks"
            placeholder="Asks"
            options={cares}
            fuzzySearch={fuzzyMatch}
            autoCapitalize="off"
            {...register("privateAsks")}
          />
        </div>
        <div className="flex flex-col gap-4 mt-4">
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={revealAnswers}
              onChange={(e) => setRevealAnswers(e.target.checked)}
              className="form-checkbox h-5 w-5 text-label-primary"
            />
            <span className="text-sm text-label-primary">
              Reveal my answers when discovering overlap with someone else.
            </span>
          </label>
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={contributeAnonymously}
              onChange={(e) => setContributeAnonymously(e.target.checked)}
              className="form-checkbox h-5 w-5 text-label-primary"
            />
            {/*TODO: Add to UserSettings*/}
            <span className="text-sm text-label-primary">
              Anonymously contribute my answers to community dashboards.
            </span>
          </label>
        </div>
        <AppButton
          type="button"
          onClick={handleSubmit(onHandleSubmit)}
          size="md"
          variant="primary"
          className="mt-4"
          loading={loading}
        >
          Save
        </AppButton>
      </div>
    </AppLayout>
  );
}
