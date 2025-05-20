import { Button, Icon, Text, Row } from '@umami/react-zen';
import { PageHeader } from '@/components/common/PageHeader';
import { useWebsite } from '@/components/hooks/useWebsite';
import { Lucide } from '@/components/icons';
import { Favicon } from '@/components/common/Favicon';

export function WebsiteHeader() {
  const website = useWebsite();

  return (
    <PageHeader title={website.name} icon={<Favicon domain={website.domain} />}>
      <Row alignItems="center" gap>
        <Button>
          <Icon>
            <Lucide.Share />
          </Icon>
          <Text>Share</Text>
        </Button>
        <Button>
          <Icon>
            <Lucide.Edit />
          </Icon>
          <Text>Edit</Text>
        </Button>
      </Row>
    </PageHeader>
  );
}
