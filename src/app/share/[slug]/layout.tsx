import { ShareProvider } from '@/app/share/ShareProvider';

export default async function ({
  params,
  children,
}: {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}) {
  const { slug } = await params;

  return <ShareProvider slug={slug}>{children}</ShareProvider>;
}
