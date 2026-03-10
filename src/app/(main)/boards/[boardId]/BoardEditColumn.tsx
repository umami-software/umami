import {
  Box,
  Button,
  Column,
  Dialog,
  Icon,
  Modal,
  Row,
  Tooltip,
  TooltipTrigger,
} from '@umami/react-zen';
import { useMemo, useState } from 'react';
import { Panel } from '@/components/common/Panel';
import { useBoard, useMessages, useNavigation } from '@/components/hooks';
import { Pencil, Plus, X } from '@/components/icons';
import { getBoardEntity, getBoardType, getResolvedComponentEntity } from '@/lib/boards';
import type { BoardComponentConfig } from '@/lib/types';
import { getComponentDefinition } from '../boardComponentRegistry';
import { BoardComponentRenderer } from './BoardComponentRenderer';
import { BoardComponentSelect } from './BoardComponentSelect';

export function BoardEditColumn({
  id,
  component,
  canEdit,
  onRemove,
  onSetComponent,
  canRemove = true,
}: {
  id: string;
  component?: BoardComponentConfig;
  canEdit: boolean;
  onRemove: (id: string) => void;
  onSetComponent: (id: string, config: BoardComponentConfig | null) => void;
  canRemove?: boolean;
}) {
  const [showSelect, setShowSelect] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const { board } = useBoard();
  const { t, labels } = useMessages();
  const { teamId } = useNavigation();
  const boardType = getBoardType(board);
  const { entityType: boardEntityType, entityId: boardEntityId } = getBoardEntity(board);
  const definition = component ? getComponentDefinition(component.type) : undefined;
  const { entityId } = getResolvedComponentEntity(board, component);
  const renderedComponent = useMemo(() => {
    if (!component || (!entityId && definition?.requiresWebsite !== false)) {
      return null;
    }

    return <BoardComponentRenderer config={component} websiteId={entityId} />;
  }, [component, definition?.requiresWebsite, entityId]);

  const handleSelect = (config: BoardComponentConfig) => {
    onSetComponent(id, config);
    setShowSelect(false);
  };

  const hasComponent = !!component;
  const canRemoveAction = hasComponent || canRemove;
  const title = component?.title;
  const description = component?.description;

  const handleRemove = () => {
    if (hasComponent) {
      onSetComponent(id, null);
    } else {
      onRemove(id);
    }
  };

  return (
    <Panel
      title={title}
      description={description}
      width="100%"
      height="100%"
      position="relative"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {canEdit && canRemoveAction && showActions && (
        <Box
          position="absolute"
          top="50%"
          left="50%"
          zIndex={100}
          style={{ transform: 'translate(-50%, -50%)' }}
        >
          <Row gap="1" padding="2" borderRadius backgroundColor="surface-sunken">
            {hasComponent && (
              <TooltipTrigger delay={0}>
                <Button variant="outline" onPress={() => setShowSelect(true)}>
                  <Icon size="sm">
                    <Pencil />
                  </Icon>
                </Button>
                <Tooltip>{t(labels.edit)}</Tooltip>
              </TooltipTrigger>
            )}
            <TooltipTrigger delay={0}>
              <Button variant="outline" onPress={handleRemove} isDisabled={!canRemoveAction}>
                <Icon size="sm">
                  <X />
                </Icon>
              </Button>
              <Tooltip>{t(labels.remove)}</Tooltip>
            </TooltipTrigger>
          </Row>
        </Box>
      )}
      {renderedComponent ? (
        <Column width="100%" height="100%" style={{ minHeight: 0 }}>
          <Box width="100%" flexGrow={1} overflow="auto" style={{ minHeight: 0 }}>
            {renderedComponent}
          </Box>
        </Column>
      ) : (
        canEdit && (
          <Column width="100%" height="100%" alignItems="center" justifyContent="center">
            <Button variant="outline" onPress={() => setShowSelect(true)}>
              <Icon>
                <Plus />
              </Icon>
            </Button>
          </Column>
        )
      )}
      <Modal isOpen={showSelect} onOpenChange={setShowSelect}>
        <Dialog
          title={t(labels.selectComponent)}
          style={{
            width: '1200px',
            maxWidth: 'calc(100vw - 40px)',
            maxHeight: 'calc(100dvh - 40px)',
            padding: '32px',
          }}
        >
          {() => (
            <BoardComponentSelect
              teamId={teamId}
              boardType={boardType}
              boardEntityType={boardEntityType}
              boardEntityId={boardEntityId}
              initialConfig={component}
              onSelect={handleSelect}
              onClose={() => setShowSelect(false)}
            />
          )}
        </Dialog>
      </Modal>
    </Panel>
  );
}
