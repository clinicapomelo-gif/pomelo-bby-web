import { head } from '@vercel/blob';

export const GUIDE_DOWNLOAD_TTL_SECONDS = 30 * 24 * 60 * 60;

export const getGuideDownloadExpiresAt = (sessionCreated: number, configured?: string) => {
  const configuredTimestamp = Number(configured);

  return Number.isSafeInteger(configuredTimestamp) && configuredTimestamp > sessionCreated
    ? configuredTimestamp
    : sessionCreated + GUIDE_DOWNLOAD_TTL_SECONDS;
};

export const isPrivateGuidePdfAvailable = async (blobKey: string) => {
  // La SDK resuelve OIDC o BLOB_READ_WRITE_TOKEN en runtime.
  const blob = await head(blobKey);
  return blob.contentType === 'application/pdf';
};
