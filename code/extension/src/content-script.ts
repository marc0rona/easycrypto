type CryptoType =
  | 'ADA'
  | 'ATOM'
  | 'BTC'
  | 'DOT'
  | 'ETH'
  | 'TON'
  | 'TRX';

export {};

interface DetectedAddressPayload {
  address: string;
  type: CryptoType;
}

interface AddressDetectedMessage {
  type: 'ADDRESS_DETECTED';
  payload: DetectedAddressPayload;
}

const ADA_REGEX =
  /(?<![A-Za-z0-9])(?:addr1[0-9a-z]{20,}|Ae2[1-9A-HJ-NP-Za-km-z]{20,}|DdzFF[1-9A-HJ-NP-Za-km-z]{20,})(?![A-Za-z0-9])/g;
const ATOM_REGEX = /(?<![A-Za-z0-9])cosmos1[0-9a-z]{38}(?![A-Za-z0-9])/g;
const ETH_REGEX = /(?<![A-Za-z0-9])0x[a-fA-F0-9]{40}(?![A-Za-z0-9])/g;
const BTC_REGEX =
  /(?<![A-Za-z0-9])(?:bc1[a-z0-9]{11,71}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})(?![A-Za-z0-9])/gi;
const DOT_REGEX = /(?<![A-Za-z0-9])1[1-9A-HJ-NP-Za-km-z]{47}(?![A-Za-z0-9])/g;
const TON_REGEX = /(?<![A-Za-z0-9_-])(?:EQ|UQ|kQ|0Q)[A-Za-z0-9_-]{46}(?![A-Za-z0-9_-])/g;
const TRX_REGEX = /(?<![A-Za-z0-9])T[1-9A-HJ-NP-Za-km-z]{33}(?![A-Za-z0-9])/g;
const IGNORED_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE']);

const detectedAddresses = new Set<string>();
const visibilityCache = new WeakMap<Element, boolean>();

function isVisibleElement(element: Element | null): boolean {
  if (!element) {
    return false;
  }

  const cachedVisibility = visibilityCache.get(element);

  if (cachedVisibility !== undefined) {
    return cachedVisibility;
  }

  if (IGNORED_TAGS.has(element.tagName)) {
    visibilityCache.set(element, false);
    return false;
  }

  if (element instanceof HTMLElement) {
    if (element.hidden || element.getAttribute('aria-hidden') === 'true') {
      visibilityCache.set(element, false);
      return false;
    }
  }

  const computedStyle = window.getComputedStyle(element);

  if (
    computedStyle.display === 'none' ||
    computedStyle.visibility === 'hidden' ||
    computedStyle.visibility === 'collapse'
  ) {
    visibilityCache.set(element, false);
    return false;
  }

  const parentIsVisible = element.parentElement ? isVisibleElement(element.parentElement) : true;
  const isVisible = parentIsVisible;

  visibilityCache.set(element, isVisible);

  return isVisible;
}

function emitDetectedAddress(payload: DetectedAddressPayload): void {
  if (detectedAddresses.has(payload.address)) {
    return;
  }

  detectedAddresses.add(payload.address);

  const message: AddressDetectedMessage = {
    type: 'ADDRESS_DETECTED',
    payload,
  };

  chrome.runtime.sendMessage(message, () => {
    void chrome.runtime.lastError;
  });
}

function detectAddressesInText(text: string): void {
  ADA_REGEX.lastIndex = 0;

  for (const match of text.matchAll(ADA_REGEX)) {
    const [address] = match;

    if (address) {
      emitDetectedAddress({ address, type: 'ADA' });
    }
  }

  ATOM_REGEX.lastIndex = 0;

  for (const match of text.matchAll(ATOM_REGEX)) {
    const [address] = match;

    if (address) {
      emitDetectedAddress({ address, type: 'ATOM' });
    }
  }

  ETH_REGEX.lastIndex = 0;

  for (const match of text.matchAll(ETH_REGEX)) {
    const [address] = match;

    if (address) {
      emitDetectedAddress({ address, type: 'ETH' });
    }
  }

  BTC_REGEX.lastIndex = 0;

  for (const match of text.matchAll(BTC_REGEX)) {
    const [address] = match;

    if (address) {
      emitDetectedAddress({ address, type: 'BTC' });
    }
  }

  DOT_REGEX.lastIndex = 0;

  for (const match of text.matchAll(DOT_REGEX)) {
    const [address] = match;

    if (address) {
      emitDetectedAddress({ address, type: 'DOT' });
    }
  }

  TON_REGEX.lastIndex = 0;

  for (const match of text.matchAll(TON_REGEX)) {
    const [address] = match;

    if (address) {
      emitDetectedAddress({ address, type: 'TON' });
    }
  }

  TRX_REGEX.lastIndex = 0;

  for (const match of text.matchAll(TRX_REGEX)) {
    const [address] = match;

    if (address) {
      emitDetectedAddress({ address, type: 'TRX' });
    }
  }
}

function scanVisibleTextContent(): void {
  if (!document.body) {
    return;
  }

  const textWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const textContent = node.textContent?.trim();

      if (!textContent) {
        return NodeFilter.FILTER_REJECT;
      }

      const parentElement = node.parentElement;

      if (!parentElement || !isVisibleElement(parentElement)) {
        return NodeFilter.FILTER_REJECT;
      }

      return NodeFilter.FILTER_ACCEPT;
    },
  });

  let currentNode = textWalker.nextNode();

  while (currentNode) {
    const textContent = currentNode.textContent;

    if (textContent) {
      detectAddressesInText(textContent);
    }

    currentNode = textWalker.nextNode();
  }
}

(() => {
  let hasScanned = false;

  const runInitialScan = () => {
    if (hasScanned) {
      return;
    }

    hasScanned = true;
    scanVisibleTextContent();
  };

  if (document.readyState === 'complete') {
    runInitialScan();
    return;
  }

  window.addEventListener('load', runInitialScan, { once: true });
})();
