import Link from 'next/link';
import { Button, Icons, Text, Icon } from 'react-basics';
import Page from 'components/layout/Page';
import PageHeader from 'components/layout/PageHeader';
import Funnel from 'assets/funnel.svg';
import Nodes from 'assets/nodes.svg';
import Lightbulb from 'assets/lightbulb.svg';
import styles from './ReportTemplates.module.css';
import { useMessages } from 'hooks';

const reports = [
  {
    title: 'Funnel',
    description: 'Understand the conversion and drop-off rate of users.',
    url: '/reports/funnel',
    icon: <Funnel />,
  },
];

function ReportItem({ title, description, url, icon }) {
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
            <Text>Create</Text>
          </Button>
        </Link>
      </div>
    </div>
  );
}

export function ReportTemplates() {
  const { formatMessage, labels } = useMessages();

  return (
    <Page>
      <PageHeader title={formatMessage(labels.reports)} />
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
