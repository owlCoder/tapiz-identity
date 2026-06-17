// @tapizlabs/identity — zero-dependency identity & SSO-projection rules shared by
// the LMS UI/API and all spoke products (Boards/Whiteboard/...). See 01-tapiz-sso-fix.md.
//
// LMS is the source of truth for SSO users: spokes hold a read-only PROJECTION of
// the LMS profile (refreshed from the token on every login) and must never let an
// LMS-managed profile be edited locally. Local (non-LMS) users own their data.
//
// These are the canonical "who-may-do-what" identity rules — one source of truth so
// the same security decision is not duplicated (and divergent) across 6 consumers.

/** Profile claims returned by LMS `/oauth/userinfo`. */
export interface LmsProfile {
  sub: string;
  email: string;
  given_name: string;
  family_name: string;
  role: string;
  index_program?: string;
  index_number?: number;
  index_year?: number;
  university_id?: number;
  faculty_id?: number;
  university_short_name?: string;
  faculty_short_name?: string;
  /** Effective plan (strongest active faculty/university license). */
  plan?: string;
  /** Feature keys the user is entitled to — spokes gate paid features off this. */
  entitlements?: string[];
  /** Last time the user's effective license changed (ISO) — staleness signal. */
  updated_at?: string | null;
}

/** Spoke-side roles. Spokes that need a different mapping override this. */
export type SpokeRole = "assistant" | "student";

/** LMS student → student, assistant → assistant; other roles rejected (return null). */
export function mapLmsRole(role: string): SpokeRole | null {
  if (role === "student") return "student";
  if (role === "assistant") return "assistant";
  return null;
}

/** Index fields pass the same bounds as local registration; null if absent/invalid. */
export function validIndexFields(p: LmsProfile): { program: string; number: number; year: number } | null {
  if (!p.index_program || !p.index_number || !p.index_year) return null;
  if (!/^[A-Z]{2,3}$/.test(p.index_program)) return null;
  if (!Number.isInteger(p.index_number) || p.index_number < 1 || p.index_number > 999) return null;
  if (!Number.isInteger(p.index_year) || p.index_year < 1900 || p.index_year > 2099) return null;
  return { program: p.index_program, number: p.index_number, year: p.index_year };
}

/** Minimal shape a spoke user must expose for the projection guards. */
export interface ProjectableUser {
  authProvider?: "local" | "tapiz-lms" | null;
}

/** True when the profile is owned by LMS and must be read-only in the spoke. */
export function isLmsManaged(user: ProjectableUser): boolean {
  return user.authProvider === "tapiz-lms";
}

/**
 * Thrown before any profile mutation (name/email/affiliation) on an LMS-managed user.
 * The spoke catches this and surfaces "profile is managed in Tapiz LMS".
 */
export class ProfileManagedByLmsError extends Error {
  constructor() {
    super("PROFILE_MANAGED_BY_LMS");
    this.name = "ProfileManagedByLmsError";
  }
}

/**
 * Guard before a profile mutation. Prefs (theme/locale/...) are spoke-owned and
 * must NOT call this.
 */
export function assertProfileEditable(user: ProjectableUser): void {
  if (isLmsManaged(user)) throw new ProfileManagedByLmsError();
}

/**
 * True when the user is entitled to a given feature key.
 *
 * SECURITY: client-side entitlements are advisory (UX only). A JWT in the browser
 * can be tampered with, so paid actions MUST be re-verified server-side where the
 * token signature is checked — never trust this on the client to grant access.
 */
export function hasEntitlement(entitlements: string[] | undefined, key: string): boolean {
  return !!entitlements && entitlements.includes(key);
}
