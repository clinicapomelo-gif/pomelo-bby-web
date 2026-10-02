export const GUIDE_DOWNLOAD_TTL_SECONDS = 30 * 24 * 60 * 60;

export const getGuideDownloadExpiresAt = (sessionCreated: number, configured?: string) => {
  const defaultExpiresAt = sessionCreated + GUIDE_DOWNLOAD_TTL_SECONDS;
  const configuredTimestamp = Number(configured);

  return Number.isSafeInteger(configuredTimestamp) && configuredTimestamp > defaultExpiresAt
    ? configuredTimestamp
    : defaultExpiresAt;
};
