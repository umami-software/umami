import { useContext } from 'react';
import { ReportContext } from '../[reportId]/Report';

export default function JourneyView() {
  const { report } = useContext(ReportContext);
  const { data } = report || {};

  if (!data) {
    return null;
  }

  return <div>{JSON.stringify(data)}</div>;
}
