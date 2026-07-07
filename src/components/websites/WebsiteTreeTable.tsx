'use client';

import {
  Button,
  Column,
  Dialog,
  Grid,
  Icon,
  Modal,
  Row,
  Text,
} from '@umami/react-zen';
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { DateDistance } from '@/components/common/DateDistance';
import { LinkButton } from '@/components/common/LinkButton';
import { useMessages, useNavigation } from '@/components/hooks';
import {
  ChevronDown,
  ChevronRight,
  Folder,
  FolderPlus,
  SquarePen,
  Trash,
} from '@/components/icons';
import type { WebsiteTreeNode } from '@/lib/websiteTree';
import { WebsiteGroupAddForm } from '@/app/(main)/websites/WebsiteGroupAddForm';
import { WebsiteGroupDeleteForm } from '@/app/(main)/websites/WebsiteGroupDeleteForm';
import { WebsiteGroupEditForm } from '@/app/(main)/websites/WebsiteGroupEditForm';

function collectGroupIds(nodes: WebsiteTreeNode[]): Set<string> {
  const ids = new Set<string>();

  function walk(items: WebsiteTreeNode[]) {
    for (const node of items) {
      if (node.type === 'group') {
        ids.add(node.id);
        walk(node.children);
      }
    }
  }

  walk(nodes);
  return ids;
}

export function WebsiteTreeTable({
  data,
  teamId,
  showActions = true,
  allowEdit = true,
  allowView = true,
  renderLink,
  onModified,
}: {
  data: WebsiteTreeNode[];
  teamId?: string;
  showActions?: boolean;
  allowEdit?: boolean;
  allowView?: boolean;
  renderLink?: (row: any) => ReactNode;
  onModified?: () => void;
}) {
  const { t, labels } = useMessages();
  const { renderUrl } = useNavigation();
  const [expanded, setExpanded] = useState<Set<string>>(() => collectGroupIds(data));
  const [editGroup, setEditGroup] = useState<any>(null);
  const [deleteGroup, setDeleteGroup] = useState<any>(null);
  const [addSubgroup, setAddSubgroup] = useState<string | null>(null);

  const toggleExpanded = useCallback((groupId: string) => {
    setExpanded(prev => {
      const next = new Set(prev);

      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }

      return next;
    });
  }, []);

  const handleModified = useCallback(() => {
    onModified?.();
  }, [onModified]);

  const rows = useMemo(() => {
    const result: ReactNode[] = [];

    function renderNodes(nodes: WebsiteTreeNode[], depth: number) {
      for (const node of nodes) {
        if (node.type === 'group') {
          const isExpanded = expanded.has(node.id);

          result.push(
            <Grid
              key={`group-${node.id}`}
              columns="1fr 1fr 200px 50px"
              alignItems="center"
              gap="3"
              paddingY="2"
              paddingX="2"
              borderBottom
            >
              <Row alignItems="center" gap="2" style={{ paddingLeft: depth * 20 }}>
                <Button variant="quiet" onPress={() => toggleExpanded(node.id)}>
                  <Icon size="sm">
                    {isExpanded ? <ChevronDown /> : <ChevronRight />}
                  </Icon>
                </Button>
                <Icon size="md" color="muted">
                  <Folder />
                </Icon>
                <Text weight="medium">{node.name}</Text>
              </Row>
              <Text color="muted">—</Text>
              <Text color="muted">—</Text>
              {showActions && allowEdit && (
                <Row justifyContent="flex-end" gap="1">
                  <Button variant="quiet" onPress={() => setAddSubgroup(node.id)}>
                    <Icon>
                      <FolderPlus />
                    </Icon>
                  </Button>
                  <Button variant="quiet" onPress={() => setEditGroup(node)}>
                    <Icon>
                      <SquarePen />
                    </Icon>
                  </Button>
                  <Button variant="quiet" onPress={() => setDeleteGroup(node)}>
                    <Icon>
                      <Trash />
                    </Icon>
                  </Button>
                </Row>
              )}
            </Grid>,
          );

          if (isExpanded) {
            renderNodes(node.children, depth + 1);
          }
        } else if (allowView) {
          result.push(
            <Grid
              key={`website-${node.id}`}
              columns="1fr 1fr 200px 50px"
              alignItems="center"
              gap="3"
              paddingY="2"
              paddingX="2"
              borderBottom
            >
              <Row alignItems="center" gap="2" style={{ paddingLeft: depth * 20 + 36 }}>
                {renderLink ? renderLink(node) : <Text>{node.name}</Text>}
              </Row>
              <Text truncate>{node.domain ?? '—'}</Text>
              <Text>
                {node.createdAt ? <DateDistance date={new Date(node.createdAt)} /> : '—'}
              </Text>
              {showActions && (
                <Row justifyContent="flex-end">
                  <LinkButton
                    href={renderUrl(`/websites/${node.id}/settings`, false)}
                    variant="quiet"
                  >
                    <Icon>
                      <SquarePen />
                    </Icon>
                  </LinkButton>
                </Row>
              )}
            </Grid>,
          );
        }
      }
    }

    renderNodes(data, 0);
    return result;
  }, [
    data,
    expanded,
    toggleExpanded,
    showActions,
    allowEdit,
    allowView,
    renderLink,
    renderUrl,
  ]);

  return (
    <Column>
      <Grid
        columns="1fr 1fr 200px 50px"
        alignItems="center"
        gap="3"
        paddingY="2"
        paddingX="2"
        borderBottom
        backgroundColor="2"
      >
        <Text weight="medium">{t(labels.name)}</Text>
        <Text weight="medium">{t(labels.domain)}</Text>
        <Text weight="medium">{t(labels.created)}</Text>
        {showActions && <Text />}
      </Grid>
      {rows}
      <Modal isOpen={!!editGroup}>
        <Dialog style={{ width: 400 }} title={t(labels.edit)}>
          {editGroup && (
            <WebsiteGroupEditForm
              groupId={editGroup.id}
              teamId={teamId}
              group={{ name: editGroup.name, parentId: editGroup.parentId }}
              onSave={() => {
                handleModified();
                setEditGroup(null);
              }}
              onClose={() => setEditGroup(null)}
            />
          )}
        </Dialog>
      </Modal>
      <Modal isOpen={!!deleteGroup}>
        <Dialog style={{ width: 400 }} title={t(labels.delete)}>
          {deleteGroup && (
            <WebsiteGroupDeleteForm
              groupId={deleteGroup.id}
              groupName={deleteGroup.name}
              hasChildren={deleteGroup.children?.length > 0}
              onSave={() => {
                handleModified();
                setDeleteGroup(null);
              }}
              onClose={() => setDeleteGroup(null)}
            />
          )}
        </Dialog>
      </Modal>
      <Modal isOpen={!!addSubgroup}>
        <Dialog style={{ width: 400 }} title={t(labels.addGroup)}>
          {addSubgroup && (
            <WebsiteGroupAddForm
              teamId={teamId}
              parentId={addSubgroup}
              onSave={() => {
                handleModified();
                setAddSubgroup(null);
              }}
              onClose={() => setAddSubgroup(null)}
            />
          )}
        </Dialog>
      </Modal>
    </Column>
  );
}
