// Rate limiting for the public edge functions.
//
// Shared so /contact and launch-contest behave the same way, and so the IP
// handling is written once — it's the part that's easy to get wrong.

import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Client IP as seen through Supabase's proxy. x-forwarded-for is a list —
 * "client, proxy1, proxy2" — and the FIRST entry is the original caller.
 * It's also caller-supplied and therefore spoofable; that's acceptable here
 * because this limits casual abuse and accidental loops, not a determined
 * attacker, and nothing security-critical hangs off it.
 */
function clientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for') || '';
  return fwd.split(',')[0].trim() || req.headers.get('cf-connecting-ip') || 'unknown';
}

/**
 * Bucket key: `scope:sha256(ip + today)`.
 *
 * Hashed so no raw IP is ever stored — the privacy policy makes no claim
 * about collecting addresses, and this keeps that true. Salted with the date
 * so the value can't be used to follow one visitor across days: a bare
 * SHA-256 of an IPv4 address is trivially reversible by brute force, since
 * there are only ~4 billion of them.
 */
async function hashBucket(scope: string, value: string): Promise<string> {
  const day = new Date().toISOString().slice(0, 10);
  const bytes = new TextEncoder().encode(`${value}|${day}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  const hex = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `${scope}:${hex.slice(0, 32)}`;
}

/**
 * Returns true when the caller may proceed.
 *
 * Fails OPEN. If the limiter itself errors — the migration hasn't run, the
 * database is briefly unreachable — we let the request through rather than
 * take down the contact form over a housekeeping table. The endpoints this
 * guards are a nuisance when abused, not a breach, so availability is worth
 * more here than strictness.
 */
export async function rateLimitOk(
  admin: SupabaseClient,
  req: Request,
  scope: string,
  limit: number,
  window: string,
  extraKey?: string,
): Promise<boolean> {
  try {
    // When an extra key is given it REPLACES the IP rather than joining it.
    // Combining them makes the bucket per-(ip, value), so anyone varying the
    // value gets a fresh allowance — which defeats the point of limiting on
    // that value at all. Callers wanting both do two calls with two scopes.
    const key = extraKey ? extraKey.toLowerCase() : clientIp(req);
    const bucket = await hashBucket(scope, key);
    const { data, error } = await admin.rpc('rate_limit_take', {
      p_bucket: bucket,
      p_limit: limit,
      p_window: window,
    });
    if (error) {
      console.error('[rateLimit] check failed, allowing:', error.message);
      return true;
    }
    return data !== false;
  } catch (e) {
    console.error('[rateLimit] threw, allowing:', e);
    return true;
  }
}
