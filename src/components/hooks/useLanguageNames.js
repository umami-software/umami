import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { httpGet } from 'next-basics';
import enUS from 'public/intl/language/en-US.json';

const languageNames = {
  'en-US': enUS,
};

export function useLanguageNames(locale) {
  const [list, setList] = useState(languageNames[locale] || enUS);
  const { basePath } = useRouter();

  async function loadData(locale) {
    const { data } = await httpGet(`${basePath}/intl/language/${locale}.json`);

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

  return list;
}

export default useLanguageNames;
