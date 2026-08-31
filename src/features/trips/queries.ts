import { useQuery } from '@tanstack/react-query';
import { tripRepository } from '../../repositories/TripRepositoryProvider';
import { budgetRepository } from '../../repositories/mock/MockBudgetRepository';
import { supabase } from '../../lib/supabase';
export const useTrips = () => useQuery({ queryKey: ['trips'], queryFn: () => tripRepository.listTrips() });
export const useTrip = (tripId?: string) => useQuery({ queryKey: ['trip', tripId], queryFn: () => tripRepository.getTrip(tripId!), enabled: Boolean(tripId) });
export const useTripDays = (tripId?: string) => useQuery({ queryKey: ['trip-days', tripId], queryFn: () => tripRepository.listDays(tripId!), enabled: Boolean(tripId) });
export const useTripMembers = (tripId?: string) => useQuery({ queryKey: ['trip-members', tripId], queryFn: () => tripRepository.listMembers(tripId!), enabled: Boolean(tripId) });
export const usePlaces = (tripId?: string) => useQuery({ queryKey: ['places', tripId], queryFn: () => tripRepository.listPlaces(tripId!), enabled: Boolean(tripId) });
export const usePlace = (tripId?: string, placeId?: string) => useQuery({ queryKey: ['place', tripId, placeId], queryFn: () => tripRepository.getPlace(tripId!, placeId!), enabled: Boolean(tripId && placeId) });
// M1 deferred: Expenses do not yet have a Supabase repository, so this query remains demo-only.
export const useExpenses = (tripId?: string) => useQuery({ queryKey: ['expenses', tripId], queryFn: () => budgetRepository.listExpenses(), enabled: Boolean(tripId) });
export const useTripRole = (tripId?:string) => useQuery({queryKey:['trip-role',tripId],queryFn:async()=>{if(!supabase)return'owner' as const;const{data,error}=await supabase.rpc('current_user_role',{target_trip_id:tripId!});if(error)throw error;return data},enabled:Boolean(tripId)});
