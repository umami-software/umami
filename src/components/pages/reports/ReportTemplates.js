import Link from 'next/link';
import { Button, Icons, Text, Icon } from 'react-basics';
import Page from 'components/layout/Page';
import PageHeader from 'components/layout/PageHeader';
import Funnel from 'assets/funnel.svg';
import Lightbulb from 'assets/lightbulb.svg';
import Magnet from 'assets/magnet.svg';
import styles from './ReportTemplates.module.css';
import { useMessages } from 'components/hooks';

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

export function ReportTemplates({ showHeader = true }) {
  const { formatMessage, labels } = useMessages();

  const reports = [
    {
      title: formatMessage(labels.insights),
      description: formatMessage(labels.insightsDescription),
      url: '/reports/insights',
      icon: <Lightbulb />,
    },
    {
      title: formatMessage(labels.funnel),
      description: formatMessage(labels.funnelDescription),
      url: '/reports/funnel',
      icon: <Funnel />,
    },
    {
      title: formatMessage(labels.retention),
      description: formatMessage(labels.retentionDescription),
      url: '/reports/retention',
      icon: <Magnet />,
    },
  ];

  return (
    <Page>
      {showHeader && <PageHeader title={formatMessage(labels.reports)} />}
      <div className={styles.reports}>
        {reports.map(({ title, description, url, icon }) => {
          return (
            <ReportItem key={title} icon={icon} title={title} description={description} url={url} />
          );
        })}
      </div>
    </Page>
  );
}

export default ReportTemplates;
