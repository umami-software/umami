import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';
import { API_HTTP_METHODS, type ApiHttpMethod } from '@/openapi/operation';
import { analyzeSourceOperation, type SourceOperationAnalysis } from '@/openapi/source-analysis';

const ROUTE_FILE_PATTERN = /^route\.(?:js|jsx|ts|tsx)$/;
const METHOD_NAMES = new Set(API_HTTP_METHODS.map(method => method.toUpperCase()));

export interface DiscoveredApiOperation {
  method: ApiHttpMethod;
  path: `/${string}`;
  source: string;
  analysis: SourceOperationAnalysis;
}

async function walk(directory: string, predicate: (name: string) => boolean): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async entry => {
      const entryPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        return walk(entryPath, predicate);
      }

      return predicate(entry.name) ? [entryPath] : [];
    }),
  );

  return files.flat();
}

function hasExportModifier(node: ts.Node) {
  return ts.canHaveModifiers(node)
    ? ts.getModifiers(node)?.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword)
    : false;
}

function getExportedMethods(source: ts.SourceFile): ApiHttpMethod[] {
  const methods = new Set<ApiHttpMethod>();

  const addMethod = (name: string) => {
    if (METHOD_NAMES.has(name)) {
      methods.add(name.toLowerCase() as ApiHttpMethod);
    }
  };

  source.statements.forEach(statement => {
    if (ts.isFunctionDeclaration(statement) && statement.name && hasExportModifier(statement)) {
      addMethod(statement.name.text);
      return;
    }

    if (ts.isVariableStatement(statement) && hasExportModifier(statement)) {
      statement.declarationList.declarations.forEach(declaration => {
        if (ts.isIdentifier(declaration.name)) {
          addMethod(declaration.name.text);
        }
      });
      return;
    }

    if (ts.isExportDeclaration(statement) && statement.exportClause) {
      if (ts.isNamedExports(statement.exportClause)) {
        statement.exportClause.elements.forEach(element => {
          addMethod(element.name.text);
        });
      }
    }
  });

  return API_HTTP_METHODS.filter(method => methods.has(method));
}

function toOpenApiSegment(segment: string) {
  if ((segment.startsWith('(') && segment.endsWith(')')) || segment.startsWith('@')) {
    return null;
  }

  const optionalCatchAll = segment.match(/^\[\[\.\.\.(.+)]]$/);
  const catchAll = segment.match(/^\[\.\.\.(.+)]$/);
  const dynamic = segment.match(/^\[(.+)]$/);
  const name = optionalCatchAll?.[1] ?? catchAll?.[1] ?? dynamic?.[1];

  return name ? `{${name}}` : segment;
}

function getRoutePath(apiRoot: string, routeFile: string): `/${string}` {
  const relativeDirectory = path.relative(apiRoot, path.dirname(routeFile));
  const segments = relativeDirectory
    .split(path.sep)
    .filter(Boolean)
    .map(toOpenApiSegment)
    .filter((segment): segment is string => segment !== null);

  return `/api${segments.length ? `/${segments.join('/')}` : ''}`;
}

export async function discoverApiOperations(
  projectRoot = process.cwd(),
): Promise<DiscoveredApiOperation[]> {
  const apiRoot = path.join(projectRoot, 'src', 'app', 'api');
  const routeFiles = await walk(apiRoot, name => ROUTE_FILE_PATTERN.test(name));
  const operations: DiscoveredApiOperation[] = [];
  const configFile = ts.readConfigFile(path.join(projectRoot, 'tsconfig.json'), ts.sys.readFile);
  const parsedConfig = ts.parseJsonConfigFileContent(configFile.config, ts.sys, projectRoot);
  const program = ts.createProgram(parsedConfig.fileNames, parsedConfig.options);
  const checker = program.getTypeChecker();

  for (const routeFile of routeFiles.sort()) {
    const source =
      program.getSourceFile(routeFile) ??
      ts.createSourceFile(
        routeFile,
        await readFile(routeFile, 'utf8'),
        ts.ScriptTarget.Latest,
        true,
        routeFile.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
      );
    const routePath = getRoutePath(apiRoot, routeFile);
    const relativeSource = path.relative(projectRoot, routeFile).replaceAll(path.sep, '/');

    getExportedMethods(source).forEach(method => {
      operations.push({
        method,
        path: routePath,
        source: relativeSource,
        analysis: analyzeSourceOperation(source, method, checker),
      });
    });
  }

  return operations.sort((left, right) =>
    `${left.path}:${left.method}`.localeCompare(`${right.path}:${right.method}`),
  );
}

export async function discoverContractFiles(projectRoot = process.cwd()) {
  const apiRoot = path.join(projectRoot, 'src', 'app', 'api');

  return (
    await walk(apiRoot, name => name === 'contract.ts' || name === 'contract.generated.ts')
  ).sort();
}
