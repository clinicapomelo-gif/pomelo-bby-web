import { head } from '@vercel/blob';

export const GUIDE_DOWNLOAD_TTL_SECONDS = 30 * 24 * 60 * 60;

export const getGuideDownloadExpiresAt = (sessionCreated: number, configured?: string) => {
  const configuredTimestamp = Number(configured);

  return Number.isSafeInteger(configuredTimestamp) && configuredTimestamp > sessionCreated
    ? configuredTimestamp
    : sessionCreated + GUIDE_DOWNLOAD_TTL_SECONDS;
};

export const isPrivateGuidePdfAvailable = async (blobKey: string, token: string) => {
  const blob = await head(blobKey, { token });
  return blob.contentType === 'application/pdf';
};
