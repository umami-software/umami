import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { discoverContractFiles } from '@/openapi/discover';
import type { ApiOperationContract, LoadedApiOperationContract } from '@/openapi/operation';

interface ContractModule {
  operations?: readonly ApiOperationContract[];
}

export async function loadApiContracts(
  projectRoot = process.cwd(),
): Promise<LoadedApiOperationContract[]> {
  const contractFiles = await discoverContractFiles(projectRoot);
  const contracts: LoadedApiOperationContract[] = [];

  for (const contractFile of contractFiles) {
    const module = (await import(pathToFileURL(contractFile).href)) as ContractModule;

    if (!Array.isArray(module.operations)) {
      throw new Error(
        `${path.relative(projectRoot, contractFile)} must export an \`operations\` array.`,
      );
    }

    const source = path.relative(projectRoot, contractFile).replaceAll(path.sep, '/');

    module.operations.forEach(operation => {
      contracts.push({ ...operation, source });
    });
  }

  return contracts;
}
