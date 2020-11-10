import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import { get } from 'lib/web';
import { updateUser } from 'redux/actions/user';

export default function LogoutPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { basePath } = router;

  useEffect(() => {
    dispatch(updateUser(null));
    get(`${basePath}/api/auth/logout`).then(() => router.push('/login'));
  }, []);

  return null;
}
