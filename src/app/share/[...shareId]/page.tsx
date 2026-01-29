import { ShareProvider } from '@/app/share/ShareProvider';
import { SharePage } from './SharePage';

export default async function ({ params }: { params: Promise<{ shareId: string[] }> }) {
  const { shareId } = await params;
  const [slug] = shareId;

  return (
    <ShareProvider shareId={slug}>
      <SharePage />
    </ShareProvider>
  );
}
