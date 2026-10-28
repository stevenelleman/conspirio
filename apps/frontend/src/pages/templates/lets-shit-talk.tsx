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
import { fuzzyMatch } from "@/lib/frontend/util";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { updateChip } from "@/lib/chip/update";
import { loveToHate, petPeeves, socialIssues } from "@/lib/storage/types/user/dislikes";

type DislikesFormData = {
  publicDefender: string[],
  petPeeves: string[],
  loveToHate: string[]
};

export default function LetsShitTalkPage() {
  const router = useRouter();
  const [contributeAnonymouslyPublicDefender, setContributeAnonymouslyPublicDefender] = useState(false);
  const [contributeAnonymouslyPetPeeves, setContributeAnonymouslyPetPeeves] = useState(false);
  const [contributeAnonymouslyLoveToHate, setContributeAnonymouslyLoveToHate] = useState(false);

  const [disclosePublicDefender, setDisclosePublicDefender] = useState(false);
  const [disclosePetPeeves, setDisclosePetPeeves] = useState(false);
  const [discloseLoveToHate, setDiscloseLoveToHate] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset } = useForm<DislikesFormData>();

  useEffect(() => {
    const fetchUser = async () => {
      const { user, session } = await storage.getUserAndSession();
      if (user && session && new Date() < session.authTokenExpiresAt) {
        reset({
          publicDefender: user.userData?.dislikesPublicDefender || [],
          petPeeves: user.userData?.dislikesPetPeeves || [],
          loveToHate: user.userData?.dislikesLoveToHate || [],
        });

        setDisclosePublicDefender(user.userData?.settings?.discloseDislikesPublicDefender || false);
        setDisclosePetPeeves(user.userData?.settings?.discloseDislikesPetPeeves || false);
        setDiscloseLoveToHate(user.userData?.settings?.discloseDislikesLoveToHate || false);
      } else {
        toast.error("Please log in to view your profile.");
        router.push("/");
      }
    };

    fetchUser();
  }, [router]);

  const onHandleSubmit = async (formData: DislikesFormData) => {
    setLoading(true);
    const {
      publicDefender,
      petPeeves,
      loveToHate,
    } = formData;

    // Implement save functionality here for anonymous contributions

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
        dislikesPublicDefender: publicDefender,
        dislikesPetPeeves: petPeeves,
        dislikesLoveToHate: loveToHate,
        settings: {
          ...user.userData.settings,
          discloseDislikesPublicDefender: disclosePublicDefender,
          discloseDislikesPetPeeves: disclosePetPeeves,
          discloseDislikesLoveToHate: discloseLoveToHate,
        }
      });

      try {
        // Once UserData successfully updated, update userChips
        for (const chip of user!.chips) {

          const disclosedAndNonEmptyPublicDefender = disclosePublicDefender && publicDefender && publicDefender.length > 0;
          const disclosedAndNonEmptyPetPeeves = disclosePetPeeves && petPeeves && petPeeves.length > 0;
          const disclosedAndNonEmptyLoveToHate = discloseLoveToHate && loveToHate && loveToHate.length > 0;

          // TODO: Add a function that updates only the inputted value, it'd be safer from forgetting values
          //  In refactor PR, apply structuredClone to userData, and only update relevant values

          // Connection info comes from tap, and tap comes from the specific user chip
          await updateChip({
            authToken: session!.authTokenValue,
            chipIssuer: chip.issuer,
            chipId: chip.id,

            // Updated value, if disclose is false, set to empty list
            ownerDislikesPublicDefender: disclosedAndNonEmptyPublicDefender ? publicDefender : null,
            ownerDislikesPetPeeves: disclosedAndNonEmptyPetPeeves ? petPeeves: null,
            ownerDislikesLoveToHate: disclosedAndNonEmptyLoveToHate ? loveToHate: null,

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
            ownerPublicInterests: user.userData.publicInterests ?? null,

            ownerPublicCareOfferings: user.userData.publicCareOfferings ?? null,
            ownerPublicCareAsks: user.userData.publicCareAsks ?? null,
            ownerSettings: {
              ...user.userData?.settings,
              discloseDislikesPublicDefender: disclosedAndNonEmptyPublicDefender,
              discloseDislikesPetPeeves: disclosePetPeeves,
              discloseDislikesLoveToHate: discloseLoveToHate
            }
          });
        }
      } catch (error) {
        console.log("uh oh", errorToString(error))
        toast.success("Lets Shit Talk did not save successfully!");
        router.push("/profile");
      }


      logClientEvent("lets-shit-talk", {});

      toast.success("Lets Shit Talk saved successfully!");
      router.push("/profile");
    } catch (error) {
      console.error(error);
      toast(
        SupportToast(
          "",
          true,
          "Failed to save Lets Shit Talk. Please try again",
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
            Lets Shit Talk 💩
          </span>
          <span className="text-[14px] font-normal text-label-secondary">
            {`Sometimes it's faster to connect on what you're *jointly against* than what you're jointly for (that's much harder... that actually requires solutions...). Dislikes will be private by default and only revealed if held in common.`}
            <br/>
          </span>
        </div>
        <div className="flex flex-col gap-4">
          <AppInputsFuzzyMatch
            label="🛡️ Public Defender"
            placeholder="What do you stand against?"
            options={socialIssues}
            fuzzySearch={fuzzyMatch}
            autoCapitalize="off"
            {...register("publicDefender")}
          />
        </div>
        <span className="text-[14px] font-normal text-label-secondary">
          Missing any options? <Link className="underline font-bold" href={`${SUPPORT_CONTACT}?text=Please add these missing public defender options.`}>Tell the support team.</Link>
        </span>
        <div className="flex flex-col gap-4 mt-4">
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={disclosePublicDefender}
              onChange={(e) => setDisclosePublicDefender(e.target.checked)}
              className="form-checkbox h-5 w-5 text-label-primary"
            />
            <span className="text-sm text-label-primary">
              Add to Public Disclosures.
            </span>
          </label>
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={contributeAnonymouslyPublicDefender}
              onChange={(e) => setContributeAnonymouslyPublicDefender(e.target.checked)}
              className="form-checkbox h-5 w-5 text-label-primary"
            />
            {/*TODO: Add to UserSettings*/}
            <span className="text-sm text-label-primary">
              Anonymously contribute my answers to community dashboards.
            </span>
          </label>
        </div>
        <div className="flex flex-col gap-4">
          <AppInputsFuzzyMatch
            label="😤 Pet Peeves"
            placeholder="What can't you stand?"
            options={petPeeves}
            fuzzySearch={fuzzyMatch}
            autoCapitalize="off"
            {...register("petPeeves")}
          />
        </div>
        <span className="text-[14px] font-normal text-label-secondary">
          Missing any options? <Link className="underline font-bold" href={`${SUPPORT_CONTACT}?text=Please add these missing 'pet peeves' options:`}>Tell the support team.</Link>
        </span>
        <div className="flex flex-col gap-4 mt-4">
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={disclosePetPeeves}
              onChange={(e) => setDisclosePetPeeves(e.target.checked)}
              className="form-checkbox h-5 w-5 text-label-primary"
            />
            <span className="text-sm text-label-primary">
              Add to Public Disclosures.
            </span>
          </label>
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={contributeAnonymouslyPetPeeves}
              onChange={(e) => setContributeAnonymouslyPetPeeves(e.target.checked)}
              className="form-checkbox h-5 w-5 text-label-primary"
            />
            {/*TODO: Add to UserSettings*/}
            <span className="text-sm text-label-primary">
              Anonymously contribute my answers to community dashboards.
            </span>
          </label>
        </div>
        <div className="flex flex-col gap-4">
          <AppInputsFuzzyMatch
            label="😈 Love to Hate"
            placeholder="Nuff said"
            options={loveToHate}
            fuzzySearch={fuzzyMatch}
            autoCapitalize="off"
            {...register("loveToHate")}
          />
        </div>
        <span className="text-[14px] font-normal text-label-secondary">
          Missing any options? <Link className="underline font-bold" href={`${SUPPORT_CONTACT}?text=Please add these missing 'love to hate' options:`}>Tell the support team.</Link>
        </span>
        <div className="flex flex-col gap-4 mt-4">
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={discloseLoveToHate}
              onChange={(e) => setDiscloseLoveToHate(e.target.checked)}
              className="form-checkbox h-5 w-5 text-label-primary"
            />
            <span className="text-sm text-label-primary">
              Add to Public Disclosures.
            </span>
          </label>
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={contributeAnonymouslyLoveToHate}
              onChange={(e) => setContributeAnonymouslyLoveToHate(e.target.checked)}
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
