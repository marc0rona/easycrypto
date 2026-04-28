import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Popup } from './Popup';
import popupStyles from './popup.css?inline';

const container = document.getElementById('root');
const popupStyleId = 'ez-crypt0-popup-styles';
const popupThemeStorageKey = 'ez-crypt0-popup-theme';
const storedPopupTheme =
  typeof window !== 'undefined' ? window.localStorage.getItem(popupThemeStorageKey) : null;
const initialPopupTheme = storedPopupTheme === 'dark' ? 'dark' : 'light';

if (!container) {
  throw new Error('Popup root element not found.');
}

document.documentElement.dataset.theme = initialPopupTheme;
document.body.dataset.theme = initialPopupTheme;

if (!document.getElementById(popupStyleId)) {
  const styleElement = document.createElement('style');

  styleElement.id = popupStyleId;
  styleElement.textContent = popupStyles;

  document.head.appendChild(styleElement);
}

createRoot(container).render(
  <StrictMode>
    <Popup />
  </StrictMode>,
);
