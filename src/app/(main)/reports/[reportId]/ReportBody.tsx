import { Panel } from '@/components/common/Panel';
import { useReport } from '@/components/hooks';

export function ReportBody({ children }) {
  const { report } = useReport();

  if (!report) {
    return null;
  }

  return <Panel>{children}</Panel>;
}
