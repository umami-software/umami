'use client';
import Report from '../[reportId]/Report';
import ReportHeader from '../[reportId]/ReportHeader';
import ReportMenu from '../[reportId]/ReportMenu';
import ReportBody from '../[reportId]/ReportBody';
import JourneyParameters from './JourneyParameters';
import JourneyView from './JourneyView';
import Path from 'assets/path.svg';
import { REPORT_TYPES } from 'lib/constants';

const defaultParameters = {
  type: REPORT_TYPES.journey,
  parameters: { steps: 5 },
};

export default function JourneyReport({ reportId }: { reportId?: string }) {
  return (
    <Report reportId={reportId} defaultParameters={defaultParameters}>
      <ReportHeader icon={<Path />} />
      <ReportMenu>
        <JourneyParameters />
      </ReportMenu>
      <ReportBody>
        <JourneyView />
      </ReportBody>
    </Report>
  );
}
