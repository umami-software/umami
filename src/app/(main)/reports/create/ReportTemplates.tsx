import Funnel from '@/assets/funnel.svg';
import Money from '@/assets/money.svg';
import Lightbulb from '@/assets/lightbulb.svg';
import Magnet from '@/assets/magnet.svg';
import Path from '@/assets/path.svg';
import Tag from '@/assets/tag.svg';
import Target from '@/assets/target.svg';
import Network from '@/assets/network.svg';
import { useMessages, useTeamUrl } from '@/components/hooks';
import PageHeader from '@/components/layout/PageHeader';
import Link from 'next/link';
import { Button, Icon, Icons, Text } from 'react-basics';
import styles from './ReportTemplates.module.css';

export function ReportTemplates({ showHeader = true }: { showHeader?: boolean }) {
  const { formatMessage, labels } = useMessages();
  const { renderTeamUrl } = useTeamUrl();

  const reports = [
    {
      title: formatMessage(labels.insights),
      description: formatMessage(labels.insightsDescription),
      url: renderTeamUrl('/reports/insights'),
      icon: <Lightbulb />,
    },
    {
      title: formatMessage(labels.funnel),
      description: formatMessage(labels.funnelDescription),
      url: renderTeamUrl('/reports/funnel'),
      icon: <Funnel />,
    },
    {
      title: formatMessage(labels.retention),
      description: formatMessage(labels.retentionDescription),
      url: renderTeamUrl('/reports/retention'),
      icon: <Magnet />,
    },
    {
      title: formatMessage(labels.utm),
      description: formatMessage(labels.utmDescription),
      url: renderTeamUrl('/reports/utm'),
      icon: <Tag />,
    },
    {
      title: formatMessage(labels.goals),
      description: formatMessage(labels.goalsDescription),
      url: renderTeamUrl('/reports/goals'),
      icon: <Target />,
    },
    {
      title: formatMessage(labels.journey),
      description: formatMessage(labels.journeyDescription),
      url: renderTeamUrl('/reports/journey'),
      icon: <Path />,
    },
    {
      title: formatMessage(labels.revenue),
      description: formatMessage(labels.revenueDescription),
      url: renderTeamUrl('/reports/revenue'),
      icon: <Money />,
    },
    {
      title: formatMessage(labels.attribution),
      description: formatMessage(labels.attributionDescription),
      url: renderTeamUrl('/reports/attribution'),
      icon: <Network />,
    },
  ];

  return (
    <>
      {showHeader && <PageHeader title={formatMessage(labels.reports)} />}
      <div className={styles.reports}>
        {reports.map(({ title, description, url, icon }) => {
          return (
            <ReportItem key={title} icon={icon} title={title} description={description} url={url} />
          );
        })}
      </div>
    </>
  );
}

function ReportItem({ title, description, url, icon }) {
  const { formatMessage, labels } = useMessages();

  return (
    <div className={styles.report}>
      <div className={styles.title}>
        <Icon size="lg">{icon}</Icon>
        <Text>{title}</Text>
      </div>
      <div className={styles.description}>{description}</div>
      <div className={styles.buttons}>
        <Link href={url}>
          <Button variant="primary">
            <Icon>
              <Icons.Plus />
            </Icon>
            <Text>{formatMessage(labels.create)}</Text>
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default ReportTemplates;
