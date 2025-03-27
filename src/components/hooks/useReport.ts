import { useContext } from 'react';
import { ReportContext } from '@/app/(main)/reports/[reportId]/Report';

export function useReport() {
  return useContext(ReportContext);
}
