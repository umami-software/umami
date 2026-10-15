import { z } from 'zod';
import { McpToolError } from './errors';

export const FUNNEL_STEPS_JSON_EXAMPLE =
  '[{"type":"path","value":"/"},{"type":"event","value":"signup"}]';

const funnelStepSchema = z.object({
  type: z.enum(['path', 'event']),
  value: z.string().min(1),
});

const funnelStepsArraySchema = z.array(funnelStepSchema).min(2).max(8);

export const stepsJsonField = z
  .string()
  .min(2)
  .optional()
  .describe(
    `JSON array of 2–8 ordered funnel steps. Each element: {"type":"path"|"event","value":"<path or event name>"}. ` +
      `Example: ${FUNNEL_STEPS_JSON_EXAMPLE}. Use "*" as a wildcard in values. Required unless funnelId is given.`,
  );

export type FunnelStep = z.infer<typeof funnelStepSchema>;

export const REMOVED_FUNNEL_STEPS_MESSAGE = `The "steps" array was removed. Pass stepsJson instead, e.g. ${FUNNEL_STEPS_JSON_EXAMPLE}`;

/** Catches legacy funnel `steps` arrays so validation does not strip them before the handler runs. */
export const removedFunnelStepsGuardField = {
  steps: z
    .unknown()
    .optional()
    .describe('Removed. Pass stepsJson with a JSON array of funnel steps instead.'),
};

export function assertNoRemovedFunnelSteps(input: { steps?: unknown }) {
  if (input.steps !== undefined && input.steps !== null) {
    throw new McpToolError('invalid_input', REMOVED_FUNNEL_STEPS_MESSAGE);
  }
}

export function parseFunnelStepsJson(stepsJson: string | undefined): FunnelStep[] | undefined {
  if (stepsJson === undefined) {
    return undefined;
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(stepsJson);
  } catch {
    throw new McpToolError(
      'invalid_input',
      `stepsJson must be valid JSON. Example: ${FUNNEL_STEPS_JSON_EXAMPLE}`,
    );
  }

  const result = funnelStepsArraySchema.safeParse(parsed);

  if (!result.success) {
    throw new McpToolError(
      'invalid_input',
      `stepsJson must be a JSON array of 2–8 steps with type "path" or "event" and a non-empty value. Example: ${FUNNEL_STEPS_JSON_EXAMPLE}`,
    );
  }

  return result.data;
}
