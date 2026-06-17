# @tapizlabs/identity

Zero-dependency identity & SSO-projection rules shared across the Tapiz ecosystem
(LMS UI/API + spoke products: Boards, Whiteboard, …).

LMS is the **source of truth** for SSO users. Spokes hold a **read-only projection**
of the LMS profile, refreshed from the token on every login, and must never let an
LMS-managed profile be edited locally. Local (non-LMS) users own their data in the
spoke DB.

One source of truth so the same "who-may-do-what" decision is not duplicated (and
allowed to diverge) across consumers.

## Exports

### `@tapizlabs/identity`

| Symbol | Purpose |
|---|---|
| `LmsProfile` | Claims returned by LMS `/oauth/userinfo` (incl. `plan`, `entitlements`, `updated_at`). |
| `SpokeRole`, `mapLmsRole` | LMS role → spoke role; non-student/assistant rejected (`null`). |
| `validIndexFields` | Validate LMS index fields with the same bounds as local registration. |
| `ProjectableUser`, `isLmsManaged` | Is this user owned by LMS (→ read-only locally)? |
| `assertProfileEditable`, `ProfileManagedByLmsError` | Guard before any profile mutation. |
| `hasEntitlement` | Feature-flag check off `entitlements[]`. **Advisory client-side; verify server-side.** |

### `@tapizlabs/identity/sso`

Auth.js OAuth provider factory for "Sign in with Tapiz LMS".

| Symbol | Purpose |
|---|---|
| `isLmsSsoEnabled(env)` | True only when all `LMS_*` env vars are set. |
| `tapizLmsProvider(env)` | Plain Auth.js `OAuthConfig`-shaped object (code + PKCE). Cast at call site. |
| `LmsSsoEnv`, `LmsSsoProfileResult` | Env + provider `profile()` shapes. |

## Security

`hasEntitlement` / `entitlements` on the client are **UX only**. A JWT in the browser
can be tampered with, so paid actions MUST be re-verified server-side where the token
signature is checked. Never trust client entitlements to grant access.

## Consuming

Not published to npm (yet). Build (`npm run build`) and copy `dist/` + `package.json`
into the consumer's `node_modules/@tapizlabs/identity/` — Turbopack on Windows does not
resolve symlinks reliably.

See `01-tapiz-sso-fix.md` in the workspace root for the full design.
