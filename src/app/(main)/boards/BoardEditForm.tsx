import {
  Box,
  Button,
  DialogFooter,
  Form,
  FormField,
  FormSubmitButton,
  Loading,
  Row,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Text,
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
        const boardTypeLabel =
          type === BOARD_TYPES.mixed
            ? t(labels.open)
            : type === BOARD_TYPES.pixel
              ? t(labels.pixel)
              : type === BOARD_TYPES.link
                ? t(labels.link)
                : t(labels.website);

        const boardTypeItems = [
          { value: BOARD_TYPES.mixed, label: t(labels.open) },
          { value: BOARD_TYPES.website, label: t(labels.website) },
          { value: BOARD_TYPES.pixel, label: t(labels.pixel) },
          { value: BOARD_TYPES.link, label: t(labels.link) },
        ];

        const handleTypeChange = (value: string | number | null) => {
          setValue('type', value as BoardType, { shouldDirty: true });
          setValue('entityId', '', { shouldDirty: true });
        };

        const handleEntityChange = (value: string | number | null) => {
          setValue('entityId', (value as string) ?? '', { shouldDirty: true });
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
              {() => (
                <Box width="100%" maxWidth="360px">
                  {boardId ? (
                    <Text>{boardTypeLabel}</Text>
                  ) : (
                    <Select items={boardTypeItems} value={type} onValueChange={handleTypeChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent alignItemWithTrigger={false}>
                        <SelectGroup>
                          {boardTypeItems.map(item => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                </Box>
              )}
            </FormField>
            {requiresBoardEntity(type) && (
              <FormField
                name="entityId"
                label={entityLabel}
                rules={{ required: t(labels.required) }}
              >
                {() => (
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
                )}
              </FormField>
            )}
            {/* In a dialog (onClose), the buttons go in its footer; on the edit page, a plain row. */}
            {onClose ? (
              <DialogFooter>
                <Button variant="secondary" disabled={isPending} onClick={onClose}>
                  {t(labels.cancel)}
                </Button>
                <FormSubmitButton disabled={isPending}>{t(labels.save)}</FormSubmitButton>
              </DialogFooter>
            ) : (
              <Row justifyContent="flex-end" paddingTop="3">
                <FormSubmitButton disabled={isPending}>{t(labels.save)}</FormSubmitButton>
              </Row>
            )}
          </>
        );
      }}
    </Form>
  );
}
