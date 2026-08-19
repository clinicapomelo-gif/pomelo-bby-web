export const getSiteUrl = (request: Request) =>
  process.env.VERCEL_ENV === 'preview' && process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : import.meta.env.SITE_URL || new URL(request.url).origin;
