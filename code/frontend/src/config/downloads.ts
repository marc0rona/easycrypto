export const CHROME_EXTENSION_DOWNLOAD_PATH =
  '/downloads/ez-crypt0-extension-1.0.1.zip';

export function downloadChromeExtension() {
  const anchor = document.createElement('a');
  anchor.href = CHROME_EXTENSION_DOWNLOAD_PATH;
  anchor.download = 'ez-crypt0-extension-1.0.1.zip';
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}
