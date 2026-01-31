import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { RentalQueryDto, UpdateRentalStatusDto, RentalStatus } from '@bthgrentalcar/sdk';
import { rentalKeys } from './useRentals';

export const adminKeys = {
  dashboard: ['admin', 'dashboard'] as const,
  rentals: (query?: RentalQueryDto) => ['admin', 'rentals', query] as const,
};

export function useAdminDashboard() {
  return useQuery({
    queryKey: adminKeys.dashboard,
    queryFn: () => api.admin.getDashboard(),
  });
}

export function useAdminRentals(query?: RentalQueryDto) {
  return useQuery({
    queryKey: adminKeys.rentals(query),
    queryFn: () => api.admin.getRentals(query),
  });
}

export function useUpdateRentalStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: RentalStatus }) =>
      api.admin.updateRentalStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'rentals'] });
      queryClient.invalidateQueries({ queryKey: rentalKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboard });
    },
  });
}
