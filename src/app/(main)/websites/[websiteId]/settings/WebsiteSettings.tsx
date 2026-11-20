import { Column } from '@umami/react-zen';
import { Panel } from '@/components/common/Panel';
import { WebsiteAlerts } from './WebsiteAlerts';
import { WebsiteData } from './WebsiteData';
import { WebsiteEditForm } from './WebsiteEditForm';
import { WebsiteFilterRules } from './WebsiteFilterRules';
import { WebsiteReplaySettings } from './WebsiteReplaySettings';
import { WebsiteShareForm } from './WebsiteShareForm';
import { WebsiteTrackingCode } from './WebsiteTrackingCode';

export function WebsiteSettings({ websiteId }: { websiteId: string; openExternal?: boolean }) {
  return (
    <Column gap="6">
      <Panel>
        <WebsiteEditForm websiteId={websiteId} />
      </Panel>
      <Panel>
        <WebsiteTrackingCode websiteId={websiteId} />
      </Panel>
      <Panel>
        <WebsiteFilterRules websiteId={websiteId} />
      </Panel>
      <Panel>
        <WebsiteAlerts websiteId={websiteId} />
      </Panel>
      <Panel>
        <WebsiteReplaySettings websiteId={websiteId} />
      </Panel>
      <Panel>
        <WebsiteShareForm websiteId={websiteId} />
      </Panel>
      <Panel>
        <WebsiteData websiteId={websiteId} />
      </Panel>
    </Column>
  );
}
