import { configureLocalization } from '@lit/localize';
import { allLocales, sourceLocale, targetLocales } from '../locales.js';
export type LocaleTag = (typeof allLocales)[number];
export type Translation = (typeof targetLocales)[number];
export type Translations = Record<Translation, string>;

declare global {
  interface Window {
    localization?: {
      getLocale: () => string;
      setLocale: (locale: string) => void;
    };
  }
}

const { getLocale, setLocale } =
  window.localization ??
  configureLocalization({
    sourceLocale,
    targetLocales,
    loadLocale: _locale => {
      return import(
        /* @vite-ignore */ new URL(`./locales/${_locale}.js`, import.meta.url)
          .href
      );
    },
  });

/*
 * To prevent multiple calls to configureLocalization,
 * we store the getLocale and setLocale functions on the window object.
 * This happens now and again in development mode with HMR, perhaps
 * we should wrap this in a check for dev mode only?
 */
if (!window.localization) {
  window.localization = { getLocale, setLocale };
}

export { getLocale, setLocale };
export { allLocales, sourceLocale, targetLocales };
