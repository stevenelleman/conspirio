import {
  UserData,
  UserDataSchema,
  User
} from "@/lib/storage/types";
import { Json } from "@types";

// To prevent accidental sharing, default ensure shareable data needs to be added to this method
// TODO: offer a more expressive way to define / set shareable data based on community / persona
export const getUserShareableData = (userData: UserData): UserData => {
  const {
    username,
    displayName,
    bio,
    signaturePublicKey,
    encryptionPublicKey,
    psiPublicKeyLink,
    twitter,
    telegram,
    signal,
    instagram,
    farcaster,
    substack,
    personalWebsites,
    pronouns,
    publicInterests,
    dislikesPublicDefender,
    dislikesPetPeeves,
    dislikesLoveToHate,
    publicCareOfferings,
    publicCareAsks,
    settings,
  } = UserDataSchema.parse(userData);

  return {
    username,
    displayName,
    bio,
    signaturePublicKey,
    encryptionPublicKey,
    psiPublicKeyLink,
    twitter,
    telegram,
    signal,
    instagram,
    farcaster,
    substack,
    personalWebsites,
    pronouns,
    publicInterests,
    // Specifically do not include privateInterests
    dislikesPublicDefender: settings?.discloseDislikesPublicDefender ? dislikesPublicDefender : undefined,
    dislikesPetPeeves: settings?.discloseDislikesPetPeeves ? dislikesPetPeeves : undefined,
    dislikesLoveToHate: settings?.discloseDislikesLoveToHate ? dislikesLoveToHate : undefined,
    publicCareOfferings,
    publicCareAsks,
    // Specifically do not include private care offerings or asks
    settings: {
      discloseDislikesPublicDefender: settings?.discloseDislikesPublicDefender,
      discloseDislikesPetPeeves: settings?.discloseDislikesPetPeeves,
      discloseDislikesLoveToHate: settings?.discloseDislikesLoveToHate,
    }
  };
};

export const shareableUserDataToJson = (userData: UserData): Json => {
  const { username,
    displayName,
    bio,
    signaturePublicKey,
    encryptionPublicKey,
    psiPublicKeyLink,
    twitter,
    telegram,
    signal,
    instagram,
    farcaster,
    whatsapp,
    email,
    sms,
    substack,
    personalWebsites,
    pronouns,
    publicInterests,
    dislikesPublicDefender,
    dislikesPetPeeves,
    dislikesLoveToHate,
    publicCareOfferings,
    publicCareAsks,
    settings,
  } = UserDataSchema.parse(userData);

  const nullableDislikesPublicDefender = !!dislikesPublicDefender ? dislikesPublicDefender : null;
  const nullableDislikesPetPeeves = !!dislikesPetPeeves ? dislikesPetPeeves : null;
  const nullableDislikesLoveToHate = !!dislikesLoveToHate ? dislikesLoveToHate : null;

  return {
    username: username || null,
    displayName: displayName || null,
    bio: bio || null,
    signaturePublicKey: signaturePublicKey || null,
    encryptionPublicKey: encryptionPublicKey || null,
    psiPublicKeyLink: psiPublicKeyLink || null,
    twitter: twitter || null,
    telegram: telegram || null,
    signal: signal || null,
    instagram: instagram || null,
    farcaster: farcaster || null,
    whatsapp: whatsapp || null,
    email: email || null,
    sms: sms || null,
    substack: substack || null,
    personalWebsites: personalWebsites || null,
    pronouns: pronouns || null,
    publicInterests: publicInterests || null,
    // Specifically do not include privateInterests

    dislikesPublicDefender: settings?.discloseDislikesPublicDefender ? nullableDislikesPublicDefender : null,
    dislikesPetPeeves: settings?.discloseDislikesPetPeeves ? nullableDislikesPetPeeves : null,
    dislikesLoveToHate: settings?.discloseDislikesLoveToHate ? nullableDislikesLoveToHate : null,

    publicCareOfferings: publicCareOfferings || null,
    publicCareAsks: publicCareAsks || null,
    // Specifically do not include private care offerings or asks

    settings: {
      discloseDislikesPublicDefender: settings?.discloseDislikesPublicDefender || null,
      discloseDislikesPetPeeves: settings?.discloseDislikesPetPeeves || null,
      discloseDislikesLoveToHate: settings?.discloseDislikesLoveToHate || null,
    }
  };
};

// NOTE: other methods that depend on user object but not localstorage should be moved here
export const getConnectionSigPubKey = (user: User, connectionUsername: string): string | null => {

  if (!user.connections || !user.connections[connectionUsername]) {
    return null;
  }

  const connection = user.connections[connectionUsername];
  if (!connection || !connection.user?.signaturePublicKey) {
    return null;
  }

  return connection.user.signaturePublicKey;
}

export const getUserSigPubKey = (user: User): string => {
  return user.userData.signaturePublicKey;
};
