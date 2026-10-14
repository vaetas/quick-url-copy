export function injectCopiedToast(): void {
  const hostId = 'quick-url-copy-toast-host';
  const durationMs = 2000;
  const fadeMs = 150;

  document.getElementById(hostId)?.remove();

  const host = document.createElement('div');
  host.id = hostId;
  host.style.cssText = [
    'all: initial',
    'position: fixed',
    'top: 16px',
    'right: 16px',
    'z-index: 2147483647',
    'pointer-events: none',
    'display: block',
  ].join(';');

  const toast = document.createElement('div');
  toast.textContent = 'Copied';
  toast.setAttribute('role', 'status');
  toast.style.cssText = [
    'display: block',
    'box-sizing: border-box',
    'padding: 7px 12px',
    'border-radius: 6px',
    'background: #1a1a1a',
    'color: #fff',
    'font-family: system-ui, -apple-system, sans-serif',
    'font-size: 14px',
    'font-weight: 600',
    'line-height: 1.3',
    'letter-spacing: 0.01em',
    'white-space: nowrap',
    'box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.28)',
    'opacity: 0',
  ].join(';');

  host.attachShadow({ mode: 'closed' }).append(toast);
  document.documentElement.append(host);

  const fadeIn = toast.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration: fadeMs,
    fill: 'forwards',
    easing: 'ease-out',
  });

  const removeHost = () => host.remove();

  const fadeOut = () => {
    toast
      .animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: fadeMs,
        fill: 'forwards',
        easing: 'ease-in',
      })
      .finished.then(removeHost)
      .catch(removeHost);
  };

  void fadeIn.finished
    .then(() => {
      window.setTimeout(fadeOut, durationMs - fadeMs * 2);
    })
    .catch(fadeOut);
}
