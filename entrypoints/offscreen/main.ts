type CopyUrlMessage = {
  type: 'copy-url';
  text: string;
};

function isCopyUrlMessage(message: unknown): message is CopyUrlMessage {
  if (!message || typeof message !== 'object') {
    return false;
  }

  const candidate = message as Partial<CopyUrlMessage>;
  return candidate.type === 'copy-url' && typeof candidate.text === 'string';
}

function copyText(text: string): boolean {
  const textarea = document.getElementById('clipboard');
  if (!(textarea instanceof HTMLTextAreaElement)) {
    return false;
  }

  textarea.value = text;
  textarea.select();
  return document.execCommand('copy');
}

browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!isCopyUrlMessage(message)) {
    return;
  }

  sendResponse({ ok: copyText(message.text) });
});
