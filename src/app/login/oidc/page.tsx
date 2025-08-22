import { redirect } from 'next/navigation';

export default function () {
  if (!process.env.ENABLE_OIDC) {
    redirect('/login');
  } else {
    redirect('/api/auth/login/oidc');
  }
}
