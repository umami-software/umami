import type { DiscoveredApiOperation } from '@/openapi/discover';
import {
  type ApiOperationContract,
  getOperationKey,
  type LoadedApiOperationContract,
} from '@/openapi/operation';

export interface ContractCoverage {
  discovered: DiscoveredApiOperation[];
  contracted: LoadedApiOperationContract[];
  missing: DiscoveredApiOperation[];
  orphaned: LoadedApiOperationContract[];
  duplicateContracts: string[];
  duplicateOperationIds: string[];
  pathParameterMismatches: string[];
}

function getExpectedPathParameters(path: string) {
  return [...path.matchAll(/\{([^}]+)}/g)].map(match => match[1]).sort();
}

function getContractPathParameters(contract: ApiOperationContract) {
  const schema = contract.operation.requestParams?.path as { shape?: unknown } | undefined;
  const shape = schema?.shape;

  if (!shape || typeof shape !== 'object') {
    return [];
  }

  return Object.keys(shape).sort();
}

function arraysEqual(left: string[], right: string[]) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

export function analyzeContractCoverage(
  discovered: DiscoveredApiOperation[],
  contracted: LoadedApiOperationContract[],
): ContractCoverage {
  const relevantRoutes = discovered.filter(operation => operation.method !== 'options');
  const discoveredKeys = new Set(relevantRoutes.map(getOperationKey));
  const contractsByKey = new Map<string, LoadedApiOperationContract[]>();
  const contractsByOperationId = new Map<string, LoadedApiOperationContract[]>();

  contracted.forEach(contract => {
    const key = getOperationKey(contract);
    const operationId = contract.operation.operationId;

    contractsByKey.set(key, [...(contractsByKey.get(key) ?? []), contract]);

    if (operationId) {
      contractsByOperationId.set(operationId, [
        ...(contractsByOperationId.get(operationId) ?? []),
        contract,
      ]);
    }
  });

  const duplicateContracts = [...contractsByKey.entries()]
    .filter(([, contracts]) => contracts.length > 1)
    .map(([key, contracts]) => `${key} (${contracts.map(contract => contract.source).join(', ')})`)
    .sort();
  const duplicateOperationIds = [...contractsByOperationId.entries()]
    .filter(([, contracts]) => contracts.length > 1)
    .map(
      ([operationId, contracts]) =>
        `${operationId} (${contracts.map(contract => contract.source).join(', ')})`,
    )
    .sort();
  const contractedKeys = new Set(contractsByKey.keys());
  const missing = relevantRoutes.filter(
    operation => !contractedKeys.has(getOperationKey(operation)),
  );
  const orphaned = contracted.filter(contract => !discoveredKeys.has(getOperationKey(contract)));
  const pathParameterMismatches = contracted
    .map(contract => {
      const expected = getExpectedPathParameters(contract.path);
      const actual = getContractPathParameters(contract);

      if (arraysEqual(expected, actual)) {
        return null;
      }

      return `${getOperationKey(contract)} declares [${actual.join(', ')}], expected [${expected.join(', ')}] (${contract.source})`;
    })
    .filter((message): message is string => message !== null)
    .sort();

  return {
    discovered: relevantRoutes,
    contracted,
    missing,
    orphaned,
    duplicateContracts,
    duplicateOperationIds,
    pathParameterMismatches,
  };
}

export function getCoverageErrors(coverage: ContractCoverage) {
  return [
    ...coverage.duplicateContracts.map(message => `Duplicate contract: ${message}`),
    ...coverage.duplicateOperationIds.map(message => `Duplicate operationId: ${message}`),
    ...coverage.orphaned.map(
      contract =>
        `Contract does not match a route: ${getOperationKey(contract)} (${contract.source})`,
    ),
    ...coverage.pathParameterMismatches.map(message => `Path parameter mismatch: ${message}`),
  ];
}

export function formatCoverageSummary(coverage: ContractCoverage) {
  return `${coverage.contracted.length}/${coverage.discovered.length} API operations have explicit OpenAPI contracts; ${coverage.missing.length} remain.`;
}
