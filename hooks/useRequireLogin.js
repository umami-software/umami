import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser } from 'redux/actions/user';
import { useRouter } from 'next/router';
import { get } from 'lib/web';

export default function useRequireLogin() {
  const router = useRouter();
  const dispatch = useDispatch();
  const storeUser = useSelector(state => state.user);
  const [loading, setLoading] = useState(!storeUser);
  const [user, setUser] = useState(storeUser);

  async function loadUser() {
    setLoading(true);

    const { ok, data } = await get(`${router.basePath}/api/auth/verify`);

    if (!ok) {
      return router.push('/login');
    }

    await dispatch(updateUser(data));

    setUser(user);
    setLoading(false);
  }

  useEffect(() => {
    if (!loading && user) {
      return;
    }

    loadUser();
  }, []);

  return { user, loading };
}
