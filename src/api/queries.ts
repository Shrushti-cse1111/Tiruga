import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import { Trip } from '../../shared/types';

export const QUERY_KEYS = {
  user: ['user'] as const,
  config: ['config'] as const,
  trips: ['trips'] as const,
  trip: (id: string) => ['trip', id] as const,
  places: (search?: string, category?: string) => ['places', { search, category }] as const,
  place: (id: string) => ['place', id] as const,
  saved: ['saved'] as const,
  agentRuns: (tripId: string) => ['agentRuns', tripId] as const,
  transportLegs: ['transportLegs'] as const,
  emergencyContacts: ['emergencyContacts'] as const
};

export function useCurrentUserQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.user,
    queryFn: () => apiClient.getCurrentUser()
  });
}

export function useConfigQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.config,
    queryFn: () => apiClient.getConfig()
  });
}

export function useTripsQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.trips,
    queryFn: () => apiClient.getTrips()
  });
}

export function useTripQuery(tripId: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.trip(tripId || ''),
    queryFn: () => (tripId ? apiClient.getTrip(tripId) : null),
    enabled: Boolean(tripId)
  });
}

export function useNearbyPlacesQuery(search?: string, category?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.places(search, category),
    queryFn: () => apiClient.getNearbyPlaces(search, category)
  });
}

export function usePlaceQuery(placeId: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.place(placeId || ''),
    queryFn: () => (placeId ? apiClient.getPlace(placeId) : null),
    enabled: Boolean(placeId)
  });
}

export function useSavedItemsQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.saved,
    queryFn: () => apiClient.getSavedItems()
  });
}

export function useAgentRunsQuery(tripId: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.agentRuns(tripId || ''),
    queryFn: () => (tripId ? apiClient.getAgentRuns(tripId) : []),
    enabled: Boolean(tripId)
  });
}

export function useTransportLegsQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.transportLegs,
    queryFn: () => apiClient.getTransportLegs()
  });
}

export function useEmergencyContactsQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.emergencyContacts,
    queryFn: () => apiClient.getEmergencyContacts()
  });
}

// Mutations
export function useToggleShaktiMutation(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (active: boolean) => apiClient.toggleShakti(tripId, active),
    onSuccess: (updatedTrip) => {
      if (updatedTrip) {
        queryClient.setQueryData(QUERY_KEYS.trip(tripId), updatedTrip);
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.trips });
      }
    }
  });
}

export function useSwapStopMutation(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ stopId, direction }: { stopId: string; direction: 'up' | 'down' }) =>
      apiClient.swapStop(tripId, stopId, direction),
    onSuccess: (updatedTrip) => {
      if (updatedTrip) {
        queryClient.setQueryData(QUERY_KEYS.trip(tripId), updatedTrip);
      }
    }
  });
}

export function useRemoveStopMutation(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (stopId: string) => apiClient.removeStop(tripId, stopId),
    onSuccess: (updatedTrip) => {
      if (updatedTrip) {
        queryClient.setQueryData(QUERY_KEYS.trip(tripId), updatedTrip);
      }
    }
  });
}

export function useToggleLockStopMutation(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (stopId: string) => apiClient.toggleLockStop(tripId, stopId),
    onSuccess: (updatedTrip) => {
      if (updatedTrip) {
        queryClient.setQueryData(QUERY_KEYS.trip(tripId), updatedTrip);
      }
    }
  });
}

export function useAcceptQuietAlternativeMutation(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (stopId: string) => apiClient.acceptQuietAlternative(tripId, stopId),
    onSuccess: (updatedTrip) => {
      if (updatedTrip) {
        queryClient.setQueryData(QUERY_KEYS.trip(tripId), updatedTrip);
      }
    }
  });
}
