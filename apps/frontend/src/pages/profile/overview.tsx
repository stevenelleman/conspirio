import { Icons } from "@/components/icons/Icons";
import { AppButton } from "@/components/ui/Button";
import { LinkCardBox } from "@/components/ui/LinkCardBox";
import {
  getProfileBackgroundColor,
  ProfileImage,
} from "@/components/ui/ProfileImage";
import AppLayout from "@/layouts/AppLayout";
import { storage } from "@/lib/storage";
import { User, UserData } from "@/lib/storage/types";
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
                user?.userData as UserData
              )} 100%)`,
            }}
          >
            <div className="absolute left-4 top-[40px]">
              <ProfileImage size={16} user={user?.userData as UserData} />
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
            {user?.userData.displayName}
          </span>
          <span className="text-[14px] font-medium font-sans text-label-tertiary">
            {`@${user?.userData.username}`}
          </span>
          {user?.userData?.pronouns && (
            <span className="text-[14px] font-medium font-sans text-label-tertiary">
              {user?.userData.pronouns}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-2 p-4">
          <span className="text-sm font-semibold text-label-primary font-sans">
            Socials
          </span>
          <div className="flex flex-col gap-2">
            {!user?.userData?.telegram?.username &&
              !user?.userData?.twitter?.username &&
              !user?.userData?.signal?.username && (
                <span className="text-sm text-label-secondary font-sans font-normal">
                  Add socials by editing your chip details!
                </span>
              )}
            {user?.userData?.email?.address && (
              <LinkCardBox
                label="Email"
                value={`${user.userData.email.address}`}
                href={`mailto:${user.userData.email.address}`}
              />
            )}
            {user?.userData?.sms?.number && (
              <LinkCardBox
                label="SMS"
                value={`${user.userData.sms.number}`}
                href={`sms:+${user.userData.sms.number}`}
              />
            )}
            {user?.userData?.whatsapp?.number && (
              <LinkCardBox
                label="Whatsapp"
                value={`${user.userData.whatsapp.number}`}
                href={`https://wa.me/${user.userData.whatsapp.number}`}
              />
            )}
            {user?.userData?.telegram?.username && (
              <LinkCardBox
                label="Telegram"
                value={`@${user.userData.telegram.username}`}
                href={`https://t.me/${user.userData.telegram.username}`}
              />
            )}
            {user?.userData?.twitter?.username && (
              <LinkCardBox
                label="X"
                value={`@${user.userData.twitter.username}`}
                href={`https://x.com/${user.userData.twitter.username}`}
              />
            )}
            {user?.userData?.signal?.username && (
              <LinkCardBox
                label="Signal"
                value={`@${user.userData.signal.username}`}
                href={`sgnl://signal.me/#u/${user?.userData.signal.username}`}
              />
            )}
            {user?.userData?.instagram?.username && (
              <LinkCardBox
                label="Instagram"
                value={`@${user.userData.instagram.username}`}
                href={`https://www.instagram.com/${user.userData.instagram.username}`}
              />
            )}
            {user?.userData?.farcaster?.username && (
              <LinkCardBox
                label="Farcaster"
                value={`@${user.userData.farcaster.username}`}
                href={`https://warpcast.com/${user.userData.farcaster.username}`}
              />
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2 p-4">
          <span className="text-sm font-semibold text-label-primary font-sans">
            Portfolio
          </span>
          <div className="flex flex-col gap-2">
            {!user?.userData?.personalWebsites?.websites &&
              !user?.userData?.substack?.handle && (
                <span className="text-sm text-label-secondary font-sans font-normal">
                  Add portfolio by editing your chip details!
                </span>
              )}
            {user?.userData?.personalWebsites?.websites && (
              <LinksCardBox
                label="Personal Websites"
                values={user.userData.personalWebsites.websites}
                hrefs={user.userData.personalWebsites.websites}
              />
            )}
            {user?.userData?.substack?.handle && (
              <LinkCardBox
                label="Substack"
                value={`@${user?.userData?.substack?.handle}`}
                href={`https://substack.com/@${user?.userData?.substack?.handle}`}
              />
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2 p-4">
          <div className="flex flex-col gap-2">
            <AppTagList
              label="Vanilla Interests"
              values={user?.userData?.publicInterests || []}
              maxVisible={5}
              emptyState="Add your public interests by editing your profile!" //TODO: link to vanilla-spicy
            />
            <br/>
            {/* TODO: should it be included in the overview? Should only public info live there? */}
            <AppTagList
              label="Spicy Interests"
              values={user?.userData?.privateInterests || []}
              maxVisible={5}
              emptyState="Add your private interests by editing your profile! 😏 🤫"
            />
          </div>
        </div>
        {user?.userData.bio !== "" && (
          <div className="flex flex-col gap-2 p-4">
            <span className="text-sm font-semibold text-label-primary font-sans">
              Bio
            </span>
            <span className="text-sm text-label-tertiary font-normal font-sans">
              {user?.userData.bio}
            </span>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
