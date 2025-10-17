import { useRealtimeRefresh } from '../contexts/RealtimeProvider';

/**
 * Custom hook that provides a refresh trigger value.
 *
 * Components can include this trigger in their useEffect dependencies
 * to automatically refetch data when any realtime database change occurs.
 *
 * @example
 * const { refreshTrigger } = useDataRefresher();
 *
 * useEffect(() => {
 *   fetchData();
 * }, [refreshTrigger]);
 */
export function useDataRefresher() {
  return useRealtimeRefresh();
}
