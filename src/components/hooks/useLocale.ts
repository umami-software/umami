import { useEffect } from 'react';
import { httpGet, setItem } from 'next-basics';
import { LOCALE_CONFIG } from 'lib/constants';
import { getDateLocale, getTextDirection } from 'lib/lang';
import useStore, { setLocale } from 'store/app';
import { useForceUpdate } from './useForceUpdate';
import enUS from '../../../public/intl/country/en-US.json';

const messages = {
  'en-US': enUS,
};

const selector = (state: { locale: any }) => state.locale;

export function useLocale() {
  const locale = useStore(selector);
  const forceUpdate = useForceUpdate();
  const dir = getTextDirection(locale);
  const dateLocale = getDateLocale(locale);

  async function loadMessages(locale: string) {
    const { ok, data } = await httpGet(`${process.env.basePath}/intl/messages/${locale}.json`);

    if (ok) {
      messages[locale] = data;
    }
  }

  async function saveLocale(value: string) {
    if (!messages[value]) {
      await loadMessages(value);
    }

    setItem(LOCALE_CONFIG, value);

    document.getElementById('__next')?.setAttribute('dir', getTextDirection(value));

    if (locale !== value) {
      setLocale(value);
    } else {
      forceUpdate();
    }
  }

  useEffect(() => {
    if (!messages[locale]) {
      saveLocale(locale);
    }
  }, [locale]);

  useEffect(() => {
    const url = new URL(window?.location?.href);
    const locale = url.searchParams.get('locale');

    if (locale) {
      saveLocale(locale);
    }
  }, []);

  return { locale, saveLocale, messages, dir, dateLocale };
}

export default useLocale;
