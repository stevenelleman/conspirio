import { AccessToken, DataImportSource } from "@types";

export interface iOAuthClient {
  MintOAuthToken(app: DataImportSource, code: string): Promise<AccessToken | null>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  RefreshOAuthToken(app: DataImportSource, refreshToken: string): Promise<any | null>;
}