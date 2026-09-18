import {z} from "zod";
import {nullToUndefined} from "@types";

export const SignalDataSchema = z.object({
  username: nullToUndefined(z.string()),
});

export type SignalData = z.infer<typeof SignalDataSchema>;

export const InstagramDataSchema = z.object({
  username: nullToUndefined(z.string()),
});

export type InstagramData = z.infer<typeof InstagramDataSchema>;

export const FarcasterDataSchema = z.object({
  username: nullToUndefined(z.string()),
});


export type FarcasterData = z.infer<typeof FarcasterDataSchema>;

export const TwitterDataSchema = z.object({
  username: nullToUndefined(z.string()),
});

export type TwitterData = z.infer<typeof TwitterDataSchema>;

export const TelegramDataSchema = z.object({
  username: nullToUndefined(z.string()),
});

export type TelegramData = z.infer<typeof TelegramDataSchema>;

export const WhatsappDataSchema = z.object({
  number: nullToUndefined(z.string()),
});

export type WhatsappData = z.infer<typeof TelegramDataSchema>;

export const SMSDataSchema = z.object({
  number: nullToUndefined(z.string()),
});

export type SMSData = z.infer<typeof TelegramDataSchema>;

export const EmailDataSchema = z.object({
  address: nullToUndefined(z.string()),
});

export type EmailData = z.infer<typeof TelegramDataSchema>;

export const SnapchatDataSchema = z.object({
  username: nullToUndefined(z.string()),
});

export type SnapchatData = z.infer<typeof TelegramDataSchema>;

