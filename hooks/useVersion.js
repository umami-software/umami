import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getItem } from 'lib/web';
import { checkVersion } from 'redux/actions/app';

const CHECK_INTERVAL = 24 * 60 * 60 * 1000;

export default function useVersion() {
  const dispatch = useDispatch();
  const versions = useSelector(state => state.app.versions);

  useEffect(() => {
    const lastCheck = getItem('umami.version-check');
    if (!lastCheck || Date.now() - lastCheck > CHECK_INTERVAL) {
      dispatch(checkVersion());
    }
  }, []);

  return versions;
}
