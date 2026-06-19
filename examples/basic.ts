/**
 * @tapizlabs/identity — basic usage
 *
 * Shared, zero-dependency identity rules: a spoke product reads who the user is
 * from the LMS SSO profile and decides what they may do — without calling LMS
 * at runtime. Run: `npx tsx examples/basic.ts`
 */
import {
  mapLmsRole,
  isLmsManaged,
  assertProfileEditable,
  hasEntitlement,
  type LmsProfile,
  type ProjectableUser,
} from "@tapizlabs/identity";

// 1. A profile as it arrives from the LMS SSO token.
const profile: LmsProfile = {
  sub: "stu_123",
  email: "ana@uns.ac.rs",
  name: "Ana Anić",
  role: "student",
  plan: "pro",
  entitlements: ["boards.unlimited_teams", "whiteboard.export"],
};

// 2. Map the LMS role to the spoke's own role model.
const role = mapLmsRole(profile.role); // "student" | "assistant" | null
console.log("spoke role:", role);

// 3. LMS-managed users must not edit identity fields locally.
const user: ProjectableUser = { managedByLms: true };
console.log("managed by LMS:", isLmsManaged(user));
try {
  assertProfileEditable(user); // throws ProfileManagedByLmsError
} catch (e) {
  console.log("blocked edit:", (e as Error).message);
}

// 4. Gate a paid feature straight from the token claims (no LMS round-trip).
const canUnlimitedTeams = hasEntitlement(profile.entitlements, "boards.unlimited_teams");
console.log("unlimited teams:", canUnlimitedTeams);
