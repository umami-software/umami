import { useMemo } from 'react';
import useFetch from 'hooks/useFetch';

export default function useVersion() {
  const { data } = useMemo(() =>
    useFetch('https://api.github.com/repos/mikecao/umami/releases/latest'),
  );

  if (!data || !data['tag_name']) return null;

  const latest = data['tag_name'].startsWith('v') ? data['tag_name'].slice(1) : data['tag_name'];
  const current = process.env.VERSION;

  if (latest === current) return null;

  const latestArray = latest.split('.');
  const currentArray = current.split('.');

  for (let i = 0; i < 3; i++) {
    if (Number(latestArray[i]) > Number(currentArray[i]))
      return {
        current: current,
        latest: latest,
      };
  }

  return null;
}
