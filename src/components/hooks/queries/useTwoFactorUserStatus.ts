import { useApi } from '../useApi';

export function useTwoFactorUserStatusQuery(userId: string) {
    const { get, useQuery } = useApi();

    return useQuery({
        queryKey: ['user-2fa-status', userId],
        queryFn: () => get(`/admin/users/${userId}/2fa`),
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
    });
}
