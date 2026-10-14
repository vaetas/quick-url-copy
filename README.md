# Quick URL Copy

Minimal browser extension that copies the current tab’s URL with a keyboard shortcut, similar to Arc.

| Platform       | Suggested shortcut |
| -------------- | ------------------ |
| macOS          | `⌘⇧C`              |
| Windows/Linux  | `Ctrl+Shift+C`     |

No popup or options UI — the shortcut is the only interface.

## Prerequisites

- [Bun](https://bun.sh)
- Chrome and/or Firefox

## Install dependencies

```bash
bun install
```

## Build

```bash
bun run build          # Chrome → .output/chrome-mv3
bun run build:firefox  # Firefox → .output/firefox-mv3
```

For day-to-day development (auto-reload):

```bash
bun run dev            # Chrome
bun run dev:firefox    # Firefox
```

## Enable in Chrome

1. Build (or run `bun run dev`).
2. Open `chrome://extensions`.
3. Turn on **Developer mode**.
4. Click **Load unpacked** and select `.output/chrome-mv3`.
5. Assign the shortcut (see [Keyboard shortcuts](#keyboard-shortcuts)).

To update after a rebuild, click the refresh icon on the extension card (or restart `bun run dev`).

## Enable in Firefox

1. Build (or run `bun run dev:firefox`).
2. Open `about:debugging#/runtime/this-firefox`.
3. Click **Load Temporary Add-on…**.
4. Select `.output/firefox-mv3/manifest.json`.
5. Assign the shortcut (see [Keyboard shortcuts](#keyboard-shortcuts)).

Temporary add-ons are removed when Firefox quits. Load the folder again after restart, or keep `bun run dev:firefox` running during development.

## Sign for Firefox (unlisted / self-distribution)

Release Firefox builds require a Mozilla-signed `.xpi`. This project is set up for **unlisted** signing: the add-on is not public on AMO, but you get a signed file you can install or host yourself.

Stable add-on ID (required for updates): `quick-url-copy@local` in `wxt.config.ts` → `browser_specific_settings.gecko.id`. **Do not change this ID** after your first successful AMO submission.

### One-time setup

1. Confirm your [Firefox Add-ons Developer account](https://addons.mozilla.org/en-US/developers/) is active and your email is verified.
2. Open [API credentials](https://addons.mozilla.org/en-US/developers/addon/api/key/) and create a **new key pair** (JWT issuer + secret). Store the secret somewhere safe; AMO shows it only once.
3. Copy `.env.example` to `.env` in the project root and set:
   - `WEB_EXT_API_KEY` — JWT issuer (looks like `user:12345678:99`)
   - `WEB_EXT_API_SECRET` — JWT secret
4. Ensure Node.js **20+** is available (`web-ext` 10.x requirement). Bun runs the scripts; `web-ext` is a Node binary.

`bun run sign:firefox` loads credentials from `.env` automatically. You can also `export WEB_EXT_API_KEY` / `WEB_EXT_API_SECRET` in your shell instead.

Signing config lives in `web-ext-config.cjs` (`channel: unlisted`, source `.output/firefox-mv3`, artifacts `web-ext-artifacts/`).

### Sign from the CLI

```bash
bun run lint:firefox   # optional: build + AMO linter
bun run sign:firefox   # build + submit to AMO + download signed .xpi
```

Signed packages are written under `web-ext-artifacts/` (gitignored).

Equivalent manual flow:

```bash
bun run build:firefox
export WEB_EXT_API_KEY='user:…'
export WEB_EXT_API_SECRET='…'
web-ext sign --channel=unlisted --source-dir=.output/firefox-mv3
```

### Sign via AMO Developer Hub (no CLI)

1. Run `bun run zip:firefox` and use the zip under `.output/` (or zip the `firefox-mv3` folder yourself).
2. Go to [Submit a New Add-on](https://addons.mozilla.org/en-US/developers/addon/submit/upload-unlisted).
3. Accept the developer agreement, upload the package, choose **On your own** / self-distribution (unlisted).
4. Fix any validator errors, then download the signed `.xpi` from the add-on’s **Manage Status & Versions** page.

Unlisted add-ons are usually signed automatically after validation (no public listing review). Mozilla may still review later under [Add-on Policies](https://extensionworkshop.com/documentation/publish/add-on-policies/).

### Install the signed XPI

1. Open `about:addons`.
2. Gear menu → **Install Add-on From File…**
3. Select the signed `.xpi` from `web-ext-artifacts/`.

For each new release, bump `version` in `package.json` (WXT copies it to the manifest), then run `bun run sign:firefox` again with the **same** `gecko.id`.

## Keyboard shortcuts

Chrome and Firefox already use `⌘⇧C` / `Ctrl+Shift+C` for **Inspect Element**. They will not hand that combo to the extension from the manifest suggestion alone. You must free the built-in binding where the browser requires it, then assign the shortcut once yourself.

### Chrome

1. Open `chrome://extensions/shortcuts`.
2. Find **Quick URL Copy** → **Copy the current tab URL**.
3. Click the pencil / input and press `⌘⇧C` (macOS) or `Ctrl+Shift+C` (Windows/Linux).
4. If Chrome warns about a conflict, confirm the reassignment so the extension takes the key.

### Firefox

Firefox’s default for **Inspect Element** is `⌘⇧C` on macOS and `Ctrl+Shift+C` on Windows and Linux ([DevTools keyboard shortcuts](https://firefox-source-docs.mozilla.org/devtools-user/keyboard_shortcuts/index.html)). On `about:keyboard` that action is listed as **DOM and Style Inspector**.

A shortcut the browser already uses cannot be overridden by an extension: the command may be defined, but the handler is not called ([`commands` on MDN](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/commands)). Clear the built-in key first, then give it to the extension ([Bug 1325692](https://bugzilla.mozilla.org/show_bug.cgi?id=1325692)). This needs Firefox 147 or newer, which adds [Customize keyboard shortcuts](https://support.mozilla.org/kb/customize-keyboard-shortcuts-firefox).

1. Open `about:keyboard`.
2. Search for **DOM and Style Inspector**.
3. Click **Clear** to unset the default `⌘⇧C` (macOS) or `Ctrl+Shift+C` (Windows/Linux). **Reset** on that row puts the Firefox default back.
4. Open `about:addons`.
5. Click the gear icon → **Manage Extension Shortcuts**.
6. Find **Quick URL Copy** → **Copy the current tab URL**.
7. Set `⌘⇧C` (macOS) or `Ctrl+Shift+C` (Windows/Linux).

If that combo still fights with another extension, pick any free combination in **Manage Extension Shortcuts** (for example `⌘⇧U` / `Ctrl+Shift+U`). The extension listens for the command, not a hard-coded key.

### Avoid fighting other shortcuts

- Prefer assigning the shortcut in the browser’s extension shortcut page rather than relying on the manifest suggestion.
- On Firefox, clear **DOM and Style Inspector** on `about:keyboard` before assigning `⌘⇧C` / `Ctrl+Shift+C` to this extension.
- Check `chrome://extensions/shortcuts` or Firefox’s **Manage Extension Shortcuts** for blank or conflicting bindings after install.
- If another extension already claims the same key, either free it there or choose a different shortcut for Quick URL Copy.
- Focus a normal page (not the address bar) when testing the shortcut.

## Verify

1. Open any tab (a normal site or an internal page like `chrome://extensions` / `about:addons`).
2. Press the assigned shortcut.
3. Paste somewhere — you should get that tab’s full URL as plain text.

## Permissions

| Permission       | Why                                              |
| ---------------- | ------------------------------------------------ |
| `tabs`           | Read the active tab URL (including internal pages) |
| `clipboardWrite` | Write the URL to the clipboard                   |
| `offscreen`      | Chrome only — clipboard write from the service worker |
