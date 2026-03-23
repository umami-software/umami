import { useApi } from "../useApi";
import { useDateParameters } from "../useDateParameters";
import { useFilterParameters } from "../useFilterParameters";
import { useModified } from "../useModified";
import { useNavigation } from "../useNavigation";
import { usePagedQuery } from "../usePagedQuery";

export function useWebsiteSessionsQuery(
  websiteId: string,
  params?: Record<string, string | number>,
) {
  const { get } = useApi();
  const { modified } = useModified(`sessions`);
  const { startAt, endAt, unit, timezone } = useDateParameters();
  const filters = useFilterParameters();
  const {
    query: { orderBy, sortDescending },
  } = useNavigation();

  return usePagedQuery({
    queryKey: [
      "sessions",
      {
        websiteId,
        modified,
        startAt,
        endAt,
        unit,
        timezone,
        orderBy,
        sortDescending,
        ...params,
        ...filters,
      },
    ],
    queryFn: (pageParams) => {
      return get(`/websites/${websiteId}/sessions`, {
        startAt,
        endAt,
        unit,
        timezone,
        ...filters,
        ...pageParams,
        ...params,
        orderBy,
        sortDescending,
        pageSize: 20,
      });
    },
  });
}
