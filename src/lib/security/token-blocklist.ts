/**
 * Server-side JWT token blocklist.
 * Stores invalidated token JTI claims (or token hashes) to prevent reuse after logout.
 * 
 * Note: This is an in-memory store suitable for single-instance deployments.
 * For multi-instance deployments, replace with Redis or a shared data store.
 */

import crypto from "crypto";

interface BlocklistEntry {
  /** When this entry expires and can be cleaned up */
  expiresAt: number;
}

const blocklist = new Map<string, BlocklistEntry>();

const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
let lastCleanup = Date.now();

function cleanupExpired(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of blocklist.entries()) {
    if (now > entry.expiresAt) {
      blocklist.delete(key);
    }
  }
}

/** Hash a token to avoid storing raw JWTs in memory */
function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/** Extract expiration time from a JWT payload */
function getTokenExpiry(token: string): number | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
    if (payload.exp) return payload.exp * 1000; // Convert to milliseconds
    return null;
  } catch {
    return null;
  }
}

/**
 * Add a token to the blocklist so it can no longer be used.
 * The entry expires when the token itself would have expired,
 * or after a default TTL if no expiry is found.
 */
export function blockToken(token: string): void {
  cleanupExpired();
  const hash = hashToken(token);
  const expiry = getTokenExpiry(token);
  // Default TTL: 24 hours if we can't determine expiry
  const expiresAt = expiry || Date.now() + 24 * 60 * 60 * 1000;
  blocklist.set(hash, { expiresAt });
}

/**
 * Check if a token has been blocklisted (i.e., invalidated via logout).
 */
export function isTokenBlocked(token: string): boolean {
  cleanupExpired();
  const hash = hashToken(token);
  const entry = blocklist.get(hash);
  if (!entry) return false;
  // If entry has expired, remove it and return false
  if (Date.now() > entry.expiresAt) {
    blocklist.delete(hash);
    return false;
  }
  return true;
}
