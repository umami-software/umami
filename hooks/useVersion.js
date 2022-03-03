import { useEffect, useCallback } from 'react';
import useStore, { checkVersion } from 'store/version';
import { VERSION_CHECK } from 'lib/constants';
import { getItem, setItem } from 'lib/web';

export default function useVersion(check) {
  const versions = useStore();
  const checked = versions.latest === getItem(VERSION_CHECK)?.version;

  const updateCheck = useCallback(() => {
    setItem(VERSION_CHECK, { version: versions.latest, time: Date.now() });
  }, [versions]);

  useEffect(() => {
    if (check && !versions.latest) {
      checkVersion();
    }
  }, [versions, check]);

  return { ...versions, checked, updateCheck };
}
