/**
 * Fixed facts about where Pixle lives.
 *
 * Plain constants, not environment variables: these are the same in every
 * environment — dev, preview, and production all point at the same public
 * repository. An env var would add indirection and a way to deploy with it
 * missing, in exchange for configurability nobody needs.
 */

export const REPO_URL = "https://github.com/ilhamrizkyy/pixle";

/** Where the site is deployed. Share previews need it to build absolute URLs;
 *  change it here when a custom domain is added. */
export const SITE_URL = "https://pixle.ilhamrizkyakbar.workers.dev";

export const LICENSE_URL = `${REPO_URL}/blob/main/LICENSE`;

export const CONTRIBUTING_URL = `${REPO_URL}/blob/main/CONTRIBUTING.md`;
