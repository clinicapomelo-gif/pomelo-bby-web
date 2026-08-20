import { head } from '@vercel/blob';

type GuideBlobAuth =
  | { oidcToken: string; storeId: string }
  | { token: string };

export const getGuideBlobAuth = (): GuideBlobAuth | undefined => {
  const oidcToken = import.meta.env.VERCEL_OIDC_TOKEN;
  const storeId = import.meta.env.BLOB_STORE_ID;
  if (oidcToken && storeId) return { oidcToken, storeId };

  const token = import.meta.env.BLOB_READ_WRITE_TOKEN;
  return token ? { token } : undefined;
};

export const GUIDE_DOWNLOAD_TTL_SECONDS = 30 * 24 * 60 * 60;

export const getGuideDownloadExpiresAt = (sessionCreated: number, configured?: string) => {
  const configuredTimestamp = Number(configured);

  return Number.isSafeInteger(configuredTimestamp) && configuredTimestamp > sessionCreated
    ? configuredTimestamp
    : sessionCreated + GUIDE_DOWNLOAD_TTL_SECONDS;
};

export const isPrivateGuidePdfAvailable = async (blobKey: string, auth: GuideBlobAuth) => {
  const blob = await head(blobKey, auth);
  return blob.contentType === 'application/pdf';
};
