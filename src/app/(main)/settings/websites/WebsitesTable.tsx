import { ReactNode, useState } from 'react';
import { Text, Icon, Icons, GridTable, GridColumn, Checkbox, Modal } from 'react-basics';
import { useMessages, useTeamUrl } from '@/components/hooks';
import WebsiteDeleteForm from './[websiteId]/WebsiteDeleteForm';
import LinkButton from '@/components/common/LinkButton';
export interface WebsitesTableProps {
  data: any[];
  showActions?: boolean;
  allowEdit?: boolean;
  allowView?: boolean;
  teamId?: string;
  children?: ReactNode;
  updateChildren?: () => void;
}

export function WebsitesTable({
  data = [],
  showActions,
  allowEdit,
  allowView,
  children,
  updateChildren,
}: WebsitesTableProps) {
  const { formatMessage, labels } = useMessages();
  const { renderTeamUrl } = useTeamUrl();
  const [deleteIds, setDeleteIds] = useState([]);
  const [showConf, setShowConf] = useState(false);

  if (!data?.length) {
    return children;
  }
  const checked = (websiteId: string) => {
    if (deleteIds.includes(websiteId)) {
      setDeleteIds(deleteIds.filter(prev => prev !== websiteId));
    } else {
      setDeleteIds(prev => [...prev, websiteId]);
    }
  };

  return (
    <>
      <GridTable data={data}>
        <GridColumn
          width="40px"
          name="delete"
          label={
            deleteIds.length > 0 ? (
              <Icon
                style={{ color: 'red' }}
                onClick={() => {
                  setShowConf(true);
                }}
                size={'lg'}
              >
                <Icons.Trash />
              </Icon>
            ) : (
              ''
            )
          }
        >
          {row => {
            const { id: websiteId } = row;
            return (
              <Checkbox
                defaultChecked={false}
                checked={deleteIds.includes(websiteId)}
                onChange={() => {
                  checked(websiteId);
                }}
                value={websiteId}
              />
            );
          }}
        </GridColumn>
        <GridColumn name="name" label={formatMessage(labels.name)} />
        <GridColumn name="domain" label={formatMessage(labels.domain)} />
        {showActions && (
          <GridColumn name="action" label=" " alignment="end">
            {row => {
              const { id: websiteId } = row;

              return (
                <>
                  {allowEdit && (
                    <LinkButton href={renderTeamUrl(`/settings/websites/${websiteId}`)}>
                      <Icon data-test="link-button-edit">
                        <Icons.Edit />
                      </Icon>
                      <Text>{formatMessage(labels.edit)}</Text>
                    </LinkButton>
                  )}
                  {allowView && (
                    <LinkButton href={renderTeamUrl(`/websites/${websiteId}`)}>
                      <Icon>
                        <Icons.ArrowRight />
                      </Icon>
                      <Text>{formatMessage(labels.view)}</Text>
                    </LinkButton>
                  )}
                </>
              );
            }}
          </GridColumn>
        )}
      </GridTable>
      {showConf && (
        <Modal title={formatMessage(labels.deleteWebsite)}>
          {
            <WebsiteDeleteForm
              websiteId={deleteIds}
              CONFIRM_VALUE={'DELETE MULTIPLE'}
              onClose={() => {
                setShowConf(false);
                updateChildren();
                setDeleteIds([]);
              }}
            />
          }
        </Modal>
      )}
    </>
  );
}

export default WebsitesTable;
