'use client';
import { Row, Column, Text } from '@umami/react-zen';
import { MetricCard } from '@/components/metrics/MetricCard';
import { MetricsTable } from '@/components/metrics/MetricsTable';
import { useApi } from '@/components/hooks/useApi';
import { useFormat } from '@/components/hooks/useFormat';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { ErrorMessage } from '@/components/common/ErrorMessage';

export interface MLModelRegistryViewerProps {
  limit?: number;
  status?: string;
}

export function MLModelRegistryViewer({
  limit = 50,
  status,
}: MLModelRegistryViewerProps) {
  const { formatNumber } = useFormat();

  const queryParams = new URLSearchParams();
  queryParams.set('limit', limit.toString());
  if (status) queryParams.set('status', status);

  const { data, isLoading, error } = useApi(`/api/first8marketing/recommendations/ml-models?${queryParams.toString()}`, {
    method: 'GET',
  });

  if (isLoading) return <LoadingPanel />;
  if (error) return <ErrorMessage message={error.message} />;

  const models = data || [];

  // Calculate summary metrics
  const totalModels = models.length;
  const activeModels = models.filter((m: any) => m.is_active).length;
  const productionModels = models.filter((m: any) => m.status === 'production').length;
  const trainingModels = models.filter((m: any) => m.status === 'training').length;

  // Model type distribution
  const modelTypeDistribution = models.reduce((acc: any, m: any) => {
    const type = m.model_type || 'unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  // Format date
  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  return (
    <Column gap="4">
      <Text size="6" weight="bold">ML Model Registry</Text>

      {/* Summary Metrics */}
      <Row gap="4">
        <MetricCard
          label="Total Models"
          value={formatNumber(totalModels)}
        />
        <MetricCard
          label="Active Models"
          value={formatNumber(activeModels)}
        />
        <MetricCard
          label="Production"
          value={formatNumber(productionModels)}
        />
        <MetricCard
          label="Training"
          value={formatNumber(trainingModels)}
        />
      </Row>

      {/* Model Type Distribution */}
      <Column gap="2">
        <Text size="4" weight="bold">Model Type Distribution</Text>
        <MetricsTable
          data={Object.entries(modelTypeDistribution).map(([type, count]) => ({
            model_type: type,
            count: count,
            percentage: ((count as number / totalModels) * 100).toFixed(1),
          }))}
          columns={[
            { name: 'model_type', label: 'Model Type', type: 'string' },
            { name: 'count', label: 'Count', type: 'number', format: formatNumber },
            { name: 'percentage', label: 'Percentage', type: 'number', format: (v: number) => `${v}%` },
          ]}
        />
      </Column>

      {/* Model Registry Table */}
      <Column gap="2">
        <Text size="4" weight="bold">Model Registry</Text>
        <MetricsTable
          data={models.map((m: any) => ({
            name: m.name,
            version: m.version,
            model_type: m.model_type,
            algorithm: m.algorithm,
            status: m.status,
            is_active: m.is_active ? 'Yes' : 'No',
            precision: m.metrics?.precision ? (m.metrics.precision * 100).toFixed(2) : 'N/A',
            recall: m.metrics?.recall ? (m.metrics.recall * 100).toFixed(2) : 'N/A',
            ndcg: m.metrics?.ndcg ? (m.metrics.ndcg * 100).toFixed(2) : 'N/A',
            artifact_size: m.artifact_size_bytes,
            trained_at: m.trained_at,
            deployed_at: m.deployed_at,
          }))}
          columns={[
            { name: 'name', label: 'Name', type: 'string' },
            { name: 'version', label: 'Version', type: 'string' },
            { name: 'model_type', label: 'Type', type: 'string' },
            { name: 'algorithm', label: 'Algorithm', type: 'string' },
            { name: 'status', label: 'Status', type: 'string' },
            { name: 'is_active', label: 'Active', type: 'string' },
            { name: 'precision', label: 'Precision (%)', type: 'string' },
            { name: 'recall', label: 'Recall (%)', type: 'string' },
            { name: 'ndcg', label: 'NDCG (%)', type: 'string' },
            { name: 'artifact_size', label: 'Size', type: 'number', format: formatFileSize },
            { name: 'trained_at', label: 'Trained', type: 'string', format: formatDate },
            { name: 'deployed_at', label: 'Deployed', type: 'string', format: formatDate },
          ]}
        />
      </Column>
    </Column>
  );
}

