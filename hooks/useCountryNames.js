import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { get } from 'lib/web';
import enUS from 'public/country/en-US.json';

const countryNames = {
  'en-US': enUS,
};

export default function useCountryNames(locale) {
  const [list, setList] = useState(countryNames[locale] || enUS);
  const { basePath } = useRouter();

  async function loadData(locale) {
    const { ok, data } = await get(`${basePath}/country/${locale}.json`);

    if (ok) {
      countryNames[locale] = data;
      setList(countryNames[locale]);
    } else {
      setList(enUS);
    }
  }

  useEffect(() => {
    if (!countryNames[locale]) {
      loadData(locale);
    } else {
      setList(countryNames[locale]);
    }
  }, [locale]);

  return list;
}
