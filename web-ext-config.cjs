// Mozilla web-ext config for AMO unlisted (self-distribution) signing.
// Docs: https://extensionworkshop.com/documentation/develop/web-ext-command-reference/
//
// Credentials: set WEB_EXT_API_KEY and WEB_EXT_API_SECRET in .env (see .env.example).
// web-ext reads those env vars automatically; do not commit secrets to this file.

/** @type {import('web-ext').WebExtConfig} */
module.exports = {
  sourceDir: '.output/firefox-mv3',
  artifactsDir: 'web-ext-artifacts',
  ignoreFiles: [
    '**/*.map',
    '**/.DS_Store',
  ],
  lint: {
    selfHosted: true,
  },
  sign: {
    channel: 'unlisted',
    // Optional: increase if AMO is slow (default 5 min request / 15 min approval wait).
    // timeout: 600_000,
    // approvalTimeout: 1_200_000,
  },
};
