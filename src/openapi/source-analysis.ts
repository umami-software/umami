import ts from 'typescript';
import type { ApiAuth, ApiHttpMethod } from '@/openapi/operation';

export interface InferredOpenApiSchema {
  type?: string;
  format?: string;
  enum?: unknown[];
  const?: unknown;
  properties?: Record<string, InferredOpenApiSchema>;
  required?: string[];
  items?: InferredOpenApiSchema;
  prefixItems?: InferredOpenApiSchema[];
  anyOf?: InferredOpenApiSchema[];
  allOf?: InferredOpenApiSchema[];
  additionalProperties?: boolean | InferredOpenApiSchema;
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  minLength?: number;
  maxLength?: number;
  minItems?: number;
  maxItems?: number;
  [key: string]: unknown;
}

type Schema = InferredOpenApiSchema;

export interface SourceOperationAnalysis {
  auth: ApiAuth;
  hasRequestSchema: boolean;
  requestSchema?: Schema;
  responseStatuses: number[];
  responseSchemas: Record<number, Schema>;
  responseMediaType: string;
  returnsOk: boolean;
}

interface InferredSchema {
  schema: Schema;
  optional: boolean;
}

const RESPONSE_STATUSES: Record<string, number> = {
  json: 200,
  ok: 200,
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  payloadTooLarge: 413,
  serverError: 500,
  serviceUnavailable: 503,
};

const stringSchema = (): Schema => ({ type: 'string' });
const numberSchema = (): Schema => ({ type: 'number' });
const booleanSchema = (): Schema => ({ type: 'boolean' });
const unknownSchema = (): Schema => ({});

function isUnknownSchema(schema: Schema) {
  return Object.keys(schema).length === 0;
}

function typeToSchema(
  type: ts.Type,
  checker: ts.TypeChecker,
  location: ts.Node,
  seen = new Set<ts.Type>(),
  depth = 0,
): Schema {
  if (depth > 12 || seen.has(type)) {
    return unknownSchema();
  }

  if (type.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown | ts.TypeFlags.TypeParameter)) {
    return unknownSchema();
  }

  if (type.flags & ts.TypeFlags.Never) {
    return unknownSchema();
  }

  if (type.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Void | ts.TypeFlags.Null)) {
    return { type: 'null' };
  }

  if (type.isStringLiteral()) {
    return { const: type.value };
  }

  if (type.flags & (ts.TypeFlags.String | ts.TypeFlags.TemplateLiteral)) {
    return stringSchema();
  }

  if (type.isNumberLiteral()) {
    return { const: type.value };
  }

  if (type.flags & (ts.TypeFlags.Number | ts.TypeFlags.BigInt)) {
    return numberSchema();
  }

  if (type.flags & ts.TypeFlags.BooleanLiteral) {
    return { const: checker.typeToString(type) === 'true' };
  }

  if (type.flags & ts.TypeFlags.Boolean) {
    return booleanSchema();
  }

  if (type.isUnion()) {
    const variants = type.types
      .filter(variant => !(variant.flags & ts.TypeFlags.Undefined))
      .map(variant => typeToSchema(variant, checker, location, new Set(seen), depth + 1));
    const unique = [...new Map(variants.map(schema => [JSON.stringify(schema), schema])).values()];

    if (unique.length === 0) return unknownSchema();
    if (unique.length === 1) return unique[0];
    return { anyOf: unique };
  }

  if (type.isIntersection()) {
    return {
      allOf: type.types.map(variant =>
        typeToSchema(variant, checker, location, new Set(seen), depth + 1),
      ),
    };
  }

  const symbolName = type.aliasSymbol?.getName() ?? type.getSymbol()?.getName();
  const promised = symbolName === 'Promise' ? checker.getAwaitedType(type) : undefined;
  if (promised && promised !== type) {
    return typeToSchema(promised, checker, location, seen, depth + 1);
  }

  if (symbolName === 'Date') {
    return { type: 'string', format: 'date-time' };
  }

  if (checker.isTupleType(type)) {
    const typeArguments = checker.getTypeArguments(type as ts.TypeReference);
    const prefixItems = typeArguments.map(item =>
      typeToSchema(item, checker, location, new Set(seen), depth + 1),
    );
    return {
      type: 'array',
      prefixItems,
      minItems: prefixItems.length,
      maxItems: prefixItems.length,
    };
  }

  if (checker.isArrayType(type)) {
    const item = checker.getTypeArguments(type as ts.TypeReference)[0];
    return {
      type: 'array',
      items: item
        ? typeToSchema(item, checker, location, new Set(seen), depth + 1)
        : unknownSchema(),
    };
  }

  if (type.flags & ts.TypeFlags.Object) {
    const nextSeen = new Set(seen);
    nextSeen.add(type);
    const properties: Record<string, Schema> = {};
    const requiredProperties: string[] = [];

    checker.getPropertiesOfType(type).forEach(property => {
      if (property.getName().startsWith('__@')) {
        return;
      }

      const declaration = property.valueDeclaration ?? property.declarations?.[0] ?? location;
      const propertyType = checker.getTypeOfSymbolAtLocation(property, declaration);

      // Functions are not JSON values. This also prevents array prototype methods from
      // leaking into schemas when an array is spread into an object literal.
      if (propertyType.getCallSignatures().length) {
        return;
      }

      properties[property.getName()] = typeToSchema(
        propertyType,
        checker,
        declaration,
        new Set(nextSeen),
        depth + 1,
      );

      if (!(property.flags & ts.SymbolFlags.Optional)) {
        requiredProperties.push(property.getName());
      }
    });

    const stringIndex = checker.getIndexTypeOfType(type, ts.IndexKind.String);
    const schema = objectSchema(properties, requiredProperties);

    if (stringIndex) {
      schema.additionalProperties = typeToSchema(
        stringIndex,
        checker,
        location,
        new Set(nextSeen),
        depth + 1,
      );
    }

    return schema;
  }

  return unknownSchema();
}

function required(schema: Schema): InferredSchema {
  return { schema, optional: false };
}

function objectSchema(
  properties: Record<string, Schema>,
  requiredProperties: string[] = Object.keys(properties),
): Schema {
  return {
    type: 'object',
    properties,
    ...(requiredProperties.length ? { required: requiredProperties } : {}),
  };
}

const knownSchemas: Record<string, () => InferredSchema> = {
  timezoneParam: () => required(stringSchema()),
  unitParam: () => required(stringSchema()),
  userRoleParam: () => required({ type: 'string', enum: ['admin', 'user', 'view-only'] }),
  teamRoleParam: () =>
    required({ type: 'string', enum: ['team-member', 'team-view-only', 'team-manager'] }),
  anyObjectParam: () => required({ type: 'object', additionalProperties: true }),
  urlOrPathParam: () => required(stringSchema()),
  fieldsParam: () => required(stringSchema()),
  reportTypeParam: () => required(stringSchema()),
  operatorParam: () => required(stringSchema()),
  segmentTypeParam: () => required({ type: 'string', enum: ['segment', 'cohort'] }),
  annotationSchema: () =>
    required(
      objectSchema(
        {
          date: { type: 'string', format: 'date-time' },
          allDay: booleanSchema(),
          note: { type: 'string', minLength: 1, maxLength: 500 },
        },
        ['date', 'note'],
      ),
    ),
  segmentParamSchema: () =>
    required(
      objectSchema(
        {
          filters: { type: 'array', items: { type: 'object', additionalProperties: true } },
          match: { type: 'string', enum: ['all', 'any'] },
          dateRange: stringSchema(),
          action: objectSchema({ type: stringSchema(), value: stringSchema() }),
        },
        [],
      ),
    ),
  reportSchema: () =>
    required(
      objectSchema(
        {
          websiteId: { type: 'string', format: 'uuid' },
          type: stringSchema(),
          name: { type: 'string', maxLength: 200 },
          description: { type: 'string', maxLength: 500 },
          parameters: { type: 'object', additionalProperties: true },
        },
        ['websiteId', 'type', 'name', 'parameters'],
      ),
    ),
  reportResultSchema: () =>
    required(
      objectSchema(
        {
          websiteId: { type: 'string', format: 'uuid' },
          filters: { type: 'object', additionalProperties: true },
          type: stringSchema(),
          parameters: { type: 'object', additionalProperties: true },
        },
        ['websiteId', 'filters', 'type', 'parameters'],
      ),
    ),
};

const knownFragments: Record<string, Schema> = {
  dateRangeParams: objectSchema(
    {
      startAt: numberSchema(),
      endAt: numberSchema(),
      startDate: { type: 'string', format: 'date-time' },
      endDate: { type: 'string', format: 'date-time' },
      timezone: stringSchema(),
      unit: stringSchema(),
      compare: { type: 'string', enum: ['prev', 'yoy'] },
    },
    [],
  ),
  filterParams: objectSchema(
    {
      ...Object.fromEntries(
        [
          'path',
          'referrer',
          'title',
          'query',
          'os',
          'browser',
          'device',
          'country',
          'region',
          'city',
          'tag',
          'hostname',
          'distinctId',
          'language',
          'event',
          'utmSource',
          'utmMedium',
          'utmCampaign',
          'utmContent',
          'utmTerm',
          'excludeBounce',
        ].map(name => [name, stringSchema()]),
      ),
      segment: { type: 'string', format: 'uuid' },
      cohort: { type: 'string', format: 'uuid' },
      eventType: { type: 'integer', minimum: 1 },
      match: { type: 'string', enum: ['all', 'any'] },
    },
    [],
  ),
  searchParams: objectSchema({ search: stringSchema() }, []),
  replayParams: objectSchema({ minDuration: { type: 'integer', minimum: 0 } }, []),
  pagingParams: objectSchema(
    {
      page: { type: 'integer', minimum: 1 },
      pageSize: { type: 'integer', minimum: 1 },
      maxResults: { type: 'integer', minimum: 1 },
    },
    [],
  ),
  sortingParams: objectSchema(
    {
      orderBy: stringSchema(),
      sortDescending: { type: 'string', enum: ['true', 'false'] },
    },
    [],
  ),
};

function getPropertyName(node: ts.PropertyName | undefined, source: ts.SourceFile) {
  if (!node) {
    return null;
  }

  if (ts.isIdentifier(node) || ts.isStringLiteral(node) || ts.isNumericLiteral(node)) {
    return node.text;
  }

  return node.getText(source).replace(/^['"]|['"]$/g, '');
}

function getLiteralValue(expression: ts.Expression): string | number | boolean | null | undefined {
  if (ts.isStringLiteral(expression)) {
    return expression.text;
  }

  if (ts.isNumericLiteral(expression)) {
    return Number(expression.text);
  }

  if (expression.kind === ts.SyntaxKind.TrueKeyword) {
    return true;
  }

  if (expression.kind === ts.SyntaxKind.FalseKeyword) {
    return false;
  }

  if (expression.kind === ts.SyntaxKind.NullKeyword) {
    return null;
  }

  return undefined;
}

function mergeObjectSchemas(target: Schema, source: Schema) {
  const targetProperties = (target.properties ?? {}) as Record<string, Schema>;
  const sourceProperties = (source.properties ?? {}) as Record<string, Schema>;
  const requiredProperties = new Set([
    ...((target.required ?? []) as string[]),
    ...((source.required ?? []) as string[]),
  ]);

  target.type = 'object';
  target.properties = { ...targetProperties, ...sourceProperties };

  if (requiredProperties.size) {
    target.required = [...requiredProperties];
  }
}

function inferObjectLiteral(
  expression: ts.ObjectLiteralExpression,
  source: ts.SourceFile,
  declarations: Map<string, ts.Expression>,
  seen: Set<string>,
): InferredSchema {
  const properties: Record<string, Schema> = {};
  const requiredProperties = new Set<string>();

  expression.properties.forEach(property => {
    if (ts.isSpreadAssignment(property)) {
      const inferred = inferExpression(property.expression, source, declarations, seen);
      Object.assign(properties, (inferred.schema.properties ?? {}) as Record<string, Schema>);
      ((inferred.schema.required ?? []) as string[]).forEach(name => {
        requiredProperties.add(name);
      });
      return;
    }

    if (ts.isPropertyAssignment(property)) {
      const name = getPropertyName(property.name, source);

      if (!name) {
        return;
      }

      const inferred = inferExpression(property.initializer, source, declarations, seen);
      properties[name] = inferred.schema;

      if (!inferred.optional) {
        requiredProperties.add(name);
      }
      return;
    }

    if (ts.isShorthandPropertyAssignment(property)) {
      const name = property.name.text;
      const inferred = inferExpression(property.name, source, declarations, seen);
      properties[name] = inferred.schema;

      if (!inferred.optional) {
        requiredProperties.add(name);
      }
    }
  });

  return required(objectSchema(properties, [...requiredProperties]));
}

function applyConstraint(schema: Schema, method: string, argument?: ts.Expression) {
  const value = argument ? getLiteralValue(argument) : undefined;

  if (method === 'int') {
    schema.type = 'integer';
  } else if (method === 'positive') {
    schema.exclusiveMinimum = 0;
  } else if (method === 'nonnegative') {
    schema.minimum = 0;
  } else if (method === 'min' && typeof value === 'number') {
    const numericValue = value;

    if (schema.type === 'string') schema.minLength = numericValue;
    else if (schema.type === 'array') schema.minItems = numericValue;
    else schema.minimum = numericValue;
  } else if (method === 'max' && typeof value === 'number') {
    const numericValue = value;

    if (schema.type === 'string') schema.maxLength = numericValue;
    else if (schema.type === 'array') schema.maxItems = numericValue;
    else schema.maximum = numericValue;
  } else if (method === 'length' && typeof value === 'number') {
    const numericValue = value;

    if (schema.type === 'array') {
      schema.minItems = numericValue;
      schema.maxItems = numericValue;
    } else {
      schema.minLength = numericValue;
      schema.maxLength = numericValue;
    }
  }
}

function inferCallExpression(
  expression: ts.CallExpression,
  source: ts.SourceFile,
  declarations: Map<string, ts.Expression>,
  seen: Set<string>,
): InferredSchema {
  const callee = expression.expression;
  const method = ts.isPropertyAccessExpression(callee) ? callee.name.text : callee.getText(source);
  const base = ts.isPropertyAccessExpression(callee) ? callee.expression : undefined;

  if (method === 'withDateRange') {
    const schema = structuredClone(knownFragments.dateRangeParams);

    if (expression.arguments[0]) {
      mergeObjectSchemas(
        schema,
        inferExpression(expression.arguments[0], source, declarations, seen).schema,
      );
    }

    return required(schema);
  }

  if (['optional', 'nullish', 'default', 'catch'].includes(method) && base) {
    const inferred = inferExpression(base, source, declarations, seen);

    if (method === 'nullish') {
      inferred.schema = { anyOf: [inferred.schema, { type: 'null' }] };
    }

    inferred.optional = true;
    return inferred;
  }

  if (method === 'nullable' && base) {
    const inferred = inferExpression(base, source, declarations, seen);
    inferred.schema = { anyOf: [inferred.schema, { type: 'null' }] };
    return inferred;
  }

  if (method === 'or' && base && expression.arguments[0]) {
    const left = inferExpression(base, source, declarations, seen);
    const right = inferExpression(expression.arguments[0], source, declarations, seen);
    return {
      schema: { anyOf: [left.schema, right.schema] },
      optional: left.optional && right.optional,
    };
  }

  if (
    [
      'refine',
      'superRefine',
      'transform',
      'pipe',
      'strict',
      'passthrough',
      'strip',
      'describe',
      'meta',
      'brand',
      'readonly',
    ].includes(method) &&
    base
  ) {
    return inferExpression(base, source, declarations, seen);
  }

  if (['min', 'max', 'length', 'int', 'positive', 'nonnegative'].includes(method) && base) {
    const inferred = inferExpression(base, source, declarations, seen);
    applyConstraint(inferred.schema, method, expression.arguments[0]);
    return inferred;
  }

  if (method === 'partial' && base) {
    const inferred = inferExpression(base, source, declarations, seen);
    delete inferred.schema.required;
    return inferred;
  }

  if (method === 'array' && expression.arguments[0]) {
    return required({
      type: 'array',
      items: inferExpression(expression.arguments[0], source, declarations, seen).schema,
    });
  }

  if (
    method === 'object' &&
    expression.arguments[0] &&
    ts.isObjectLiteralExpression(expression.arguments[0])
  ) {
    return inferObjectLiteral(expression.arguments[0], source, declarations, seen);
  }

  if (method === 'record') {
    const valueExpression = expression.arguments.at(-1);
    return required({
      type: 'object',
      additionalProperties: valueExpression
        ? inferExpression(valueExpression, source, declarations, seen).schema
        : true,
    });
  }

  if (['union', 'discriminatedUnion'].includes(method)) {
    const variantsExpression = expression.arguments[method === 'union' ? 0 : 1];

    if (variantsExpression && ts.isArrayLiteralExpression(variantsExpression)) {
      return required({
        anyOf: variantsExpression.elements.map(
          element => inferExpression(element as ts.Expression, source, declarations, seen).schema,
        ),
      });
    }
  }

  if (method === 'intersection' && expression.arguments.length >= 2) {
    return required({
      allOf: expression.arguments.map(
        argument => inferExpression(argument, source, declarations, seen).schema,
      ),
    });
  }

  if (
    method === 'enum' &&
    expression.arguments[0] &&
    ts.isArrayLiteralExpression(expression.arguments[0])
  ) {
    return required({
      type: 'string',
      enum: expression.arguments[0].elements
        .map(element => getLiteralValue(element as ts.Expression))
        .filter((value): value is string => typeof value === 'string'),
    });
  }

  if (method === 'literal' && expression.arguments[0]) {
    const value = getLiteralValue(expression.arguments[0]);
    return value === undefined ? required(unknownSchema()) : required({ const: value });
  }

  if (
    method === 'tuple' &&
    expression.arguments[0] &&
    ts.isArrayLiteralExpression(expression.arguments[0])
  ) {
    const prefixItems = expression.arguments[0].elements.map(
      element => inferExpression(element as ts.Expression, source, declarations, seen).schema,
    );
    return required({
      type: 'array',
      prefixItems,
      minItems: prefixItems.length,
      maxItems: prefixItems.length,
    });
  }

  if (['string', 'email', 'url'].includes(method)) {
    return required({ type: 'string', ...(method !== 'string' ? { format: method } : {}) });
  }

  if (['uuid', 'guid'].includes(method)) {
    return required({ type: 'string', format: 'uuid' });
  }

  if (method === 'date') {
    return required({ type: 'string', format: 'date-time' });
  }

  if (['number', 'float32', 'float64'].includes(method)) {
    return required(numberSchema());
  }

  if (['int', 'int32', 'int64'].includes(method) && base?.getText(source).startsWith('z')) {
    return required({ type: 'integer' });
  }

  if (method === 'boolean') {
    return required(booleanSchema());
  }

  if (['any', 'unknown', 'undefined', 'void', 'never'].includes(method)) {
    return required(unknownSchema());
  }

  if (ts.isIdentifier(callee) && knownSchemas[callee.text]) {
    return knownSchemas[callee.text]();
  }

  return required(unknownSchema());
}

function inferExpression(
  expression: ts.Expression,
  source: ts.SourceFile,
  declarations: Map<string, ts.Expression>,
  seen = new Set<string>(),
): InferredSchema {
  if (ts.isParenthesizedExpression(expression) || ts.isAsExpression(expression)) {
    return inferExpression(expression.expression, source, declarations, seen);
  }

  if (ts.isIdentifier(expression)) {
    const name = expression.text;

    if (knownFragments[name]) {
      return required(structuredClone(knownFragments[name]));
    }

    if (knownSchemas[name]) {
      return knownSchemas[name]();
    }

    const declaration = declarations.get(name);

    if (declaration && !seen.has(name)) {
      const nextSeen = new Set(seen);
      nextSeen.add(name);
      return inferExpression(declaration, source, declarations, nextSeen);
    }

    return required(unknownSchema());
  }

  if (ts.isObjectLiteralExpression(expression)) {
    return inferObjectLiteral(expression, source, declarations, seen);
  }

  if (ts.isArrayLiteralExpression(expression)) {
    const variants = expression.elements.map(
      element => inferExpression(element as ts.Expression, source, declarations, seen).schema,
    );
    return required({
      type: 'array',
      items: variants.length === 1 ? variants[0] : { anyOf: variants },
    });
  }

  if (ts.isCallExpression(expression)) {
    return inferCallExpression(expression, source, declarations, seen);
  }

  const literal = getLiteralValue(expression);

  if (literal !== undefined) {
    return required({ const: literal });
  }

  return required(unknownSchema());
}

function collectDeclarations(node: ts.Node, declarations: Map<string, ts.Expression>) {
  if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
    declarations.set(node.name.text, node.initializer);
  }

  ts.forEachChild(node, child => collectDeclarations(child, declarations));
}

function findHandler(source: ts.SourceFile, method: ApiHttpMethod): ts.Node | undefined {
  const methodName = method.toUpperCase();

  for (const statement of source.statements) {
    if (ts.isFunctionDeclaration(statement) && statement.name?.text === methodName) {
      return statement;
    }

    if (ts.isVariableStatement(statement)) {
      const declaration = statement.declarationList.declarations.find(
        item => ts.isIdentifier(item.name) && item.name.text === methodName,
      );

      if (declaration?.initializer) {
        return declaration.initializer;
      }
    }
  }

  return undefined;
}

function getNumericStatus(options: ts.Expression | undefined, source: ts.SourceFile) {
  if (!options || !ts.isObjectLiteralExpression(options)) {
    return null;
  }

  const status = options.properties.find(
    property =>
      ts.isPropertyAssignment(property) && getPropertyName(property.name, source) === 'status',
  );

  if (!status || !ts.isPropertyAssignment(status)) {
    return null;
  }

  const value = getLiteralValue(status.initializer);
  return typeof value === 'string' ? Number(value) : typeof value === 'number' ? value : null;
}

export function analyzeSourceOperation(
  source: ts.SourceFile,
  method: ApiHttpMethod,
  checker?: ts.TypeChecker,
): SourceOperationAnalysis {
  const handler = findHandler(source, method);

  if (!handler) {
    return {
      auth: 'bearer',
      hasRequestSchema: false,
      responseStatuses: [200],
      responseSchemas: {},
      responseMediaType: 'application/json',
      returnsOk: false,
    };
  }

  const declarations = new Map<string, ts.Expression>();
  source.statements.forEach(statement => {
    if (ts.isVariableStatement(statement)) {
      statement.declarationList.declarations.forEach(declaration => {
        if (ts.isIdentifier(declaration.name) && declaration.initializer) {
          declarations.set(declaration.name.text, declaration.initializer);
        }
      });
    }
  });
  collectDeclarations(handler, declarations);

  let parseRequestCall: ts.CallExpression | undefined;
  let hasShareAwarePermission = false;
  let returnsOk = false;
  let responseMediaType = 'application/json';
  const responseStatuses = new Set<number>();
  const responseSchemaVariants = new Map<number, Schema[]>();

  const addResponseSchema = (status: number, expression: ts.Expression | undefined) => {
    if (!expression) {
      return;
    }

    const syntactic = inferExpression(expression, source, declarations).schema;
    const typed = checker
      ? typeToSchema(checker.getTypeAtLocation(expression), checker, expression)
      : unknownSchema();
    const schema = isUnknownSchema(typed) ? syntactic : typed;

    if (!isUnknownSchema(schema)) {
      responseSchemaVariants.set(status, [...(responseSchemaVariants.get(status) ?? []), schema]);
    }
  };

  const visit = (node: ts.Node) => {
    if (ts.isCallExpression(node)) {
      const calleeText = node.expression.getText(source);
      const name = ts.isIdentifier(node.expression)
        ? node.expression.text
        : ts.isPropertyAccessExpression(node.expression)
          ? node.expression.name.text
          : calleeText;

      if (name === 'parseRequest' && !parseRequestCall) {
        parseRequestCall = node;
      }

      if (/^canView/.test(name)) {
        hasShareAwarePermission = true;
      }

      const mappedStatus = RESPONSE_STATUSES[name];

      if (mappedStatus) {
        responseStatuses.add(mappedStatus);
        returnsOk ||= name === 'ok';

        if (name === 'ok') {
          responseSchemaVariants.set(mappedStatus, [
            ...(responseSchemaVariants.get(mappedStatus) ?? []),
            objectSchema({ ok: { const: true } }),
          ]);
        } else if (name === 'json') {
          addResponseSchema(mappedStatus, node.arguments[0]);
        }
      }

      if (calleeText === 'Response.json') {
        const status = getNumericStatus(node.arguments[1], source) ?? 200;
        responseStatuses.add(status);
        addResponseSchema(status, node.arguments[0]);
      }
    }

    if (ts.isNewExpression(node) && node.expression.getText(source) === 'Response') {
      responseStatuses.add(getNumericStatus(node.arguments?.[1], source) ?? 200);
      responseMediaType = handler.getText(source).includes('text/javascript')
        ? 'text/javascript'
        : 'text/plain';
    }

    ts.forEachChild(node, visit);
  };

  visit(handler);

  const schemaArgument = parseRequestCall?.arguments[1];
  const hasRequestSchema = Boolean(
    schemaArgument && schemaArgument.kind !== ts.SyntaxKind.NullKeyword,
  );
  const skipAuth =
    parseRequestCall?.arguments[2]?.getText(source).includes('skipAuth: true') ?? false;
  const auth: ApiAuth =
    !parseRequestCall || skipAuth ? 'none' : hasShareAwarePermission ? 'bearer-or-share' : 'bearer';

  if (hasRequestSchema) {
    responseStatuses.add(400);
  }

  if (auth !== 'none') {
    responseStatuses.add(401);
  }

  if (![...responseStatuses].some(status => status >= 200 && status < 400)) {
    responseStatuses.add(200);
  }

  const responseSchemas = Object.fromEntries(
    [...responseSchemaVariants.entries()].map(([status, variants]) => {
      const unique = [
        ...new Map(variants.map(schema => [JSON.stringify(schema), schema])).values(),
      ];
      return [status, unique.length === 1 ? unique[0] : { anyOf: unique }];
    }),
  );

  return {
    auth,
    hasRequestSchema,
    requestSchema: schemaArgument
      ? inferExpression(schemaArgument, source, declarations).schema
      : undefined,
    responseStatuses: [...responseStatuses].sort((left, right) => left - right),
    responseSchemas,
    responseMediaType,
    returnsOk,
  };
}
