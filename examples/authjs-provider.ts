/**
 * @tapizlabs/identity/sso — wiring the LMS as an OAuth provider in Auth.js v5.
 * The factory reads LMS_* env vars and returns a ready provider; if SSO is not
 * configured the spoke simply falls back to its own auth (degrades, not breaks).
 */
import { tapizLmsProvider, isLmsSsoEnabled } from "@tapizlabs/identity/sso";

const env = process.env;

export const providers = isLmsSsoEnabled(env)
  ? [tapizLmsProvider(env)] // OAuth2 + PKCE against LMS, projects LmsProfile
  : []; // no LMS configured → spoke uses local credentials only

console.log("LMS SSO enabled:", isLmsSsoEnabled(env));
