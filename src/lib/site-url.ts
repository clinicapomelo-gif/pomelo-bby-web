// Production y preview fijan SITE_URL en wrangler.jsonc; en local, el origen de la petición.
export const getSiteUrl = (request: Request) =>
  process.env.SITE_URL || new URL(request.url).origin;
