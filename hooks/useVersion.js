import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { checkVersion } from 'redux/actions/app';
import { VERSION_CHECK } from 'lib/constants';
import { getItem, setItem } from 'lib/web';

export default function useVersion(check) {
  const dispatch = useDispatch();
  const versions = useSelector(state => state.app.versions);
  const checked = versions.latest === getItem(VERSION_CHECK)?.version;

  const updateCheck = useCallback(() => {
    setItem(VERSION_CHECK, { version: versions.latest, time: Date.now() });
  }, [versions]);

  useEffect(() => {
    if (check && !versions.latest) {
      dispatch(checkVersion());
    }
  }, [versions, check]);

  return { ...versions, checked, updateCheck };
}
