/**
 * Main overlay UI component for displaying and controlling dials
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Gauge } from 'lucide-react';
import { getDialRegistry } from '../registry';
import { ColorControl } from '../controls/ColorControl';
import { SpacingControl } from '../controls/SpacingControl';
import { VariantControl } from '../controls/VariantControl';
import { BooleanControl } from '../controls/BooleanControl';
import { NumberControl } from '../controls/NumberControl';
import type { DialRegistration } from '../types';

export interface DialsOverlayProps {
  /** Initial visibility state */
  defaultVisible?: boolean;
  /** Position of the overlay */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

/**
 * Overlay UI for controlling dials
 * Should be rendered at the root level of your app
 *
 * @example
 * ```typescript
 * <DialsProvider>
 *   <App />
 *   <DialsOverlay defaultVisible={false} toggleKey="k" position="bottom-right" />
 * </DialsProvider>
 * ```
 */
export function DialsOverlay({
  defaultVisible = true,
  position = 'bottom-left',
}: DialsOverlayProps) {
  // Load visibility state from localStorage (avoiding hydration mismatch)
  const [isVisible, setIsVisible] = useState(defaultVisible);

  // Load from localStorage after mount to avoid hydration issues
  useEffect(() => {
    const stored = localStorage.getItem('niteshift-dials-visible');
    if (stored !== null) {
      setIsVisible(stored === 'true');
    }
  }, []);
  const [searchTerm, setSearchTerm] = useState('');
  const [dials, setDials] = useState<DialRegistration[]>([]);
  const [hasNextOverlay, setHasNextOverlay] = useState(false);
  const [isMacLike, setIsMacLike] = useState(false);
  const [shortcutLabel, setShortcutLabel] = useState('Ctrl+D (macOS) / Ctrl+Alt+D (Win/Linux)');
  const registry = getDialRegistry();

  // Persist visibility state to localStorage
  useEffect(() => {
    localStorage.setItem('niteshift-dials-visible', String(isVisible));
  }, [isVisible]);

  // Detect Next.js error overlay
  useEffect(() => {
    const checkNextOverlay = () => {
      // Next.js error overlay has specific identifiers
      const nextjsOverlay =
        document.querySelector('nextjs-portal') ||
        document.querySelector('[data-nextjs-dialog-overlay]') ||
        document.querySelector('[data-nextjs-toast]');
      setHasNextOverlay(!!nextjsOverlay);
    };

    // Check on mount and set up observer
    checkNextOverlay();

    const observer = new MutationObserver(checkNextOverlay);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  // Subscribe to registry changes
  useEffect(() => {
    const updateDials = () => {
      setDials(registry.getAllDials());
    };

    // Initial load
    updateDials();

    // Subscribe to changes
    const unsubscribe = registry.subscribeToRegistry(updateDials);

    return unsubscribe;
  }, [registry]);

  // Detect platform to configure shortcut labels
  useEffect(() => {
    if (typeof navigator === 'undefined') return;
    const isMac = /Mac|iPhone|iPod|iPad/i.test(navigator.platform);
    setIsMacLike(isMac);
  }, []);

  useEffect(() => {
    setShortcutLabel(isMacLike ? 'Ctrl+D (macOS)' : 'Ctrl+Alt+D (Windows/Linux)');
  }, [isMacLike]);

  // Keyboard shortcut to toggle visibility
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key !== 'd') return;

      const macCombo = isMacLike && e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey;
      const otherCombo = !isMacLike && e.ctrlKey && e.altKey && !e.metaKey && !e.shiftKey;

      if (macCombo || otherCombo) {
        e.preventDefault();
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isMacLike]);

  // Filter and group dials
  const filteredDials = useMemo(() => {
    if (!searchTerm) return dials;

    const term = searchTerm.toLowerCase();
    return dials.filter(dial => {
      const label = dial.config.label.toLowerCase();
      const group = dial.config.group?.toLowerCase() || '';
      const id = dial.id.toLowerCase();
      return label.includes(term) || group.includes(term) || id.includes(term);
    });
  }, [dials, searchTerm]);

  const groupedDials = useMemo(() => {
    const groups = new Map<string, DialRegistration[]>();

    for (const dial of filteredDials) {
      const group = dial.config.group || 'Ungrouped';
      if (!groups.has(group)) {
        groups.set(group, []);
      }
      groups.get(group)!.push(dial);
    }

    return groups;
  }, [filteredDials]);

  const handleChange = (id: string, value: any) => {
    registry.setValue(id, value);
  };

  const handleReset = (id: string) => {
    registry.reset(id);
  };

  const handleResetAll = () => {
    if (confirm('Reset all dials to their default values?')) {
      registry.resetAll();
    }
  };

  // Calculate bottom position based on Next.js overlay presence
  const bottomPosition = hasNextOverlay ? '140px' : '20px';

  if (!isVisible) {
    return (
      <button
        className="dials-toggle-button"
        onClick={() => setIsVisible(true)}
        title={`Show Dials (${shortcutLabel})`}
        style={{
          position: 'fixed',
          [position.includes('bottom') ? 'bottom' : 'top']: position.includes('bottom')
            ? bottomPosition
            : '20px',
          [position.includes('right') ? 'right' : 'left']: '20px',
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          border: '2px solid #666',
          background: '#1a1a1a',
          color: '#fff',
          fontSize: '20px',
          cursor: 'pointer',
          zIndex: 9999999, // Very high to be above everything
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Gauge size={24} />
      </button>
    );
  }

  return (
    <div
      className="dials-overlay"
      style={{
        position: 'fixed',
        [position.includes('bottom') ? 'bottom' : 'top']: position.includes('bottom')
          ? bottomPosition
          : '20px',
        [position.includes('right') ? 'right' : 'left']: '20px',
        width: '320px',
        maxHeight: '80vh',
        background: '#181c20',
        border: '1px solid #292d39',
        borderRadius: '4px',
        boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
        zIndex: 9999999, // Very high to be above everything
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '11px',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '10px 12px',
          borderBottom: '1px solid #292d39',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Gauge size={16} color="#8c92a4" />
          <div>
            <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: '#fefefe' }}>
              Design Dials
            </h3>
            <div style={{ fontSize: '10px', color: '#8c92a4', marginTop: '2px' }}>
              {shortcutLabel}
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            padding: 0,
            lineHeight: 1,
            color: '#8c92a4',
          }}
          title="Close (Shift+Cmd/Ctrl+D)"
        >
          ×
        </button>
      </div>

      {/* Search */}
      <div style={{ padding: '8px 12px', borderBottom: '1px solid #292d39' }}>
        <input
          type="search"
          placeholder="Search dials..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '6px 8px',
            border: '1px solid transparent',
            borderRadius: '2px',
            fontSize: '11px',
            background: '#373c4b',
            color: '#fefefe',
            outline: 'none',
          }}
        />
      </div>

      {/* Dials list */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0',
        }}
      >
        {filteredDials.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#8c92a4', padding: '32px 16px' }}>
            {searchTerm ? 'No dials match your search' : 'No dials registered yet'}
          </div>
        ) : (
          Array.from(groupedDials.entries()).map(([groupName, groupDials]) => (
            <div key={groupName} style={{ marginBottom: '0' }}>
              <h4
                style={{
                  margin: '0',
                  padding: '8px 12px',
                  fontSize: '10px',
                  fontWeight: 500,
                  color: '#b4b4b4',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  background: '#292d39',
                  borderBottom: '1px solid #373c4b',
                }}
              >
                {groupName}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {groupDials.map(dial => (
                  <div key={dial.id}>{renderControl(dial, handleChange, handleReset)}</div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '8px 12px',
          borderTop: '1px solid #292d39',
          display: 'flex',
          gap: '8px',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <button
          onClick={handleResetAll}
          disabled={dials.length === 0}
          style={{
            padding: '4px 12px',
            background: '#373c4b',
            border: '1px solid transparent',
            borderRadius: '2px',
            cursor: dials.length > 0 ? 'pointer' : 'not-allowed',
            fontSize: '11px',
            color: dials.length > 0 ? '#fefefe' : '#535760',
            transition: 'border-color 0.15s',
          }}
        >
          Reset All
        </button>
        <div style={{ fontSize: '11px', color: '#b4b4b4', display: 'flex', alignItems: 'center' }}>
          {dials.length} dial{dials.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}

/**
 * Render the appropriate control component based on dial type
 */
function renderControl(
  dial: DialRegistration,
  onChange: (id: string, value: any) => void,
  onReset: (id: string) => void,
) {
  const commonProps = {
    id: dial.id,
    value: dial.currentValue,
    onChange: (value: any) => onChange(dial.id, value),
    onReset: () => onReset(dial.id),
  };

  switch (dial.type) {
    case 'color':
      return <ColorControl {...commonProps} config={dial.config as any} />;
    case 'spacing':
      return <SpacingControl {...commonProps} config={dial.config as any} />;
    case 'variant':
      return <VariantControl {...commonProps} config={dial.config as any} />;
    case 'boolean':
      return <BooleanControl {...commonProps} config={dial.config as any} />;
    case 'number':
      return <NumberControl {...commonProps} config={dial.config as any} />;
    default:
      return null;
  }
}
