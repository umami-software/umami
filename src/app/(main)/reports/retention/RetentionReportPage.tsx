'use client';
import { Metadata } from 'next';
import RetentionReport from './RetentionReport';

export default function RetentionReportPage() {
  return <RetentionReport />;
}

export const metadata: Metadata = {
  title: 'Retention Report',
};
