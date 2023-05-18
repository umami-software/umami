import Link from 'next/link';
import { Button, Icons, Text, Icon } from 'react-basics';
import Page from 'components/layout/Page';
import PageHeader from 'components/layout/PageHeader';
import Funnel from 'assets/funnel.svg';
import Nodes from 'assets/nodes.svg';
import Lightbulb from 'assets/lightbulb.svg';
import styles from './ReportsList.module.css';

const reports = [
  {
    title: 'Event data',
    description: 'Query your event data.',
    url: '/reports/event-data',
    icon: <Nodes />,
  },
  {
    title: 'Funnel',
    description: 'Understand the conversion and drop-off rate of users.',
    url: '/reports/funnel',
    icon: <Funnel />,
  },
  {
    title: 'Insights',
    description: 'Explore your data by applying segments and filters.',
    url: '/reports/insights',
    icon: <Lightbulb />,
  },
];

function Report({ title, description, url, icon }) {
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

export default function ReportsList() {
  return (
    <Page>
      <PageHeader title="Reports" />
      <div className={styles.reports}>
        {reports.map(({ title, description, url, icon }) => {
          return (
            <Report key={title} icon={icon} title={title} description={description} url={url} />
          );
        })}
      </div>
    </Page>
  );
}
