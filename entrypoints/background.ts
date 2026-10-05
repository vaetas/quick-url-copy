const COPY_MESSAGE_TYPE = 'copy-url';
const OFFSCREEN_PATH = '/offscreen.html';
const OFFSCREEN_REASON = 'CLIPBOARD' as const;
const OFFSCREEN_JUSTIFICATION = 'Write the current tab URL to the clipboard';

async function getActiveTabUrl(tab?: Browser.tabs.Tab): Promise<string | undefined> {
  if (tab?.url) {
    return tab.url;
  }

  const [activeTab] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });

  return activeTab?.url;
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
      const url = await getActiveTabUrl(tab);
      if (!url) {
        return;
      }

      await copyUrlToClipboard(url);
    })();
  });
});
