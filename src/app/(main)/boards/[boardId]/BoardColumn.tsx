import {
  Box,
  Button,
  Column,
  Dialog,
  Icon,
  Modal,
  Tooltip,
  TooltipTrigger,
} from '@umami/react-zen';
import { useMemo, useState } from 'react';
import { useBoard, useMessages } from '@/components/hooks';
import { Pencil, Plus, X } from '@/components/icons';
import type { BoardComponentConfig } from '@/lib/types';
import styles from './BoardColumn.module.css';
import { BoardComponentRenderer } from './BoardComponentRenderer';
import { BoardComponentSelect } from './BoardComponentSelect';

export function BoardColumn({
  id,
  component,
  editing = false,
  onRemove,
  onSetComponent,
  canRemove = true,
}: {
  id: string;
  component?: BoardComponentConfig;
  editing?: boolean;
  onRemove?: (id: string) => void;
  onSetComponent?: (id: string, config: BoardComponentConfig | null) => void;
  canRemove?: boolean;
}) {
  const [showSelect, setShowSelect] = useState(false);
  const { board } = useBoard();
  const { t, labels } = useMessages();
  const websiteId = board?.parameters?.websiteId;
  const renderedComponent = useMemo(() => {
    if (!component || !websiteId) {
      return null;
    }

    return <BoardComponentRenderer config={component} websiteId={websiteId} />;
  }, [component, websiteId]);

  const handleSelect = (config: BoardComponentConfig) => {
    onSetComponent?.(id, config);
    setShowSelect(false);
  };

  return (
    <Column
      marginTop="3"
      marginLeft="3"
      width="100%"
      height="100%"
      alignItems="center"
      justifyContent="center"
      backgroundColor="surface-sunken"
      position="relative"
      className={styles.column}
    >
      {editing && canRemove && (
        <Box
          className={styles.columnAction}
          position="absolute"
          top="10px"
          right="20px"
          zIndex={100}
        >
          <TooltipTrigger delay={0}>
            <Button variant="outline" onPress={() => onRemove?.(id)}>
              <Icon size="sm">
                <X />
              </Icon>
            </Button>
            <Tooltip>Remove column</Tooltip>
          </TooltipTrigger>
        </Box>
      )}
      {renderedComponent ? (
        <>
          <Box width="100%" height="100%" overflow="auto">
            {renderedComponent}
          </Box>
          {editing && (
            <Box
              className={styles.columnAction}
              position="absolute"
              bottom="10px"
              right="20px"
              zIndex={100}
            >
              <TooltipTrigger delay={0}>
                <Button variant="outline" onPress={() => setShowSelect(true)}>
                  <Icon size="sm">
                    <Pencil />
                  </Icon>
                </Button>
                <Tooltip>Change component</Tooltip>
              </TooltipTrigger>
            </Box>
          )}
        </>
      ) : (
        editing && (
          <Button variant="outline" onPress={() => setShowSelect(true)}>
            <Icon>
              <Plus />
            </Icon>
          </Button>
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
              websiteId={websiteId}
              onSelect={handleSelect}
              onClose={() => setShowSelect(false)}
            />
          )}
        </Dialog>
      </Modal>
    </Column>
  );
}
