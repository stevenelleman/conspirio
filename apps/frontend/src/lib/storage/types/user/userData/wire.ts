import { z } from "zod";
import { UserDataV0Schema } from "./v0";
import type { UserData } from "./index";

// Format of user data shared with other users: tap back messages, connection.user, and chip registration. It is a
// protocol between clients, so it is versioned separately from the stored UserData and must stay readable by clients
// that haven't updated. Today it is identical to the frozen V0 storage shape; if the shared format needs to change,
// give it its own schema here and a version, rather than changing UserDataV0Schema.
export const WireUserDataSchema = UserDataV0Schema;

export type WireUserData = z.infer<typeof WireUserDataSchema>;

export const toWireUserData = (userData: UserData): WireUserData => {
  return {
    // Bio
    username: userData.getUsername,
    displayName: userData.getDisplayName,
    bio: userData.getBio,
    signaturePublicKey: userData.getSignaturePublicKey,
    encryptionPublicKey: userData.getEncryptionPublicKey,
    psiPublicKeyLink: userData.getPsiPublicKeyLink,
    pronouns: userData.getPronouns,

    // Socials
    twitter: userData.getTwitter,
    telegram: userData.getTelegram,
    signal: userData.getSignal,
    instagram: userData.getInstagram,
    farcaster: userData.getFarcaster,
    whatsapp: userData.getWhatsapp,
    sms: userData.getSms,
    email: userData.getEmail,

    // Portfolio
    substack: userData.getSubstack,
    personalWebsites: userData.getPersonalWebsites,

    // Integrations
    strava: userData.getStrava,
    github: userData.getGithub,

    // Templates
    tensionsRating: userData.getTensionsRating,
    hotTakesRating: userData.getHotTakesRating,
    publicInterests: userData.getPublicInterests,
    privateInterests: userData.getPrivateInterests,
    dislikesPublicDefender: userData.getDislikesPublicDefender,
    dislikesPetPeeves: userData.getDislikesPetPeeves,
    dislikesLoveToHate: userData.getDislikesLoveToHate,

    // Settings
    settings: userData.getSettings,
  };
};
