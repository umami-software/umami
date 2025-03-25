'use client';
import Report from '../[reportId]/Report';
import ReportHeader from '../[reportId]/ReportHeader';
import ReportMenu from '../[reportId]/ReportMenu';
import ReportBody from '../[reportId]/ReportBody';
import UTMParameters from './UTMParameters';
import UTMView from './UTMView';
import Tag from '@/assets/tag.svg';
import { REPORT_TYPES } from '@/lib/constants';

const defaultParameters = {
  type: REPORT_TYPES.utm,
  parameters: {},
};

export default function UTMReport({ reportId }: { reportId?: string }) {
  return (
    <Report reportId={reportId} defaultParameters={defaultParameters}>
      <ReportHeader icon={<Tag />} />
      <ReportMenu>
        <UTMParameters />
      </ReportMenu>
      <ReportBody>
        <UTMView />
      </ReportBody>
    </Report>
  );
}
