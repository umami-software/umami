'use client';
import { Button, Column, Grid, Heading, Label, Row, Text, useToast } from '@umami/react-zen';
import { useEffect, useState } from 'react';
import { PageBody } from '@/components/common/PageBody';
import { PageHeader } from '@/components/common/PageHeader';
import { Panel } from '@/components/common/Panel';
import { useApi } from '@/components/hooks';
import { ThemeModeSelector } from '@/components/input/ThemeModeSelector';
import {
  ACCENT_SWATCHES,
  APPEARANCE_PRESETS,
  type AppearanceSettings,
  DEFAULT_APPEARANCE,
  getAppearanceVars,
} from '@/lib/appearance';
import { setAppearance, setAppearancePreview, useAppearanceStore } from '@/store/appearance';

function SliderField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <Column gap="1">
      <Row justifyContent="space-between">
        <Label>{label}</Label>
        <Text color="muted">{value}%</Text>
      </Row>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        aria-label={label}
        className="glass-slider"
        onChange={e => onChange(Number(e.target.value))}
      />
    </Column>
  );
}

function Preview({ draft }: { draft: AppearanceSettings }) {
  const vars = getAppearanceVars(draft) as React.CSSProperties;

  return (
    <div className="glass-preview" style={vars} data-glass="on" data-preview-mode={draft.mode}>
      <div className="glass-preview-card">
        <Text color="muted">Visitors</Text>
        <Heading size="2xl">12,480</Heading>
        <svg viewBox="0 0 120 32" width="100%" height="32" aria-hidden="true">
          <polyline
            fill="none"
            stroke="var(--zen-primary)"
            strokeWidth="2"
            points="0,26 15,20 30,23 45,12 60,16 75,8 90,12 105,4 120,9"
          />
        </svg>
      </div>
      <div className="glass-preview-card">
        <Row gap alignItems="center">
          <span className="glass-preview-btn">Primary</span>
          <span className="glass-preview-btn glass-preview-btn-quiet">Secondary</span>
        </Row>
        <Text color="muted">Surfaces, borders and shadows update live.</Text>
      </div>
    </div>
  );
}

export function AppearancePage() {
  const saved = useAppearanceStore(state => state.settings);
  const [draft, setDraft] = useState<AppearanceSettings>(saved);
  const [busy, setBusy] = useState(false);
  const { put, del } = useApi() as any;
  const { toast } = useToast();

  useEffect(() => setDraft(saved), [saved]);

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);

  const update = (patch: Partial<AppearanceSettings>) =>
    setDraft(prev => ({ ...prev, ...patch, preset: patch.preset ?? 'custom' }));

  const applyPreset = (id: string) => {
    const p = APPEARANCE_PRESETS.find(x => x.id === id);
    if (p) {
      setDraft(prev => ({
        ...prev,
        preset: p.id,
        accent: p.accent,
        transparency: p.transparency,
        blur: p.blur,
        shadow: p.shadow,
      }));
    }
  };

  const save = async () => {
    setBusy(true);
    try {
      await put('/me/appearance', draft);
      setAppearance(draft);
      toast('Appearance saved');
    } catch {
      // Keep the local copy even if the server is unreachable.
      setAppearance(draft);
      toast('Saved on this device only');
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    setBusy(true);
    try {
      await del('/me/appearance');
    } catch {
      // ignore: defaults are applied locally either way
    }
    setAppearance({ ...DEFAULT_APPEARANCE });
    setBusy(false);
    toast('Appearance reset to defaults');
  };

  // Live preview of the whole UI while editing; reverted if the user leaves without saving.
  useEffect(() => {
    setAppearancePreview(dirty ? draft : null);
  }, [draft, dirty]);
  useEffect(() => () => setAppearancePreview(null), []);

  return (
    <PageBody>
      <Column gap="6">
        <PageHeader title="Appearance" />
        <Grid columns={{ base: '1fr', lg: '1fr 1fr' }} gap="6">
          <Panel>
            <Column gap="6">
              <Column gap="1">
                <Label>Theme</Label>
                <ThemeModeSelector
                  includeSystem
                  value={draft.mode}
                  onChange={mode => update({ mode, preset: draft.preset })}
                />
              </Column>
              <Column gap="2">
                <Label>Preset</Label>
                <Row gap wrap="wrap">
                  {APPEARANCE_PRESETS.map(p => (
                    <Button
                      key={p.id}
                      variant={draft.preset === p.id ? 'primary' : undefined}
                      onPress={() => applyPreset(p.id)}
                    >
                      {p.label}
                    </Button>
                  ))}
                </Row>
              </Column>
              <Column gap="2">
                <Label>Accent color</Label>
                <Row gap="2" wrap="wrap" alignItems="center">
                  {ACCENT_SWATCHES.map(c => (
                    <button
                      key={c}
                      type="button"
                      className="glass-swatch"
                      data-active={draft.accent === c}
                      style={{ background: c }}
                      aria-label={`Accent ${c}`}
                      onClick={() => update({ accent: c })}
                    />
                  ))}
                  <input
                    type="color"
                    value={draft.accent}
                    aria-label="Custom accent color"
                    className="glass-color"
                    onChange={e => update({ accent: e.target.value })}
                  />
                </Row>
              </Column>
              <SliderField
                label="Transparency"
                value={draft.transparency}
                onChange={transparency => update({ transparency })}
              />
              <SliderField label="Blur" value={draft.blur} onChange={blur => update({ blur })} />
              <SliderField
                label="Shadows"
                value={draft.shadow}
                onChange={shadow => update({ shadow })}
              />
              <Row gap>
                <Button variant="primary" onPress={save} isDisabled={!dirty || busy}>
                  Save
                </Button>
                <Button onPress={() => setDraft(saved)} isDisabled={!dirty || busy}>
                  Cancel
                </Button>
                <Button onPress={reset} isDisabled={busy}>
                  Reset to defaults
                </Button>
              </Row>
            </Column>
          </Panel>
          <Panel>
            <Column gap="3">
              <Label>Preview</Label>
              <Preview draft={draft} />
            </Column>
          </Panel>
        </Grid>
      </Column>
    </PageBody>
  );
}
