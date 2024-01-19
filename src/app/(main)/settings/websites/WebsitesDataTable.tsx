'use client';
import { ReactNode, useContext } from 'react';
import WebsitesTable from 'app/(main)/settings/websites/WebsitesTable';
import useApi from 'components/hooks/useApi';
import DataTable from 'components/common/DataTable';
import useFilterQuery from 'components/hooks/useFilterQuery';
import useCache from 'store/cache';
import SettingsContext from '../SettingsContext';

export interface WebsitesDataTableProps {
  userId: string;
  allowEdit?: boolean;
  allowView?: boolean;
  showActions?: boolean;
  children?: ReactNode;
}

export function WebsitesDataTable({
  userId,
  allowEdit = true,
  allowView = true,
  showActions = true,
  children,
}: WebsitesDataTableProps) {
  const { get } = useApi();
  const modified = useCache((state: any) => state?.websites);
  const { websitesUrl } = useContext(SettingsContext);

  const queryResult = useFilterQuery({
    queryKey: ['websites', { modified }],
    queryFn: (params: any) => {
      return get(websitesUrl, {
        ...params,
      });
    },
    enabled: !!userId,
  });

  return (
    <DataTable queryResult={queryResult}>
      {({ data }) => (
        <WebsitesTable
          data={data}
          showActions={showActions}
          allowEdit={allowEdit}
          allowView={allowView}
        >
          {children}
        </WebsitesTable>
      )}
    </DataTable>
  );
}

export default WebsitesDataTable;
