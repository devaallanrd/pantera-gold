/** Compare the browser Origin to Host, not Next's internal bind address.
 * The reverse proxy must preserve the public Host and reject unknown hosts.
 * We deliberately do not trust arbitrary X-Forwarded-Host headers.
 */
export function isAllowedOrigin(origin: string | null, host: string | null): boolean {
  if (!origin) return true; // Non-browser clients still require endpoint authorization.
  if (!host) return false;
  try {
    const url = new URL(origin);
    return (
      ['http:', 'https:'].includes(url.protocol) &&
      url.origin === origin &&
      url.host === host.toLowerCase()
    );
  } catch {
    return false;
  }
}
