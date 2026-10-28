'use client';
import {
  Button,
  Column,
  Grid,
  Label,
  Row,
  Switch,
  Text,
  Textarea,
  TextField,
  useToast,
} from '@umami/react-zen';
import { useMemo, useState } from 'react';
import { Panel } from '@/components/common/Panel';
import { useApi } from '@/components/hooks';
import { ACCENT_SWATCHES } from '@/lib/appearance';
import {
  defaultConfig,
  WIDGET_LABELS,
  type WidgetConfig,
  type WidgetDelivery,
  type WidgetType,
} from '@/lib/marketing-widgets';
import { SCENARIOS, STYLE_PRESETS } from '@/lib/widget-presets';
import type { WidgetTemplate } from '@/lib/widget-templates';
import { WidgetPreview } from './WidgetPreview';

function Choice<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <Row gap="2" wrap="wrap">
      {options.map(o => (
        <Button
          key={o.value}
          variant={value === o.value ? 'primary' : undefined}
          onPress={() => onChange(o.value)}
        >
          {o.label}
        </Button>
      ))}
    </Row>
  );
}

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <Column gap="1">
      <Label>{label}</Label>
      {children}
      {hint && <Text color="muted">{hint}</Text>}
    </Column>
  );
}

export function WidgetEditor({
  websiteId,
  type,
  widget,
  template,
  onSaved,
  onCancel,
}: {
  websiteId: string;
  type: WidgetType;
  widget?: any;
  template?: WidgetTemplate;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const { post, put } = useApi() as any;
  const { toast } = useToast();
  const [name, setName] = useState<string>(widget?.name || template?.name || WIDGET_LABELS[type]);
  const [enabled, setEnabled] = useState<boolean>(widget?.enabled ?? true);
  const [config, setConfig] = useState<WidgetConfig>(
    widget?.config || template?.config || defaultConfig(type),
  );
  const [delivery, setDelivery] = useState<WidgetDelivery>(
    widget?.delivery || {
      store: true,
      telegram: { enabled: false, chatId: '' },
      webhook: { enabled: false, url: '', secret: '' },
    },
  );
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<'content' | 'style' | 'scenario' | 'delivery'>('content');
  const set = (patch: Partial<WidgetConfig>) => setConfig(c => ({ ...c, ...patch }));
  const hasForm = type === 'callback' || type === 'email';
  const hasLink = type === 'banner' || type === 'popup';
  const isBanner = type === 'banner';
  const positions = useMemo(
    () =>
      isBanner
        ? [
            { value: 'top', label: 'Top' },
            { value: 'bottom', label: 'Bottom' },
          ]
        : type === 'popup'
          ? [
              { value: 'center', label: 'Center' },
              { value: 'bottom-right', label: 'Bottom right' },
              { value: 'bottom-left', label: 'Bottom left' },
            ]
          : [
              { value: 'bottom-right', label: 'Bottom right' },
              { value: 'bottom-left', label: 'Bottom left' },
            ],
    [type, isBanner],
  );

  const save = async () => {
    setBusy(true);
    try {
      const body = { type, name, enabled, config, delivery };
      if (widget) await put(`/widgets/${widget.id}`, body);
      else await post(`/websites/${websiteId}/widgets`, body);
      toast('Widget saved');
      onSaved();
    } catch (e: any) {
      toast(e?.message || 'Could not save (check the fields)');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Grid columns={{ base: '1fr', xl: '1.1fr 1fr' }} gap="6">
      <Panel>
        <Column gap="5">
          <Row justifyContent="space-between" alignItems="center">
            <Text weight="bold">{WIDGET_LABELS[type]}</Text>
            <Switch isSelected={enabled} onChange={setEnabled}>
              Enabled
            </Switch>
          </Row>
          <Field label="Internal name">
            <TextField value={name} onChange={setName} aria-label="Name" />
          </Field>

          <Row gap="2" wrap="wrap">
            {(
              [
                ['content', 'Content'],
                ['style', 'Style'],
                ['scenario', 'Scenario'],
                ...(hasForm ? [['delivery', 'Requests']] : []),
              ] as const
            ).map(([id, label]) => (
              <Button
                key={id}
                variant={tab === id ? 'primary' : undefined}
                onPress={() => setTab(id as any)}
              >
                {label}
              </Button>
            ))}
          </Row>

          {tab === 'content' && (
            <Column gap="5">
              {!isBanner && (
                <Field label="Title">
                  <TextField
                    value={config.title}
                    onChange={title => set({ title })}
                    aria-label="Title"
                  />
                </Field>
              )}
              <Field label={isBanner ? 'Announcement text' : 'Text'}>
                <Textarea
                  value={config.text}
                  onChange={(e: any) => set({ text: e?.target ? e.target.value : e })}
                  rows={2}
                  aria-label="Text"
                />
              </Field>
              <Field label="Button text">
                <TextField
                  value={config.buttonText}
                  onChange={buttonText => set({ buttonText })}
                  aria-label="Button text"
                />
              </Field>
              {hasLink && (
                <Field label="Button link (https://…)">
                  <TextField
                    value={config.buttonUrl}
                    onChange={buttonUrl => set({ buttonUrl })}
                    aria-label="Button link"
                    placeholder="https://example.com/sale"
                  />
                </Field>
              )}
              {type === 'popup' && (
                <Grid columns="1fr 1fr" gap="3">
                  <Field label="Promo code">
                    <TextField
                      value={config.promoCode}
                      onChange={promoCode => set({ promoCode })}
                      aria-label="Promo code"
                    />
                  </Field>
                  <Field label="Image URL (optional)">
                    <TextField
                      value={config.imageUrl}
                      onChange={imageUrl => set({ imageUrl })}
                      aria-label="Image URL"
                    />
                  </Field>
                </Grid>
              )}
              {hasForm && (
                <>
                  <Field label="Success message">
                    <TextField
                      value={config.successText}
                      onChange={successText => set({ successText })}
                      aria-label="Success text"
                    />
                  </Field>
                  <Field label="Consent text (optional checkbox)">
                    <TextField
                      value={config.consentText}
                      onChange={consentText => set({ consentText })}
                      aria-label="Consent text"
                      placeholder="I agree to the processing of personal data"
                    />
                  </Field>
                  {type === 'callback' && (
                    <Row gap="6">
                      <Switch isSelected={config.askName} onChange={askName => set({ askName })}>
                        Ask name
                      </Switch>
                      <Switch
                        isSelected={config.askComment}
                        onChange={askComment => set({ askComment })}
                      >
                        Ask comment
                      </Switch>
                    </Row>
                  )}
                </>
              )}
            </Column>
          )}

          {tab === 'style' && (
            <Column gap="5">
              <Field label="Ready-made looks">
                <Row gap="2" wrap="wrap">
                  {STYLE_PRESETS.map(p => (
                    <Button key={p.id} onPress={() => set(p.patch)}>
                      {p.label}
                    </Button>
                  ))}
                </Row>
              </Field>
              <Field label="Accent color">
                <Row gap="2" wrap="wrap" alignItems="center">
                  {ACCENT_SWATCHES.map(c => (
                    <button
                      key={c}
                      type="button"
                      className="glass-swatch"
                      data-active={config.accent === c}
                      style={{ background: c }}
                      aria-label={`Accent ${c}`}
                      onClick={() => set({ accent: c })}
                    />
                  ))}
                  <input
                    type="color"
                    className="glass-color"
                    value={config.accent}
                    aria-label="Custom accent"
                    onChange={e => set({ accent: e.target.value })}
                  />
                </Row>
              </Field>
              <Grid columns="1fr 1fr" gap="4">
                <Field label="Theme">
                  <Choice
                    value={config.theme}
                    onChange={theme => set({ theme })}
                    options={[
                      { value: 'auto', label: 'Auto' },
                      { value: 'light', label: 'Light' },
                      { value: 'dark', label: 'Dark' },
                    ]}
                  />
                </Field>
                <Field label="Position">
                  <Choice
                    value={config.position}
                    onChange={position => set({ position })}
                    options={positions as any}
                  />
                </Field>
              </Grid>

              <Grid columns="1fr 1fr" gap="4">
                <Field label="Background (empty = theme)">
                  <Row gap="2" alignItems="center">
                    <input
                      type="color"
                      className="glass-color"
                      value={config.bg || '#ffffff'}
                      aria-label="Background color"
                      onChange={e => set({ bg: e.target.value })}
                    />
                    <Button variant="quiet" onPress={() => set({ bg: '' })}>
                      Reset
                    </Button>
                  </Row>
                </Field>
                <Field label="Text color (empty = auto)">
                  <Row gap="2" alignItems="center">
                    <input
                      type="color"
                      className="glass-color"
                      value={config.fg || '#111827'}
                      aria-label="Text color"
                      onChange={e => set({ fg: e.target.value })}
                    />
                    <Button variant="quiet" onPress={() => set({ fg: '' })}>
                      Reset
                    </Button>
                  </Row>
                </Field>
              </Grid>
              <Field label={`Corner radius: ${config.radius}px`}>
                <input
                  type="range"
                  min={0}
                  max={32}
                  value={config.radius}
                  className="glass-slider"
                  aria-label="Radius"
                  onChange={e => set({ radius: Number(e.target.value) })}
                />
              </Field>
              <Grid columns="1fr 1fr" gap="4">
                <Field label="Shadow">
                  <Choice
                    value={config.shadow}
                    onChange={shadow => set({ shadow })}
                    options={[
                      { value: 'none', label: 'None' },
                      { value: 'soft', label: 'Soft' },
                      { value: 'strong', label: 'Strong' },
                    ]}
                  />
                </Field>
                <Field label="Size">
                  <Choice
                    value={config.size}
                    onChange={size => set({ size })}
                    options={[
                      { value: 'sm', label: 'S' },
                      { value: 'md', label: 'M' },
                      { value: 'lg', label: 'L' },
                    ]}
                  />
                </Field>
                <Field label="Buttons">
                  <Choice
                    value={config.buttonStyle}
                    onChange={buttonStyle => set({ buttonStyle })}
                    options={[
                      { value: 'solid', label: 'Solid' },
                      { value: 'outline', label: 'Outline' },
                      { value: 'pill', label: 'Pill' },
                    ]}
                  />
                </Field>
                <Field label="Animation">
                  <Choice
                    value={config.animation}
                    onChange={animation => set({ animation })}
                    options={[
                      { value: 'none', label: 'None' },
                      { value: 'fade', label: 'Fade' },
                      { value: 'slide', label: 'Slide' },
                      { value: 'pop', label: 'Pop' },
                    ]}
                  />
                </Field>
              </Grid>
              <Row gap="6" wrap="wrap">
                <Switch isSelected={config.glass} onChange={glass => set({ glass })}>
                  Glass effect
                </Switch>
                <Switch
                  isSelected={config.dismissible}
                  onChange={dismissible => set({ dismissible })}
                >
                  Close button
                </Switch>
              </Row>
              <Grid columns="1fr 1fr" gap="4">
                <Field label="Icon / emoji (optional)">
                  <TextField
                    value={config.icon}
                    onChange={icon => set({ icon: Array.from(icon).slice(0, 2).join('') })}
                    aria-label="Icon"
                    placeholder="☎"
                  />
                </Field>
                {type === 'popup' && (
                  <Field label={`Overlay dim: ${config.overlayDim}%`}>
                    <input
                      type="range"
                      min={0}
                      max={80}
                      value={config.overlayDim}
                      className="glass-slider"
                      aria-label="Overlay dim"
                      onChange={e => set({ overlayDim: Number(e.target.value) })}
                    />
                  </Field>
                )}
              </Grid>
              <Field
                label="Custom CSS (applies only inside the widget)"
                hint="Classes: .card, h3, p, button, .pill, .bar, .promo, input. Example: .card{border:2px solid #f59e0b}"
              >
                <Textarea
                  value={config.customCss}
                  onChange={(e: any) => set({ customCss: e?.target ? e.target.value : e })}
                  rows={4}
                  aria-label="Custom CSS"
                  className="code-textarea"
                />
              </Field>
            </Column>
          )}

          {tab === 'scenario' && (
            <Column gap="5">
              <Field label="Ready-made scenarios (click to apply)">
                <Column gap="2">
                  {SCENARIOS.filter(sc => sc.types.includes(type)).map(sc => (
                    <Button key={sc.id} onPress={() => set(sc.patch)}>
                      <Column alignItems="flex-start">
                        <Text weight="bold">{sc.label}</Text>
                        <Text color="muted">{sc.description}</Text>
                      </Column>
                    </Button>
                  ))}
                </Column>
              </Field>
              <Field label="Show when">
                <Choice
                  value={config.trigger}
                  onChange={trigger => set({ trigger })}
                  options={[
                    { value: 'immediate', label: 'On load' },
                    { value: 'delay', label: 'After delay' },
                    { value: 'scroll', label: 'On scroll' },
                    { value: 'exit', label: 'Exit intent' },
                  ]}
                />
              </Field>
              {config.trigger === 'delay' && (
                <Field label="Delay, seconds">
                  <TextField
                    value={String(config.delaySec)}
                    onChange={v => set({ delaySec: Math.max(0, Math.min(600, Number(v) || 0)) })}
                    aria-label="Delay"
                  />
                </Field>
              )}
              {config.trigger === 'scroll' && (
                <Field label="Scrolled, % of page">
                  <TextField
                    value={String(config.scrollPct)}
                    onChange={v => set({ scrollPct: Math.max(1, Math.min(100, Number(v) || 1)) })}
                    aria-label="Scroll percent"
                  />
                </Field>
              )}
              <Field label="How often">
                <Choice
                  value={config.frequency}
                  onChange={frequency => set({ frequency })}
                  options={[
                    { value: 'always', label: 'Every page' },
                    { value: 'session', label: 'Once per session' },
                    { value: 'day', label: 'Once a day' },
                    { value: 'week', label: 'Once a week' },
                    { value: 'once', label: 'Once ever' },
                  ]}
                />
              </Field>
              <Grid columns="1fr 1fr" gap="4">
                <Field
                  label="Only on pages (one per line, * wildcard)"
                  hint="Empty = everywhere. Example: /pricing, /blog/*"
                >
                  <Textarea
                    value={config.urlInclude}
                    onChange={(e: any) => set({ urlInclude: e?.target ? e.target.value : e })}
                    rows={2}
                    aria-label="Include pages"
                  />
                </Field>
                <Field label="Except pages">
                  <Textarea
                    value={config.urlExclude}
                    onChange={(e: any) => set({ urlExclude: e?.target ? e.target.value : e })}
                    rows={2}
                    aria-label="Exclude pages"
                  />
                </Field>
              </Grid>
              <Grid columns="1fr 1fr" gap="4">
                <Field label="Start (optional)">
                  <input
                    type="datetime-local"
                    className="glass-datetime"
                    value={config.startAt}
                    onChange={e => set({ startAt: e.target.value })}
                    aria-label="Start"
                  />
                </Field>
                <Field label="End (optional)">
                  <input
                    type="datetime-local"
                    className="glass-datetime"
                    value={config.endAt}
                    onChange={e => set({ endAt: e.target.value })}
                    aria-label="End"
                  />
                </Field>
              </Grid>

              <Grid columns="1fr 1fr" gap="4">
                <Field label="Devices">
                  <Choice
                    value={config.devices}
                    onChange={devices => set({ devices })}
                    options={[
                      { value: 'all', label: 'All' },
                      { value: 'desktop', label: 'Desktop' },
                      { value: 'mobile', label: 'Mobile' },
                    ]}
                  />
                </Field>
                <Field label="Visitors">
                  <Choice
                    value={config.visitor}
                    onChange={visitor => set({ visitor })}
                    options={[
                      { value: 'all', label: 'All' },
                      { value: 'new', label: 'New' },
                      { value: 'returning', label: 'Returning' },
                    ]}
                  />
                </Field>
                <Field label="Pages viewed in session, at least">
                  <TextField
                    value={String(config.minPageViews)}
                    onChange={v => set({ minPageViews: Math.max(0, Math.min(50, Number(v) || 0)) })}
                    aria-label="Min page views"
                  />
                </Field>
                <Field label="Seconds on site, at least">
                  <TextField
                    value={String(config.minTimeSec)}
                    onChange={v => set({ minTimeSec: Math.max(0, Math.min(3600, Number(v) || 0)) })}
                    aria-label="Min time"
                  />
                </Field>
              </Grid>
              <Field
                label="Traffic source (match any, comma separated; empty = any)"
                hint="utm_source / utm_medium / utm_campaign are remembered for the whole session."
              >
                <Grid columns="1fr 1fr 1fr" gap="2">
                  <TextField
                    value={config.utmSource}
                    onChange={utmSource => set({ utmSource })}
                    aria-label="utm_source"
                    placeholder="utm_source"
                  />
                  <TextField
                    value={config.utmMedium}
                    onChange={utmMedium => set({ utmMedium })}
                    aria-label="utm_medium"
                    placeholder="utm_medium"
                  />
                  <TextField
                    value={config.utmCampaign}
                    onChange={utmCampaign => set({ utmCampaign })}
                    aria-label="utm_campaign"
                    placeholder="utm_campaign"
                  />
                </Grid>
              </Field>
              <Field label="Referrer contains (e.g. google, t.me)">
                <TextField
                  value={config.referrer}
                  onChange={referrer => set({ referrer })}
                  aria-label="Referrer"
                />
              </Field>
              <Column gap="3">
                <Switch
                  isSelected={config.hoursEnabled}
                  onChange={hoursEnabled => set({ hoursEnabled })}
                >
                  Working hours (visitor's local time)
                </Switch>
                {config.hoursEnabled && (
                  <>
                    <Grid columns="1fr 1fr" gap="3">
                      <Field label="From">
                        <input
                          type="time"
                          className="glass-datetime"
                          value={config.hoursFrom}
                          onChange={e => set({ hoursFrom: e.target.value })}
                          aria-label="From"
                        />
                      </Field>
                      <Field label="To">
                        <input
                          type="time"
                          className="glass-datetime"
                          value={config.hoursTo}
                          onChange={e => set({ hoursTo: e.target.value })}
                          aria-label="To"
                        />
                      </Field>
                    </Grid>
                    <Row gap="2" wrap="wrap">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
                        <Button
                          key={d}
                          variant={config.hoursDays.includes(i) ? 'primary' : undefined}
                          onPress={() =>
                            set({
                              hoursDays: config.hoursDays.includes(i)
                                ? config.hoursDays.filter(x => x !== i)
                                : [...config.hoursDays, i],
                            })
                          }
                        >
                          {d}
                        </Button>
                      ))}
                    </Row>
                    <Field label="Outside working hours">
                      <Choice
                        value={config.offHours}
                        onChange={offHours => set({ offHours })}
                        options={[
                          { value: 'normal', label: 'Same as usual' },
                          { value: 'message', label: 'Show other text' },
                          { value: 'hide', label: 'Hide' },
                        ]}
                      />
                    </Field>
                    {config.offHours === 'message' && (
                      <Field label="Text outside working hours">
                        <Textarea
                          value={config.offHoursText}
                          onChange={(e: any) =>
                            set({ offHoursText: e?.target ? e.target.value : e })
                          }
                          rows={2}
                          aria-label="Off hours text"
                        />
                      </Field>
                    )}
                  </>
                )}
              </Column>
              {hasForm && (
                <Switch
                  isSelected={config.hideAfterConversion}
                  onChange={hideAfterConversion => set({ hideAfterConversion })}
                >
                  Hide for visitors who already sent a request
                </Switch>
              )}
            </Column>
          )}

          {tab === 'delivery' && hasForm && (
            <Column gap="5">
              <Column gap="3">
                <Label>Where requests go</Label>
                <Switch
                  isSelected={delivery.store}
                  onChange={store => setDelivery(d => ({ ...d, store }))}
                >
                  Save in Umami (Leads)
                </Switch>
                <Switch
                  isSelected={delivery.telegram.enabled}
                  onChange={enabled =>
                    setDelivery(d => ({ ...d, telegram: { ...d.telegram, enabled } }))
                  }
                >
                  Telegram
                </Switch>
                {delivery.telegram.enabled && (
                  <Field
                    label="Telegram chat ID"
                    hint="Add the Umami bot to your chat and paste its chat ID. The bot token is set on the server (TELEGRAM_BOT_TOKEN)."
                  >
                    <TextField
                      value={delivery.telegram.chatId}
                      onChange={chatId =>
                        setDelivery(d => ({ ...d, telegram: { ...d.telegram, chatId } }))
                      }
                      aria-label="Telegram chat id"
                      placeholder="-1001234567890"
                    />
                  </Field>
                )}
                <Switch
                  isSelected={delivery.webhook.enabled}
                  onChange={enabled =>
                    setDelivery(d => ({ ...d, webhook: { ...d.webhook, enabled } }))
                  }
                >
                  Webhook
                </Switch>
                {delivery.webhook.enabled && (
                  <Field
                    label="Webhook URL (https)"
                    hint={
                      delivery.webhook.secret
                        ? 'Requests are signed: X-Umami-Signature = sha256 HMAC of the body with the secret saved for this widget.'
                        : 'A signing secret is generated on save.'
                    }
                  >
                    <TextField
                      value={delivery.webhook.url}
                      onChange={url => setDelivery(d => ({ ...d, webhook: { ...d.webhook, url } }))}
                      aria-label="Webhook url"
                      placeholder="https://hooks.example.com/lead"
                    />
                  </Field>
                )}
              </Column>
            </Column>
          )}

          <Row gap>
            <Button variant="primary" onPress={save} isDisabled={busy || !name.trim()}>
              Save widget
            </Button>
            <Button onPress={onCancel}>Cancel</Button>
          </Row>
        </Column>
      </Panel>
      <Column gap="3">
        <Label>Live preview</Label>
        <WidgetPreview type={type} config={config} width={520} height={440} debounce={250} />
      </Column>
    </Grid>
  );
}
