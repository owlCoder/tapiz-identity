// Auth.js OAuth provider factory for "Sign in with Tapiz LMS".
// Kept framework-light: returns a plain provider-config object (structurally an
// Auth.js OAuthConfig) so spokes don't each re-declare the same wiring. The spoke
// passes the result straight into NextAuth({ providers: [...] }).
//
// See 01-tapiz-sso-fix.md. LMS is the OAuth2 (code + PKCE) identity provider.

import type { LmsProfile, SpokeRole } from "./index";
import { mapLmsRole } from "./index";

export type LmsSsoEnv = Record<string, string | undefined> & {
  LMS_UI_URL?: string;
  LMS_API_URL?: string;
  LMS_OAUTH_CLIENT_ID?: string;
  LMS_OAUTH_CLIENT_SECRET?: string;
};

/** Provider se registruje samo kad su sve LMS_* varijable postavljene. */
export function isLmsSsoEnabled(env: LmsSsoEnv): boolean {
  return Boolean(
    env.LMS_UI_URL && env.LMS_API_URL && env.LMS_OAUTH_CLIENT_ID && env.LMS_OAUTH_CLIENT_SECRET,
  );
}

/**
 * Minimal user shape the provider's `profile()` returns before the spoke's signIn
 * callback overwrites it with the local account. `role` defaults via mapLmsRole.
 */
export interface LmsSsoProfileResult {
  id: string;
  email: string;
  name: string;
  role: SpokeRole;
}

/**
 * Build the Auth.js OAuth provider config for Tapiz LMS. Typed as `unknown`-free
 * generic record to avoid a hard next-auth dependency in this package; cast at the
 * call site: `tapizLmsProvider(process.env) as OAuthConfig<LmsProfile>`.
 */
export function tapizLmsProvider(env: LmsSsoEnv) {
  return {
    id: "tapiz-lms",
    name: "Tapiz LMS",
    type: "oauth" as const,
    authorization: {
      url: `${env.LMS_UI_URL}/oauth/authorize`,
      params: { scope: "profile" },
    },
    token: `${env.LMS_API_URL}/oauth/token`,
    userinfo: `${env.LMS_API_URL}/oauth/userinfo`,
    checks: ["pkce", "state"] as ("pkce" | "state" | "none")[],
    clientId: env.LMS_OAUTH_CLIENT_ID,
    clientSecret: env.LMS_OAUTH_CLIENT_SECRET,
    profile(p: LmsProfile): LmsSsoProfileResult {
      return {
        id: p.sub,
        email: p.email,
        name: `${p.given_name} ${p.family_name}`,
        role: mapLmsRole(p.role) ?? "student",
      };
    },
  };
}
