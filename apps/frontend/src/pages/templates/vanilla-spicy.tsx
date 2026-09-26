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
import { availableInterests } from "@/lib/storage/types/user/interests";
import { fuzzyMatch } from "@/lib/frontend/util";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { updateChip } from "@/lib/chip/update";

type InterestFormData = {
  vanillaInterests?: string[],
  spicyInterests?: string[]
};

export default function VanillaSpicyPage() {
  const router = useRouter();
  const [contributeAnonymously, setContributeAnonymously] = useState(false);
  const [revealAnswers, setRevealAnswers] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset } = useForm<InterestFormData>();

  useEffect(() => {
    const fetchUser = async () => {
      const { user, session } = await storage.getUserAndSession();
      if (user && session && new Date() < session.authTokenExpiresAt) {
        console.log("Interests", user.userData?.publicInterests, user.userData?.privateInterests)
        reset({
          vanillaInterests: user.userData?.publicInterests || [],
          spicyInterests: user.userData?.privateInterests || [],
        });
      } else {
        toast.error("Please log in to view your profile.");
        router.push("/");
      }
    };

    fetchUser();
  }, [router]);

  const onHandleSubmit = async (formData: InterestFormData) => {
    setLoading(true);
    const {
      vanillaInterests,
      spicyInterests,
    } = formData;

    // Implement save functionality here
    console.log("Contribute anonymously:", contributeAnonymously);
    // You can add logic to save these preferences to your backend or local storage

    const { user, session } = await storage.getUserAndSession();
    if (!user || !session) {
      toast.error("Please log in to submit your interests.");
      router.push("/");
      return;
    }

    // TODO: Similar to other personalWebsites what is difference between null vs undefined vs []?

    try {
      await storage.updateUserData({
        ...user.userData,
        publicInterests: vanillaInterests,
        privateInterests: spicyInterests,
      });

      // Only update chips if vanillaInterests defined
      if (vanillaInterests) {
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

              // Updated value
              ownerPublicInterests: vanillaInterests,
              // Specifically do not add spicyInterests

              // All other retain existing values
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
            });
          }

        } catch (error) {
          console.log("uh oh", errorToString(error))
          toast.success("Vanilla & Spicy did not save successfully!");
          router.push("/profile");
        }
      }


      logClientEvent("submit-vanilla-spicy", {});

      toast.success("Vanilla & Spicy saved successfully!");
      router.push("/profile");
    } catch (error) {
      console.error(error);
      toast(
        SupportToast(
          "",
          true,
          "Failed to save vanilla & spicy. Please try again",
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
            🍦 Vanilla & Spicy 🌶️
          </span>
          <span className="text-[14px] font-normal text-label-secondary">
            {'Vanilla interests will be added to the "Public Disclosures" section of your profile and will be shared' +
              ' publicly. Spicy interests are private by default. When the PSI function is used, shared interests' +
              ' will be revealed, so you see what vanilla and spice you have with others.'}
            <br/>
            <br/>
            Missing any interests? <Link className="underline font-bold" href={SUPPORT_CONTACT}>Tell the support team...</Link> for a friend. 😉
          </span>
        </div>
        <div className="flex flex-col gap-4">
          <AppInputsFuzzyMatch
            label="🍦 Vanilla Interests"
            placeholder="Interests"
            options={availableInterests}
            fuzzySearch={fuzzyMatch}
            autoCapitalize="off"
            {...register("vanillaInterests")}
          />
        </div>
        <div className="flex flex-col gap-4">
          <AppInputsFuzzyMatch
            label="🌶️ Spicy Interests"
            placeholder="Interests"
            options={availableInterests}
            fuzzySearch={fuzzyMatch}
            autoCapitalize="off"
            {...register("spicyInterests")}
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
