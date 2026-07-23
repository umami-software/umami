import type { Metadata } from 'next';
import { isPasswordAuthDisabled } from '@/lib/password-auth';
import { InvitePage } from './InvitePage';

export const dynamic = 'force-dynamic';

export default function Page() {
  return <InvitePage passwordAuthDisabled={isPasswordAuthDisabled()} />;
}

export const metadata: Metadata = {
  title: 'Invitation',
};
