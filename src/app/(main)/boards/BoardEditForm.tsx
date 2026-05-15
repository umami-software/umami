import {
  Box,
  Button,
  Form,
  FormField,
  FormSubmitButton,
  ListItem,
  Loading,
  Row,
  Select,
  TextField,
} from '@umami/react-zen';
import { useBoardQuery, useMessages, useNavigation, useUpdateQuery } from '@/components/hooks';
import { LinkSelect } from '@/components/input/LinkSelect';
import { PixelSelect } from '@/components/input/PixelSelect';
import { WebsiteSelect } from '@/components/input/WebsiteSelect';
import {
  BOARD_TYPES,
  type BoardType,
  getBoardEntity,
  getBoardType,
  requiresBoardEntity,
  setBoardEntity,
} from '@/lib/boards';
import type { Board } from '@/lib/types';

interface BoardFormValues {
  name: string;
  description: string;
  type: BoardType;
  entityId: string;
}

function getDefaultValues(board?: Partial<Board>): BoardFormValues {
  const boardType = getBoardType(board, { coerceDashboard: true });
  const { entityId } = getBoardEntity(board);

  return {
    name: board?.name ?? '',
    description: board?.description ?? '',
    type: boardType,
    entityId: entityId ?? '',
  };
}

export function BoardEditForm({
  boardId,
  teamId,
  onSave,
  onClose,
}: {
  boardId?: string;
  teamId?: string;
  onSave?: (board: Board) => void | Promise<void>;
  onClose?: () => void;
}) {
  const { t, labels, messages, getErrorMessage } = useMessages();
  const { teamId: navigationTeamId } = useNavigation();
  const resolvedTeamId = teamId ?? navigationTeamId;
  const { data: board, isLoading } = useBoardQuery(boardId || '');
  const { mutateAsync, error, isPending, touch, toast } = useUpdateQuery(
    boardId ? `/boards/${boardId}` : '/boards',
    {
      id: boardId,
      teamId: resolvedTeamId,
    },
  );
  const values = getDefaultValues(board);

  const handleSubmit = async (data: BoardFormValues) => {
    const result = await mutateAsync({
      name: data.name,
      description: data.description,
      type: data.type,
      parameters: setBoardEntity(board?.parameters, data.type, data.entityId || undefined),
    });

    toast(t(messages.saved));
    touch('boards');
    touch(`board:${result.id}`);
    await onSave?.(result);
    onClose?.();
  };

  if (boardId && isLoading) {
    return <Loading placement="absolute" />;
  }

  return (
    <Form onSubmit={handleSubmit} error={getErrorMessage(error)} values={values}>
      {({ watch, setValue }) => {
        const type = watch('type') as BoardType;
        const entityId = watch('entityId') as string;
        const entityLabel =
          type === BOARD_TYPES.pixel
            ? t(labels.pixel)
            : type === BOARD_TYPES.link
              ? t(labels.link)
              : t(labels.website);

        const handleTypeChange = (value: string) => {
          setValue('type', value as BoardType, { shouldDirty: true });
          setValue('entityId', '', { shouldDirty: true });
        };

        const handleEntityChange = (value: string) => {
          setValue('entityId', value, { shouldDirty: true });
        };

        return (
          <>
            <FormField name="name" label={t(labels.name)} rules={{ required: t(labels.required) }}>
              <TextField autoComplete="off" autoFocus={!boardId} placeholder={t(labels.untitled)} />
            </FormField>
            <FormField name="description" label={t(labels.description)}>
              <TextField
                autoComplete="off"
                asTextArea
                resize="vertical"
                placeholder={t(labels.addDescription)}
              />
            </FormField>
            <FormField
              name="type"
              label={t(labels.boardType)}
              rules={{ required: t(labels.required) }}
            >
              <Box width="100%" maxWidth="360px">
                <Select value={type} onChange={handleTypeChange}>
                  <ListItem id={BOARD_TYPES.mixed}>{t(labels.open)}</ListItem>
                  <ListItem id={BOARD_TYPES.website}>{t(labels.website)}</ListItem>
                  <ListItem id={BOARD_TYPES.pixel}>{t(labels.pixel)}</ListItem>
                  <ListItem id={BOARD_TYPES.link}>{t(labels.link)}</ListItem>
                </Select>
              </Box>
            </FormField>
            {requiresBoardEntity(type) && (
              <FormField
                name="entityId"
                label={entityLabel}
                rules={{ required: t(labels.required) }}
              >
                <Box width="100%" maxWidth="360px">
                  {type === BOARD_TYPES.website ? (
                    <WebsiteSelect
                      websiteId={entityId}
                      teamId={resolvedTeamId}
                      onChange={handleEntityChange}
                    />
                  ) : type === BOARD_TYPES.pixel ? (
                    <PixelSelect
                      pixelId={entityId}
                      teamId={resolvedTeamId}
                      placeholder={t(labels.selectPixel)}
                      onChange={handleEntityChange}
                    />
                  ) : (
                    <LinkSelect
                      linkId={entityId}
                      teamId={resolvedTeamId}
                      placeholder={t(labels.selectLink)}
                      onChange={handleEntityChange}
                    />
                  )}
                </Box>
              </FormField>
            )}
            <Row justifyContent="flex-end" paddingTop="3" gap="3">
              {onClose && (
                <Button isDisabled={isPending} onPress={onClose}>
                  {t(labels.cancel)}
                </Button>
              )}
              <FormSubmitButton isDisabled={isPending}>{t(labels.save)}</FormSubmitButton>
            </Row>
          </>
        );
      }}
    </Form>
  );
}
