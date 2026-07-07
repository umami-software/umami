export interface WebsiteGroupRecord {
  id: string;
  name: string;
  parentId?: string | null;
}

export interface WebsiteRecord {
  id: string;
  name: string;
  domain?: string | null;
  groupId?: string | null;
  createdAt?: Date | string | null;
  shareId?: string | null;
  [key: string]: unknown;
}

export type WebsiteTreeNode =
  | {
      type: 'group';
      id: string;
      name: string;
      parentId?: string | null;
      children: WebsiteTreeNode[];
    }
  | {
      type: 'website';
      id: string;
      name: string;
      domain?: string | null;
      groupId?: string | null;
      createdAt?: Date | string | null;
      shareId?: string | null;
      [key: string]: unknown;
    };

export type FlatSelectItem = {
  id: string;
  label: string;
  depth: number;
  type: 'group' | 'website';
};

function compareByName(a: { name: string }, b: { name: string }) {
  return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
}

export function getGroupPath(
  groupId: string | null | undefined,
  groupsMap: Map<string, WebsiteGroupRecord>,
): string | null {
  if (!groupId) {
    return null;
  }

  const parts: string[] = [];
  let currentId: string | null | undefined = groupId;
  const visited = new Set<string>();

  while (currentId) {
    if (visited.has(currentId)) {
      break;
    }

    visited.add(currentId);

    const group = groupsMap.get(currentId);

    if (!group) {
      break;
    }

    parts.unshift(group.name);
    currentId = group.parentId;
  }

  return parts.length > 0 ? parts.join(' / ') : null;
}

export function buildWebsiteTree(
  groups: WebsiteGroupRecord[],
  websites: WebsiteRecord[],
): WebsiteTreeNode[] {
  const childGroupsByParent = new Map<string | null, WebsiteGroupRecord[]>();

  for (const group of groups) {
    const parentKey = group.parentId ?? null;
    const siblings = childGroupsByParent.get(parentKey) ?? [];
    siblings.push(group);
    childGroupsByParent.set(parentKey, siblings);
  }

  const websitesByGroup = new Map<string | null, WebsiteRecord[]>();

  for (const website of websites) {
    const groupKey = website.groupId ?? null;
    const siblings = websitesByGroup.get(groupKey) ?? [];
    siblings.push(website);
    websitesByGroup.set(groupKey, siblings);
  }

  function buildLevel(parentId: string | null): WebsiteTreeNode[] {
    const groupNodes: WebsiteTreeNode[] = (childGroupsByParent.get(parentId) ?? [])
      .slice()
      .sort(compareByName)
      .map(group => ({
        type: 'group' as const,
        id: group.id,
        name: group.name,
        parentId: group.parentId,
        children: buildLevel(group.id),
      }));

    const websiteNodes: WebsiteTreeNode[] = (websitesByGroup.get(parentId) ?? [])
      .slice()
      .sort(compareByName)
      .map(website => ({
        type: 'website' as const,
        ...website,
      }));

    return [...groupNodes, ...websiteNodes];
  }

  return buildLevel(null);
}

export function flattenTreeForSelect(tree: WebsiteTreeNode[], depth = 0): FlatSelectItem[] {
  const items: FlatSelectItem[] = [];

  for (const node of tree) {
    if (node.type === 'group') {
      items.push({
        id: node.id,
        label: node.name,
        depth,
        type: 'group',
      });
      items.push(...flattenTreeForSelect(node.children, depth + 1));
    } else {
      items.push({
        id: node.id,
        label: node.name,
        depth,
        type: 'website',
      });
    }
  }

  return items;
}

export type GroupedSelectEntry =
  | { type: 'website'; id: string; label: string }
  | { type: 'section'; title: string; websites: { id: string; label: string }[] };

export function buildGroupedSelectSections(flatItems: FlatSelectItem[]): GroupedSelectEntry[] {
  const websites = flatItems.filter(item => item.type === 'website');

  if (websites.length === 0) {
    return [];
  }

  const groups = flatItems.filter(item => item.type === 'group');

  if (groups.length === 0) {
    return websites.map(website => ({
      type: 'website' as const,
      id: website.id,
      label: website.label,
    }));
  }

  const groupAtDepth = new Map<number, string>();
  const entries: GroupedSelectEntry[] = [];
  let currentSectionTitle: string | null = null;
  let currentSectionWebsites: { id: string; label: string }[] = [];

  const flushSection = () => {
    if (currentSectionTitle && currentSectionWebsites.length > 0) {
      entries.push({
        type: 'section',
        title: currentSectionTitle,
        websites: currentSectionWebsites,
      });
    }
    currentSectionTitle = null;
    currentSectionWebsites = [];
  };

  for (const item of flatItems) {
    if (item.type === 'group') {
      for (const depth of [...groupAtDepth.keys()]) {
        if (depth >= item.depth) {
          groupAtDepth.delete(depth);
        }
      }
      groupAtDepth.set(item.depth, item.label);
      continue;
    }

    const parentDepth = item.depth - 1;
    const parentGroup = parentDepth >= 0 ? (groupAtDepth.get(parentDepth) ?? null) : null;

    if (parentGroup === null) {
      flushSection();
      entries.push({
        type: 'website',
        id: item.id,
        label: item.label,
      });
      continue;
    }

    if (parentGroup !== currentSectionTitle) {
      flushSection();
      currentSectionTitle = parentGroup;
    }

    currentSectionWebsites.push({
      id: item.id,
      label: item.label,
    });
  }

  flushSection();

  return entries;
}

export function flattenGroupsForSelect(
  groups: WebsiteGroupRecord[],
  excludeGroupId?: string,
): { id: string; label: string; depth: number }[] {
  const filtered = excludeGroupId
    ? groups.filter(group => group.id !== excludeGroupId)
    : groups;

  const tree = buildWebsiteTree(filtered, []);

  return flattenTreeForSelect(tree)
    .filter(item => item.type === 'group')
    .map(({ id, label, depth }) => ({ id, label, depth }));
}

export function isGroupDescendant(
  groupId: string,
  potentialAncestorId: string,
  groupsMap: Map<string, WebsiteGroupRecord>,
): boolean {
  let currentId: string | null | undefined = groupId;
  const visited = new Set<string>();

  while (currentId) {
    if (currentId === potentialAncestorId) {
      return true;
    }

    if (visited.has(currentId)) {
      break;
    }

    visited.add(currentId);

    const group = groupsMap.get(currentId);
    currentId = group?.parentId ?? null;
  }

  return false;
}

export function attachGroupPathToWebsites<T extends WebsiteRecord>(
  websites: T[],
  groups: WebsiteGroupRecord[],
): (T & { groupPath: string | null })[] {
  const groupsMap = new Map(groups.map(group => [group.id, group]));

  return websites.map(website => ({
    ...website,
    groupPath: getGroupPath(website.groupId, groupsMap),
  }));
}
