import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import semver from 'semver';
import { getItem, setItem } from 'lib/web';
import { checkVersion } from 'redux/actions/app';
import { VERSION_CHECK } from 'lib/constants';

export default function useVersion() {
  const dispatch = useDispatch();
  const versions = useSelector(state => state.app.versions);
  const lastCheck = getItem(VERSION_CHECK);

  const { current, latest } = versions;
  const hasUpdate = latest && semver.gt(latest, current) && lastCheck?.version !== latest;

  const updateCheck = useCallback(() => {
    setItem(VERSION_CHECK, { version: latest, time: Date.now() });
  }, [versions]);

  useEffect(() => {
    if (!versions.latest) {
      dispatch(checkVersion());
    }
  }, [versions]);

  return { ...versions, hasUpdate, updateCheck };
}
