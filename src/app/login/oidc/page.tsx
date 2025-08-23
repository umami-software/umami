import { redirect } from 'next/navigation';

export default function OidcLoginPage() {
  if (!process.env.ENABLE_OIDC) {
    redirect('/login');
  } else {
    redirect('/api/auth/login/oidc');
  }
}
