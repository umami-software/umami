'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Icon } from '@umami/react-zen';
import { usePalette } from '@/store/palette';
import { useLoginQuery, useMessages, useNavigation, useUserWebsitesQuery } from '@/components/hooks';
import {
  ArrowDown,
  ArrowUp,
  CornerDownLeft,
  Globe,
  Grid2x2,
  KeyRound,
  LayoutDashboard,
  LinkIcon,
  LogOut,
  PanelsLeftBottom,
  Search,
  Settings2,
  ShieldCheck,
  UserCircle,
  Users,
} from '@/components/icons';
import { Favicon } from '@/components/common/Favicon';
import styles from './CommandPalette.module.css';

interface Command {
  id: string;
  label: string;
  category: string;
  icon: ReactNode;
  keywords?: string[];
  action: () => void;
}

export function CommandPalette() {
  const { t, labels } = useMessages();
  const { router, renderUrl, teamId, pathname } = useNavigation();
  const { isOpen, closePalette } = usePalette();
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const navigate = useCallback(
    (path: string) => {
      router.push(renderUrl(path, false));
      closePalette();
    },
    [router, renderUrl, closePalette],
  );

  const { user } = useLoginQuery();
  const { data: websitesData } = useUserWebsitesQuery(
    { userId: user?.id, teamId },
    { pageSize: 100, includeTeams: true },
  );
  const websiteItems: { id: string; name: string; domain: string }[] = websitesData?.data || [];

  const commands = useMemo<Command[]>(() => {
    const nav: Command[] = [
      ...(!teamId
        ? [
          {
            id: 'dashboard',
            label: t(labels.dashboard),
            category: 'Navigation',
            icon: <PanelsLeftBottom />,
            keywords: ['home', 'main', 'overview'],
            action: () => navigate('/dashboard'),
          },
        ]
        : []),
      {
        id: 'boards',
        label: t(labels.boards),
        category: 'Navigation',
        icon: <LayoutDashboard />,
        keywords: ['board', 'custom', 'dashboard'],
        action: () => navigate('/boards'),
      },
      {
        id: 'websites',
        label: t(labels.websites),
        category: 'Navigation',
        icon: <Globe />,
        keywords: ['site', 'web', 'analytics'],
        action: () => navigate('/websites'),
      },
      {
        id: 'links',
        label: t(labels.links),
        category: 'Navigation',
        icon: <LinkIcon />,
        keywords: ['url', 'short', 'redirect'],
        action: () => navigate('/links'),
      },
      {
        id: 'pixels',
        label: t(labels.pixels),
        category: 'Navigation',
        icon: <Grid2x2 />,
        keywords: ['pixel', 'tracking', 'embed', 'code'],
        action: () => navigate('/pixels'),
      },
    ];

    const settings: Command[] = [
      {
        id: 'settings-preferences',
        label: t(labels.preferences),
        category: t(labels.settings),
        icon: <Settings2 />,
        keywords: ['settings', 'config', 'options', 'theme', 'language'],
        action: () => navigate('/settings/preferences'),
      },
      {
        id: 'settings-profile',
        label: t(labels.profile),
        category: t(labels.settings),
        icon: <UserCircle />,
        keywords: ['account', 'user', 'me', 'name'],
        action: () => navigate('/settings/profile'),
      },
      {
        id: 'settings-teams',
        label: t(labels.teams),
        category: t(labels.settings),
        icon: <Users />,
        keywords: ['organization', 'group', 'members'],
        action: () => navigate('/settings/teams'),
      },
      {
        id: 'settings-security',
        label: t(labels.security),
        category: t(labels.settings),
        icon: <ShieldCheck />,
        keywords: ['2fa', 'password', 'auth', 'two-factor'],
        action: () => navigate('/settings/security'),
      },
      {
        id: 'settings-api-keys',
        label: t(labels.apiKeys),
        category: t(labels.settings),
        icon: <KeyRound />,
        keywords: ['api', 'token', 'key', 'developer'],
        action: () => navigate('/settings/api-keys'),
      },
    ];

    const actions: Command[] = [
      {
        id: 'action-logout',
        label: t(labels.logout),
        category: 'Actions',
        icon: <LogOut />,
        keywords: ['sign out', 'exit', 'leave'],
        action: () => {
          closePalette();
          router.push('/logout');
        },
      },
    ];

    const websiteCmds: Command[] = websiteItems.map(site => {
      const hasDomain = Boolean(site.domain);
      return {
        id: `website-${site.id}`,
        label: site.name,
        category: t(labels.websites),
        icon: hasDomain ? <Favicon domain={site.domain} style={{ display: 'block' }} /> : <Globe />,
        keywords: ['website', 'site', 'analytics', site.name, site.domain].filter(Boolean) as string[],
        action: () => navigate(`/websites/${site.id}`),
      };
    });

    return [...nav, ...settings, ...websiteCmds, ...actions];
  }, [t, labels, navigate, teamId, closePalette, router, websiteItems]);

  const filteredCommands = useMemo(() => {
    if (!search.trim()) return commands;

    const query = search.toLowerCase();
    return commands.filter(cmd => {
      if (cmd.label.toLowerCase().includes(query)) return true;
      if (cmd.category.toLowerCase().includes(query)) return true;
      return cmd.keywords?.some(kw => kw.includes(query)) ?? false;
    });
  }, [commands, search]);

  const groupedCommands = useMemo(() => {
    const groups: { category: string; items: Command[] }[] = [];
    for (const cmd of filteredCommands) {
      const existing = groups.find(g => g.category === cmd.category);
      if (existing) {
        existing.items.push(cmd);
      } else {
        groups.push({ category: cmd.category, items: [cmd] });
      }
    }
    return groups;
  }, [filteredCommands]);

  // Reset on search change
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setSearch('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Close on route change (e.g. browser back/forward)
  useEffect(() => {
    closePalette();
  }, [pathname, closePalette]);

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll('[data-command-item]');
    const selected = items[selectedIndex];
    if (selected) {
      selected.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          setSelectedIndex(prev =>
            prev < filteredCommands.length - 1 ? prev + 1 : 0,
          );
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          setSelectedIndex(prev =>
            prev > 0 ? prev - 1 : filteredCommands.length - 1,
          );
          break;
        }
        case 'Enter': {
          e.preventDefault();
          const cmd = filteredCommands[selectedIndex];
          if (cmd) {
            cmd.action();
          }
          break;
        }
        case 'Escape': {
          e.preventDefault();
          closePalette();
          break;
        }
      }
    },
    [filteredCommands, selectedIndex, closePalette],
  );

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        closePalette();
      }
    },
    [closePalette],
  );

  if (!isOpen) return null;

  let flatIndex = -1;

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.container} role="dialog" aria-label="Command palette">
        {/* Search */}
        <div className={styles.searchSection}>
          <Icon className={styles.searchIcon} size="sm">
            <Search />
          </Icon>
          <input
            ref={inputRef}
            type="text"
            autoFocus
            className={styles.searchInput}
            placeholder="Type a command or search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoComplete="off"
          />
          <kbd className={styles.kbd}>Esc</kbd>
        </div>

        {/* Results */}
        <div className={styles.results} ref={listRef}>
          {filteredCommands.length === 0 && (
            <div className={styles.empty}>
              <Icon size="lg" className={styles.emptyIcon}>
                <Search />
              </Icon>
              <span className={styles.emptyText}>No results found</span>
              <span className={styles.emptyHint}>
                Try a different search term
              </span>
            </div>
          )}
          {groupedCommands.map(group => (
            <div key={group.category} className={styles.group}>
              <div className={styles.groupLabel}>{group.category}</div>
              {group.items.map(cmd => {
                flatIndex++;
                const idx = flatIndex;
                return (
                  <div
                    key={cmd.id}
                    className={styles.item}
                    data-selected={idx === selectedIndex}
                    data-command-item=""
                    onClick={() => cmd.action()}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <div className={styles.itemIcon}>
                      <Icon size="sm">{cmd.icon}</Icon>
                    </div>
                    <span className={styles.itemLabel}>{cmd.label}</span>
                    <div className={styles.itemShortcut}>
                      <kbd className={styles.kbd}>↵</kbd>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <span className={styles.footerHint}>
            <Icon size="xs">
              <ArrowUp />
            </Icon>
            <Icon size="xs">
              <ArrowDown />
            </Icon>
            navigate
          </span>
          <span className={styles.footerHint}>
            <Icon size="xs">
              <CornerDownLeft />
            </Icon>
            select
          </span>
          <span className={styles.footerHint}>
            <kbd className={styles.kbd} style={{ fontSize: 9, height: 18, minWidth: 18 }}>
              Esc
            </kbd>
            close
          </span>
        </div>
      </div>
    </div>
  );
}
