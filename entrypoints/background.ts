import { injectCopiedToast } from '../utils/copied-toast';

const COPY_MESSAGE_TYPE = 'copy-url';
const OFFSCREEN_PATH = '/offscreen.html';
const OFFSCREEN_REASON = 'CLIPBOARD' as const;
const OFFSCREEN_JUSTIFICATION = 'Write the current tab URL to the clipboard';

async function getActiveTab(tab?: Browser.tabs.Tab): Promise<Browser.tabs.Tab | undefined> {
  if (tab?.id !== undefined) {
    return tab;
  }

  const [activeTab] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });

  return activeTab;
}

async function showCopiedToast(tab?: Browser.tabs.Tab): Promise<void> {
  const tabId = tab?.id;
  if (tabId === undefined) {
    return;
  }

  try {
    await browser.scripting.executeScript({
      target: { tabId },
      func: injectCopiedToast,
    });
  } catch {
    // Restricted pages (chrome://, about:, the store, etc.) cannot run scripts.
  }
}

async function copyWithClipboardApi(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}

async function ensureOffscreenDocument(): Promise<void> {
  const existingContexts = await browser.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [browser.runtime.getURL(OFFSCREEN_PATH)],
  });

  if (existingContexts.length > 0) {
    return;
  }

  await browser.offscreen.createDocument({
    url: OFFSCREEN_PATH,
    reasons: [OFFSCREEN_REASON],
    justification: OFFSCREEN_JUSTIFICATION,
  });
}

async function copyWithOffscreenDocument(text: string): Promise<void> {
  await ensureOffscreenDocument();

  try {
    await browser.runtime.sendMessage({
      type: COPY_MESSAGE_TYPE,
      text,
    });
  } finally {
    await browser.offscreen.closeDocument();
  }
}

async function copyUrlToClipboard(text: string): Promise<void> {
  if (import.meta.env.FIREFOX) {
    await copyWithClipboardApi(text);
    return;
  }

  await copyWithOffscreenDocument(text);
}

export default defineBackground(() => {
  browser.commands.onCommand.addListener((command, tab) => {
    if (command !== 'copy-url') {
      return;
    }

    void (async () => {
      const activeTab = await getActiveTab(tab);
      const url = activeTab?.url;
      if (!url) {
        return;
      }

      await copyUrlToClipboard(url);
      await showCopiedToast(activeTab);
    })();
  });
});
