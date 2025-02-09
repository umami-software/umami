import { useState, useEffect } from 'react';
import { httpGet } from '@/lib/fetch';
import enUS from '../../../public/intl/language/en-US.json';

const languageNames = {
  'en-US': enUS,
};

export function useLanguageNames(locale) {
  const [list, setList] = useState(languageNames[locale] || enUS);

  async function loadData(locale) {
    const { data } = await httpGet(`${process.env.basePath || ''}/intl/language/${locale}.json`);

    if (data) {
      languageNames[locale] = data;
      setList(languageNames[locale]);
    } else {
      setList(enUS);
    }
  }

  useEffect(() => {
    if (!languageNames[locale]) {
      loadData(locale);
    } else {
      setList(languageNames[locale]);
    }
  }, [locale]);

  return { languageNames: list };
}

export default useLanguageNames;
