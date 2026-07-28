/**
 * Sanity module for the Vitest runner bootstrap (work unit 1).
 *
 * This is not application logic. Its only purpose is to give
 * `sanity.test.ts` something real to assert against: that the `@/`
 * path alias (configured separately in `vitest.config.ts` and
 * `tsconfig.json`) resolves correctly inside the Vitest environment,
 * which is a real integration risk distinct from the Next.js build.
 */
export const APP_NAME = "wedding-invitation-piero";
