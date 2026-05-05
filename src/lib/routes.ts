export const rootRoute = '/projects';

export function getSafeCallbackUrl(callbackUrl: string | undefined): string {
  const defaultUrl = rootRoute;

  if (!callbackUrl) return defaultUrl;

  if (!callbackUrl.startsWith('/')) return defaultUrl;

  if (callbackUrl.startsWith('/auth')) return defaultUrl;

  return callbackUrl;
}