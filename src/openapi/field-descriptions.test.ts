import { describe, expect, it } from 'vitest';
import type { createDocument } from 'zod-openapi';
import { applyFieldDescriptions } from './field-descriptions';

function documentWithSchema(schema: Record<string, unknown>) {
  return {
    openapi: '3.1.0',
    info: { title: 'Test', version: '1' },
    paths: {
      '/api/dashboard': {
        get: {
          responses: {
            '200': {
              description: 'Success',
              content: { 'application/json': { schema } },
            },
          },
        },
      },
    },
  } satisfies ReturnType<typeof createDocument>;
}

describe('OpenAPI field descriptions', () => {
  it('documents dashboard fields without changing their schemas or example payloads', () => {
    const schema = {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string', description: 'Custom dashboard name.' },
        parameters: { anyOf: [{ type: 'object' }, { type: 'null' }] },
        createdAt: { type: 'string', format: 'date-time' },
      },
      required: ['id', 'name', 'parameters', 'createdAt'],
      example: { properties: { id: { type: 'string' } } },
    };
    const original = structuredClone(schema);
    const document = documentWithSchema(schema);
    applyFieldDescriptions(document);

    expect(schema).toEqual({
      ...original,
      properties: {
        id: { type: 'string', description: 'Dashboard board ID, equal to the owning user ID.' },
        name: original.properties.name,
        parameters: {
          ...original.properties.parameters,
          description: 'Dashboard configuration, including components, layout, and saved reports.',
        },
        createdAt: {
          ...original.properties.createdAt,
          description: 'Date and time the record was created.',
        },
      },
    });
    const once = structuredClone(document);
    applyFieldDescriptions(document);
    expect(document).toEqual(once);
  });

  it('traverses nested schemas and components while preserving references and unknown fields', () => {
    const nested = {
      properties: {
        userId: { type: 'string' },
        unknownField: { type: 'string' },
      },
    };
    const reference = { $ref: '#/components/schemas/User' };
    const schema = {
      allOf: [
        { type: 'array', items: { oneOf: [nested, reference] } },
        { additionalProperties: { anyOf: [structuredClone(nested)] } },
      ],
    };
    const document = {
      ...documentWithSchema(schema),
      components: { schemas: { User: { properties: { username: { type: 'string' as const } } } } },
    };
    applyFieldDescriptions(document);
    expect(nested.properties.userId).toHaveProperty('description');
    expect(nested.properties.unknownField).not.toHaveProperty('description');
    expect(reference).toEqual({ $ref: '#/components/schemas/User' });
    expect(document.components.schemas.User.properties.username).toHaveProperty('description');
    expect(schema.allOf[1].additionalProperties.anyOf[0].properties.userId).toHaveProperty(
      'description',
    );
  });

  it('fills query and path descriptions while respecting curated parameter and schema wording', () => {
    const parameters = [
      { name: 'startAt', in: 'query' as const, schema: { type: 'number' as const } },
      { name: 'boardId', in: 'path' as const, required: true, schema: { type: 'string' as const } },
      {
        name: 'type',
        in: 'query' as const,
        schema: { type: 'string' as const, description: 'Dimension to rank.' },
      },
      { name: 'page', in: 'query' as const, description: 'Curated page description.' },
    ];
    const document = documentWithSchema({});
    Object.assign(document.paths['/api/dashboard'].get, { parameters });
    applyFieldDescriptions(document);
    expect(parameters[0]).toHaveProperty(
      'description',
      'Start of the date range as a Unix timestamp in milliseconds.',
    );
    expect(parameters[1]).toHaveProperty('description', 'ID of the board.');
    expect(parameters[2]).toHaveProperty('description', 'Dimension to rank.');
    expect(parameters[3]).toHaveProperty('description', 'Curated page description.');
  });
});
