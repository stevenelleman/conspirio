import { Icons } from "@/components/icons/Icons";
import { AppButton } from "@/components/ui/Button";
import { LinkCardBox } from "@/components/ui/LinkCardBox";
import {
  getProfileBackgroundColor,
  ProfileImage,
} from "@/components/ui/ProfileImage";
import AppLayout from "@/layouts/AppLayout";
import { storage } from "@/lib/storage";
import { User, UserDataType } from "@/lib/storage/types";
import Link from "next/link";
import router from "next/router";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { LinksCardBox } from "@/components/ui/LinksCardBox";
import { AppTagList } from "@/components/ui/AppTagList";

export default function ProfileOverview() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await storage.getUser();
      if (user) {
        setUser(user);
      } else {
        toast.error("User not found");
        router.push("/");
      }
    };

    fetchUser();
  }, []);

  return (
    <AppLayout
      withContainer={false}
      headerDivider
      headerContainer={false}
      header={
        <div className="flex flex-col w-full">
          <div
            className="h-[60px] w-full relative"
            style={{
              background: `linear-gradient(90deg, #FFF 0%, ${getProfileBackgroundColor(
                user?.userData as UserDataType
              )} 100%)`,
            }}
          >
            <div className="absolute left-4 top-[40px]">
              <ProfileImage size={16} user={user?.userData as UserDataType} />
            </div>
            <div className="absolute right-4 top-[70px]">
              <Link href="/profile/edit">
                <AppButton variant="outline" className="w-fit">
                  <Icons.Pencil className="mr-2" />{" "}
                  <span className="text-[14px]">Edit</span>
                </AppButton>
              </Link>
            </div>
          </div>
        </div>
      }
      back={{
        href: "/profile",
        label: "Back",
      }}
    >
      <div className="flex flex-col gap-3 mt-[46px]">
        <div className="flex flex-col px-4">
          <span className="text-[30px] font-semibold tracking-[-0.22px] font-sans text-label-primary">
            {user?.getBioDisplayName}
          </span>
          <span className="text-[14px] font-medium font-sans text-label-tertiary">
            {`@${user?.getBioUsername}`}
          </span>
          {user?.getBioPronouns && (
            <span className="text-[14px] font-medium font-sans text-label-tertiary">
              {user?.getBioPronouns}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-2 p-4">
          <span className="text-sm font-semibold text-label-primary font-sans">
            Socials
          </span>
          <div className="flex flex-col gap-2">
            {!user?.getSocialTelegram?.username &&
              !user?.getSocialTwitter?.username &&
              !user?.getSocialSignal?.username && (
                <span className="text-sm text-label-secondary font-sans font-normal">
                  Add socials by editing your chip details!
                </span>
              )}
            {user?.getSocialEmail?.address && (
              <LinkCardBox
                label="Email"
                value={`${user.getSocialEmail.address}`}
                href={`mailto:${user.getSocialEmail.address}`}
              />
            )}
            {user?.getSocialSms?.number && (
              <LinkCardBox
                label="SMS"
                value={`${user.getSocialSms.number}`}
                href={`sms:+${user.getSocialSms.number}`}
              />
            )}
            {user?.getSocialWhatsapp?.number && (
              <LinkCardBox
                label="Whatsapp"
                value={`${user.getSocialWhatsapp.number}`}
                href={`https://wa.me/${user.getSocialWhatsapp.number}`}
              />
            )}
            {user?.getSocialTelegram?.username && (
              <LinkCardBox
                label="Telegram"
                value={`@${user.getSocialTelegram.username}`}
                href={`https://t.me/${user.getSocialTelegram.username}`}
              />
            )}
            {user?.getSocialTwitter?.username && (
              <LinkCardBox
                label="X"
                value={`@${user.getSocialTwitter.username}`}
                href={`https://x.com/${user.getSocialTwitter.username}`}
              />
            )}
            {user?.getSocialSignal?.username && (
              <LinkCardBox
                label="Signal"
                value={`@${user.getSocialSignal.username}`}
                href={`sgnl://signal.me/#u/${user?.getSocialSignal.username}`}
              />
            )}
            {user?.getSocialInstagram?.username && (
              <LinkCardBox
                label="Instagram"
                value={`@${user.getSocialInstagram.username}`}
                href={`https://www.instagram.com/${user.getSocialInstagram.username}`}
              />
            )}
            {user?.getSocialFarcaster?.username && (
              <LinkCardBox
                label="Farcaster"
                value={`@${user.getSocialFarcaster.username}`}
                href={`https://warpcast.com/${user.getSocialFarcaster.username}`}
              />
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2 p-4">
          <span className="text-sm font-semibold text-label-primary font-sans">
            Portfolio
          </span>
          <div className="flex flex-col gap-2">
            {!user?.getPortfolioPersonalWebsites?.websites &&
              !user?.getPortfolioSubstack?.handle && (
                <span className="text-sm text-label-secondary font-sans font-normal">
                  Add portfolio by editing your chip details!
                </span>
              )}
            {user?.getPortfolioPersonalWebsites?.websites && (
              <LinksCardBox
                label="Personal Websites"
                values={user.getPortfolioPersonalWebsites.websites}
                hrefs={user.getPortfolioPersonalWebsites.websites}
              />
            )}
            {user?.getPortfolioSubstack?.handle && (
              <LinkCardBox
                label="Substack"
                value={`@${user?.getPortfolioSubstack?.handle}`}
                href={`https://substack.com/@${user?.getPortfolioSubstack?.handle}`}
              />
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2 p-4">
          <hr/>
          <a href={"/templates/vanilla-spicy"}>
            <div className="flex items-center gap-1">
                <Icons.Clip className="text-icon-primary" />
                <span className="text-sm font-semibold text-label-primary font-sans">
                  Interests
                </span>
            </div>
          </a>
          <div className="flex flex-col gap-2">
            <hr style={{ border: 'none', borderTop: '1px solid rgba(0, 0, 0, 0.1)' }} />
            <AppTagList
              label="🍦 Vanilla"
              values={user?.getTemplatePublicInterests || []}
              maxVisible={5}
              emptyState="Add your public interests by editing your profile!" //TODO: link to vanilla-spicy
            />
            <br/>
            {/* TODO: should it be included in the overview? Should only public info live there? */}
            <AppTagList
              label="🌶️ Spicy"
              values={user?.getTemplatePrivateInterests || []}
              maxVisible={5}
              emptyState="Add your private interests by editing your profile! 😏 🤫"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2 p-4">
        <hr/>
          <a href={"/templates/lets-shit-talk"}>
            <div className="flex items-center gap-1">
              <Icons.Clip className="text-icon-primary" />
              <span className="text-sm font-semibold text-label-primary font-sans">
                Dislikes
              </span>
            </div>
          </a>
          <div className="flex flex-col gap-2">
            <hr style={{ border: 'none', borderTop: '1px solid rgba(0, 0, 0, 0.1)' }} />
            <AppTagList
              label="🛡️ Public Defender"
              values={user?.getTemplateDislikesPublicDefender || []}
              maxVisible={5}
              emptyState="Add issues you stand against by editing your profile!" //TODO: link to lets-shit-talk
            />
            <br/>
            <AppTagList
              label="😤 Pet Peeves"
              values={user?.getTemplateDislikesPetPeeves || []}
              maxVisible={5}
              emptyState="Add your pet peeves by editing your profile!" //TODO: link to lets-shit-talk
            />
            <br/>
            <AppTagList
              label="😈 Love to Hate"
              values={user?.getTemplateDislikesLoveToHate || []}
              maxVisible={5}
              emptyState="Add what you love to hate by editing your profile!" //TODO: link to lets-shit-talk
            />
          </div>
          <hr/>
        </div>
        {user?.getBio !== "" && (
          <div className="flex flex-col gap-2 p-4">
            <span className="text-sm font-semibold text-label-primary font-sans">
              Bio
            </span>
            <span className="text-sm text-label-tertiary font-normal font-sans">
              {user?.getBio}
            </span>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
