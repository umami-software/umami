import { SharePage } from './SharePage';

export default async function ({ params }: { params: Promise<{ shareId: string[] }> }) {
  const { shareId } = await params;
  const [slug, ...path] = shareId;

  return <SharePage shareId={slug} path={path.join('/')} />;
}
