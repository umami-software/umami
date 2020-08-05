import { useEffect } from 'react';

export default function LogoutPage() {
  useEffect(() => {
    fetch('/api/auth/logout').then(() => (window.location.href = '/login'));
  }, []);

  return null;
}
