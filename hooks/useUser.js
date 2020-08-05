import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser } from 'redux/actions/user';

export async function fetchUser() {
  const res = await fetch('/api/auth/verify');

  if (!res.ok) {
    return null;
  }

  return await res.json();
}

export default function useUser() {
  const dispatch = useDispatch();
  const storeUser = useSelector(state => state.user);
  const [loading, setLoading] = useState(!storeUser);
  const [user, setUser] = useState(storeUser || null);

  useEffect(() => {
    if (!loading && user) {
      return;
    }

    setLoading(true);

    fetchUser().then(async user => {
      if (!user) {
        window.location.href = '/login';
        return;
      }

      await dispatch(updateUser({ user: user }));

      setUser(user);
      setLoading(false);
    });
  }, []);

  return { user, loading };
}
