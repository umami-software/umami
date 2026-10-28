'use client';
import { Button, Column, Dialog, Grid, Modal, Row, Text } from '@umami/react-zen';
import { useState } from 'react';
import { ControlledDialog } from '@/components/common/ControlledDialog';
import { WIDGET_LABELS, WIDGET_TYPES, type WidgetType } from '@/lib/marketing-widgets';
import { TEMPLATE_MOODS, WIDGET_TEMPLATES, type WidgetTemplate } from '@/lib/widget-templates';
import { WidgetPreview } from './WidgetPreview';

const TYPE_HINT: Record<WidgetType, string> = {
  callback: 'Call-back request',
  banner: 'Announcement bar',
  popup: 'Promo pop-up',
  email: 'Email capture',
};

export function WidgetCatalog({
  isOpen,
  onOpenChange,
  onPick,
  onBlank,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onPick: (tpl: WidgetTemplate) => void;
  onBlank: (type: WidgetType) => void;
}) {
  const [type, setType] = useState<WidgetType | 'all'>('all');
  const [mood, setMood] = useState<string>('all');

  const items = WIDGET_TEMPLATES.filter(
    tpl => (type === 'all' || tpl.type === type) && (mood === 'all' || tpl.mood === mood),
  );

  return (
    <ControlledDialog>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <Dialog
          title="Widget catalog"
          style={{
            width: '1180px',
            maxWidth: 'calc(100vw - 32px)',
            maxHeight: 'calc(100dvh - 32px)',
            padding: '28px',
          }}
        >
          {() => (
            <Column gap="5">
              <Text color="muted">
                Pick a ready-made widget. You can change everything afterwards: text, colors,
                scenario, delivery.
              </Text>
              <Row gap="2" wrap="wrap">
                <Button
                  variant={type === 'all' ? 'primary' : undefined}
                  onPress={() => setType('all')}
                >
                  All
                </Button>
                {WIDGET_TYPES.map(t => (
                  <Button
                    key={t}
                    variant={type === t ? 'primary' : undefined}
                    onPress={() => setType(t)}
                  >
                    {WIDGET_LABELS[t]}
                  </Button>
                ))}
              </Row>
              <Row gap="2" wrap="wrap">
                <Button
                  variant={mood === 'all' ? 'primary' : 'quiet'}
                  onPress={() => setMood('all')}
                >
                  Any style
                </Button>
                {TEMPLATE_MOODS.map(m => (
                  <Button
                    key={m}
                    variant={mood === m ? 'primary' : 'quiet'}
                    onPress={() => setMood(m)}
                  >
                    {m}
                  </Button>
                ))}
              </Row>
              <Grid columns={{ base: '1fr', md: '1fr 1fr', xl: '1fr 1fr 1fr' }} gap="4">
                {items.map(tpl => (
                  <Column key={tpl.id} gap="2" className="glass-enter">
                    <WidgetPreview
                      type={tpl.type}
                      config={tpl.config}
                      width={340}
                      height={210}
                      scale={0.58}
                    />
                    <Row justifyContent="space-between" alignItems="center" gap>
                      <Column>
                        <Text weight="bold">{tpl.name}</Text>
                        <Text color="muted">
                          {TYPE_HINT[tpl.type]} · {tpl.mood}
                        </Text>
                      </Column>
                      <Button variant="primary" onPress={() => onPick(tpl)}>
                        Use
                      </Button>
                    </Row>
                  </Column>
                ))}
                {items.length === 0 && <Text color="muted">Nothing matches this filter.</Text>}
              </Grid>
              <Row gap="2" wrap="wrap" alignItems="center">
                <Text color="muted">Or start from scratch:</Text>
                {WIDGET_TYPES.map(t => (
                  <Button key={t} variant="quiet" onPress={() => onBlank(t)}>
                    {WIDGET_LABELS[t]}
                  </Button>
                ))}
              </Row>
            </Column>
          )}
        </Dialog>
      </Modal>
    </ControlledDialog>
  );
}
