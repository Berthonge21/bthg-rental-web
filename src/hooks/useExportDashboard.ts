'use client';
import { exportToExcel } from '@/lib/exportUtils';
import { format } from 'date-fns';
import type { Rental, Car } from '@berthonge21/sdk';

export function exportAdminDashboard({
  rentals,
  cars,
  stats,
}: {
  rentals: Rental[];
  cars: Car[];
  stats: {
    totalCars?: number;
    availableCars?: number;
    totalRentals?: number;
    activeRentals?: number;
    pendingRentals?: number;
    completedRentals?: number;
    totalRevenue?: number;
    monthlyRevenue?: number;
  } | undefined;
}) {
  const today = format(new Date(), 'yyyy-MM-dd');

  const rentalsSheet = rentals.map((r) => ({
    'Client First Name': r.client?.firstname ?? '',
    'Client Last Name': r.client?.name ?? '',
    'Email': r.client?.email ?? '',
    'Car': `${r.car?.brand ?? ''} ${r.car?.model ?? ''}`.trim(),
    'Start Date': format(new Date(r.startDate), 'yyyy-MM-dd'),
    'End Date': format(new Date(r.endDate), 'yyyy-MM-dd'),
    'Status': r.status,
    'Total ($)': r.total?.toFixed(2) ?? '0.00',
  }));

  const carsSheet = cars.map((c) => ({
    'Brand': c.brand ?? '',
    'Model': c.model ?? '',
    'Year': c.year ?? '',
    'Fuel': c.fuel ?? '',
    'Gearbox': c.gearBox ?? '',
    'Price ($/day)': c.price ?? 0,
  }));

  const revenueSheet = [
    {
      'Total Cars': stats?.totalCars ?? 0,
      'Available Cars': stats?.availableCars ?? 0,
      'Total Rentals': stats?.totalRentals ?? 0,
      'Active Rentals': stats?.activeRentals ?? 0,
      'Pending Rentals': stats?.pendingRentals ?? 0,
      'Completed Rentals': stats?.completedRentals ?? 0,
      'Total Revenue ($)': stats?.totalRevenue?.toFixed(2) ?? '0.00',
      'Monthly Revenue ($)': stats?.monthlyRevenue?.toFixed(2) ?? '0.00',
    },
  ];

  exportToExcel({
    filename: `bthg-rental-report-${today}`,
    sheets: [
      { name: 'Rentals', data: rentalsSheet.length ? rentalsSheet : [{ Note: 'No rentals data' }] },
      { name: 'Cars Inventory', data: carsSheet.length ? carsSheet : [{ Note: 'No cars data' }] },
      { name: 'Revenue Summary', data: revenueSheet },
    ],
  });
}
