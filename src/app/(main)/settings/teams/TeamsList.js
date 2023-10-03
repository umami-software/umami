'use client';
import DataTable from 'components/common/DataTable';
import TeamsTable from 'app/(main)/settings/teams/TeamsTable';
import useApi from 'components/hooks/useApi';
import useFilterQuery from 'components/hooks/useFilterQuery';

export function TeamsList() {
  const { get } = useApi();
  const filterQuery = useFilterQuery(['teams'], params => {
    return get(`/teams`, {
      ...params,
    });
  });
  const { getProps } = filterQuery;

  return <DataTable {...getProps()}>{({ data }) => <TeamsTable data={data} />}</DataTable>;
}

export default TeamsList;
