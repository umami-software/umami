import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { get, setItem } from 'lib/web';
import { LOCALE_CONFIG } from 'lib/constants';
import { getDateLocale, getTextDirection } from 'lib/lang';
import useStore, { setLocale } from 'store/app';
import useForceUpdate from 'hooks/useForceUpdate';
import enUS from 'public/intl/messages/en-US.json';

const messages = {
  'en-US': enUS,
};

const selector = state => state.locale;

export default function useLocale() {
  const locale = useStore(selector);
  const { basePath } = useRouter();
  const forceUpdate = useForceUpdate();
  const dir = getTextDirection(locale);
  const dateLocale = getDateLocale(locale);

  async function loadMessages(locale) {
    const { ok, data } = await get(`${basePath}/intl/messages/${locale}.json`);

    if (ok) {
      messages[locale] = data;
    }
  }

  async function saveLocale(value) {
    if (!messages[value]) {
      await loadMessages(value);
    }

    setItem(LOCALE_CONFIG, value);

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

  return { locale, saveLocale, messages, dir, dateLocale };
}
