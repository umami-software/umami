import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';

export interface MLModelsParameters {
  limit?: number;
  status?: string;
}

export interface MLModelData {
  id: string;
  name: string;
  version: string;
  model_type: string;
  algorithm: string;
  hyperparameters: any;
  training_data_period: any;
  metrics: any;
  artifact_path: string;
  artifact_size_bytes: number;
  status: string;
  is_active: boolean;
  trained_at: Date;
  deployed_at: Date;
  created_at: Date;
}

export async function getMLModels(params: MLModelsParameters = {}): Promise<MLModelData[]> {
  const { limit = 50, status } = params;

  const queryParams = {
    limit,
    status: status || null,
  };

  return runQuery({
    [PRISMA]: () => getMLModelsPostgres(queryParams),
    [CLICKHOUSE]: () => getMLModelsPostgres(queryParams),
  });
}

async function getMLModelsPostgres(params: any): Promise<MLModelData[]> {
  const { rawQuery } = prisma;
  const { limit, status } = params;

  let statusFilter = '';
  if (status) {
    statusFilter = 'and status = {{status}}';
  }

  const models = await rawQuery(
    `
    select
      id,
      name,
      version,
      model_type,
      algorithm,
      hyperparameters,
      training_data_period,
      metrics,
      artifact_path,
      artifact_size_bytes,
      status,
      is_active,
      trained_at,
      deployed_at,
      created_at
    from ml_models
    where 1=1 ${statusFilter}
    order by created_at desc
    limit {{limit}}
  `,
    params,
  );

  return models.map((row: any) => ({
    id: row.id,
    name: row.name,
    version: row.version,
    model_type: row.model_type,
    algorithm: row.algorithm,
    hyperparameters: row.hyperparameters,
    training_data_period: row.training_data_period,
    metrics: row.metrics,
    artifact_path: row.artifact_path,
    artifact_size_bytes: Number(row.artifact_size_bytes),
    status: row.status,
    is_active: row.is_active,
    trained_at: row.trained_at,
    deployed_at: row.deployed_at,
    created_at: row.created_at,
  }));
}

