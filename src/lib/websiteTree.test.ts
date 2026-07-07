import { describe, expect, test } from 'vitest';
import {
  attachGroupPathToWebsites,
  buildGroupedSelectSections,
  buildWebsiteTree,
  flattenGroupsForSelect,
  flattenTreeForSelect,
  getGroupPath,
  isGroupDescendant,
} from './websiteTree';

const groups = [
  { id: 'g1', name: 'Muj projekt', parentId: null },
  { id: 'g2', name: 'LAB', parentId: 'g1' },
  { id: 'g3', name: 'PROD', parentId: 'g1' },
  { id: 'g4', name: 'Dalsi websites', parentId: null },
];

const websites = [
  { id: 'w1', name: 'app', groupId: 'g2' },
  { id: 'w2', name: 'www', groupId: 'g2' },
  { id: 'w3', name: 'app', groupId: 'g3' },
  { id: 'w4', name: 'www', groupId: 'g3' },
  { id: 'w5', name: 'website 1', groupId: 'g4' },
  { id: 'w6', name: 'website 2', groupId: 'g4' },
  { id: 'w7', name: 'muj blog', groupId: null },
];

describe('buildWebsiteTree', () => {
  test('builds nested tree with groups before websites at each level', () => {
    const tree = buildWebsiteTree(groups, websites);

    expect(tree).toHaveLength(3);
    expect(tree[0].type).toBe('group');
    expect(tree[0].name).toBe('Dalsi websites');
    expect(tree[1].type).toBe('group');
    expect(tree[1].name).toBe('Muj projekt');
    expect(tree[2].type).toBe('website');
    expect(tree[2].name).toBe('muj blog');

    const project = tree[1];
    expect(project.type).toBe('group');
    if (project.type === 'group') {
      expect(project.children).toHaveLength(2);
      expect(project.children[0].name).toBe('LAB');
      expect(project.children[1].name).toBe('PROD');
    }
  });

  test('lists subgroups before websites within the same parent', () => {
    const mixedGroups = [{ id: 'g1', name: 'Parent', parentId: null }];
    const mixedWebsites = [
      { id: 'w1', name: 'zebra site', groupId: 'g1' },
      { id: 'w2', name: 'alpha site', groupId: 'g1' },
    ];
    const mixedSubgroups = [
      { id: 'g2', name: 'Zulu', parentId: 'g1' },
      { id: 'g3', name: 'Beta', parentId: 'g1' },
    ];

    const tree = buildWebsiteTree([...mixedGroups, ...mixedSubgroups], mixedWebsites);
    const parent = tree[0];

    expect(parent.type).toBe('group');
    if (parent.type === 'group') {
      expect(parent.children.map(node => node.name)).toEqual([
        'Beta',
        'Zulu',
        'alpha site',
        'zebra site',
      ]);
    }
  });
});

describe('getGroupPath', () => {
  test('returns full path for nested group', () => {
    const groupsMap = new Map(groups.map(group => [group.id, group]));

    expect(getGroupPath('g2', groupsMap)).toBe('Muj projekt / LAB');
    expect(getGroupPath(null, groupsMap)).toBeNull();
  });
});

describe('attachGroupPathToWebsites', () => {
  test('adds groupPath to websites', () => {
    const result = attachGroupPathToWebsites(websites, groups);

    expect(result.find(website => website.id === 'w1')?.groupPath).toBe('Muj projekt / LAB');
    expect(result.find(website => website.id === 'w7')?.groupPath).toBeNull();
  });
});

describe('flattenTreeForSelect', () => {
  test('flattens tree with depth', () => {
    const tree = buildWebsiteTree(groups, websites);
    const flat = flattenTreeForSelect(tree);

    expect(flat.some(item => item.id === 'g1' && item.depth === 0)).toBe(true);
    expect(flat.some(item => item.id === 'g2' && item.depth === 1)).toBe(true);
    expect(flat.some(item => item.id === 'w7' && item.depth === 0)).toBe(true);
  });
});

describe('buildGroupedSelectSections', () => {
  test('keeps root websites outside group sections after nested groups', () => {
    const tree = buildWebsiteTree(groups, websites);
    const flat = flattenTreeForSelect(tree);
    const sections = buildGroupedSelectSections(flat);

    expect(sections.find(entry => entry.type === 'website' && entry.id === 'w7')).toEqual({
      type: 'website',
      id: 'w7',
      label: 'muj blog',
    });

    const labSection = sections.find(
      entry => entry.type === 'section' && entry.title === 'LAB',
    );
    expect(labSection?.type === 'section' && labSection.websites.map(site => site.id)).toEqual([
      'w1',
      'w2',
    ]);

    const prodSection = sections.find(
      entry => entry.type === 'section' && entry.title === 'PROD',
    );
    expect(prodSection?.type === 'section' && prodSection.websites.map(site => site.id)).toEqual([
      'w3',
      'w4',
    ]);

    expect(
      sections.some(
        entry =>
          entry.type === 'section' &&
          entry.websites.some(website => website.id === 'w7'),
      ),
    ).toBe(false);
  });

  test('assigns websites to their direct parent group only', () => {
    const flat = flattenTreeForSelect(
      buildWebsiteTree(
        [
          { id: 'g1', name: 'Group A', parentId: null },
          { id: 'g2', name: 'Group B', parentId: null },
        ],
        [
          { id: 'w1', name: 'inside A', groupId: 'g1' },
          { id: 'w2', name: 'root site', groupId: null },
        ],
      ),
    );

    const sections = buildGroupedSelectSections(flat);

    expect(sections).toEqual([
      {
        type: 'section',
        title: 'Group A',
        websites: [{ id: 'w1', label: 'inside A' }],
      },
      { type: 'website', id: 'w2', label: 'root site' },
    ]);
  });
});

describe('flattenGroupsForSelect', () => {
  test('excludes specified group and descendants from select options', () => {
    const options = flattenGroupsForSelect(groups, 'g1');

    expect(options.map(option => option.id)).not.toContain('g1');
    expect(options.map(option => option.id)).toContain('g4');
  });
});

describe('isGroupDescendant', () => {
  test('detects descendant relationship', () => {
    const groupsMap = new Map(groups.map(group => [group.id, group]));

    expect(isGroupDescendant('g2', 'g1', groupsMap)).toBe(true);
    expect(isGroupDescendant('g1', 'g2', groupsMap)).toBe(false);
  });
});
