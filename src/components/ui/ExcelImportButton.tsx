'use client';

import { useRef, useState } from 'react';
import {
  Box,
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  Progress,
  useToast,
} from '@chakra-ui/react';
import { FiUpload, FiDownload, FiChevronDown } from 'react-icons/fi';
import * as XLSX from 'xlsx';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import { useQueryClient } from '@tanstack/react-query';
import { carKeys } from '@/hooks/useCars';
import { rentalKeys } from '@/hooks/useRentals';
import { serializeCarImages } from '@/lib/imageUtils';

type ImportType = 'cars' | 'rentals';

interface ExcelImportButtonProps {
  type: ImportType;
}

const CAR_TEMPLATE = [
  {
    brand: 'Toyota',
    model: 'Camry',
    year: 2023,
    mileage: 15000,
    price: 80,
    registration: 'ABC-1234',
    fuel: 'Petrol',
    door: 4,
    gearBox: 'Automatic',
    description: 'Clean well-maintained sedan',
    image: 'https://example.com/car.jpg',
  },
  {
    brand: 'Honda',
    model: 'Civic',
    year: 2022,
    mileage: 22000,
    price: 65,
    registration: 'DEF-5678',
    fuel: 'Petrol',
    door: 4,
    gearBox: 'Manual',
    description: 'Sporty compact',
    image: '',
  },
];

const RENTAL_TEMPLATE = [
  {
    carId: 1,
    startDate: '2024-03-01',
    endDate: '2024-03-05',
    startTime: '09:00',
    endTime: '18:00',
    total: 320,
  },
  {
    carId: 2,
    startDate: '2024-03-10',
    endDate: '2024-03-12',
    startTime: '10:00',
    endTime: '17:00',
    total: 130,
  },
];

function downloadTemplate(type: ImportType) {
  const templateData = type === 'cars' ? CAR_TEMPLATE : RENTAL_TEMPLATE;
  const sheetName = type === 'cars' ? 'Cars' : 'Rentals';
  const filename = type === 'cars' ? 'cars_import_template' : 'rentals_import_template';

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(templateData);
  const firstRow = templateData[0] as Record<string, unknown>;
  ws['!cols'] = Object.keys(firstRow).map((key) => ({
    wch: Math.max(key.length, ...templateData.map((r) => String((r as Record<string, unknown>)[key] ?? '').length)) + 4,
  }));
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function ExcelImportButton({ type }: ExcelImportButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const toast = useToast();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const buffer = new Uint8Array(evt.target?.result as ArrayBuffer);
        const wb = XLSX.read(buffer, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws) as Record<string, unknown>[];

        if (!rows.length) {
          toast({ title: 'Empty file', description: 'The Excel file has no data rows.', status: 'warning', duration: 4000 });
          return;
        }

        setIsImporting(true);
        setProgress({ done: 0, total: rows.length });

        let succeeded = 0;
        let failed = 0;
        const errors: string[] = [];

        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          try {
            if (type === 'cars') {
              const agencyId = user?.agency?.id;
              if (!agencyId) throw new Error('No agency linked to your admin account');

              const imageUrls = row.image ? String(row.image).split(',').map((u) => u.trim()).filter(Boolean) : [];
              const imageSerialized = serializeCarImages(imageUrls);

              await api.cars.create({
                agencyId,
                brand: String(row.brand ?? ''),
                model: String(row.model ?? ''),
                year: Number(row.year ?? 0),
                mileage: Number(row.mileage ?? 0),
                price: Number(row.price ?? 0),
                registration: String(row.registration ?? ''),
                fuel: String(row.fuel ?? ''),
                door: Number(row.door ?? 4),
                gearBox: String(row.gearBox ?? ''),
                description: row.description ? String(row.description) : undefined,
                image: imageSerialized || undefined,
              });
            } else {
              await api.rentals.create({
                carId: Number(row.carId ?? 0),
                startDate: String(row.startDate ?? ''),
                endDate: String(row.endDate ?? ''),
                startTime: String(row.startTime ?? '09:00'),
                endTime: String(row.endTime ?? '18:00'),
                total: row.total ? Number(row.total) : undefined,
              });
            }
            succeeded++;
          } catch (err) {
            failed++;
            errors.push(`Row ${i + 2}: ${err instanceof Error ? err.message : 'Error'}`);
          }
          setProgress({ done: i + 1, total: rows.length });
        }

        if (type === 'cars') {
          queryClient.invalidateQueries({ queryKey: carKeys.lists() });
          queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
        } else {
          queryClient.invalidateQueries({ queryKey: rentalKeys.lists() });
          queryClient.invalidateQueries({ queryKey: ['admin', 'rentals'] });
        }

        if (failed === 0) {
          toast({
            title: 'Import complete',
            description: `${succeeded} ${type} imported successfully.`,
            status: 'success',
            duration: 5000,
          });
        } else {
          toast({
            title: `Import finished with ${failed} error${failed > 1 ? 's' : ''}`,
            description: `${succeeded} imported, ${failed} failed. ${errors.slice(0, 2).join(' | ')}`,
            status: 'warning',
            duration: 8000,
            isClosable: true,
          });
        }
      } catch (err) {
        toast({
          title: 'Import failed',
          description: err instanceof Error ? err.message : 'Could not read the file.',
          status: 'error',
          duration: 5000,
        });
      } finally {
        setIsImporting(false);
        setProgress(null);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <>
      <input
        type="file"
        accept=".xlsx,.xls"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {progress && (
        <Box minW="140px" display="flex" flexDir="column" justifyContent="center">
          <Progress
            value={(progress.done / progress.total) * 100}
            size="xs"
            colorScheme="yellow"
            borderRadius="full"
            mb={1}
          />
          <Text fontSize="2xs" color="gray.400" textAlign="center">
            {progress.done} / {progress.total}
          </Text>
        </Box>
      )}

      <Menu>
        <MenuButton
          as={Button}
          leftIcon={<FiUpload />}
          rightIcon={<FiChevronDown />}
          borderColor="rgba(255,215,0,0.3)"
          color="#000"
          _hover={{ bg: 'brand.200', borderColor: 'brand.400' }}
          size="sm"
          isLoading={isImporting}
          loadingText="Importing..."
          borderRadius="lg"
        >
          Import Excel
        </MenuButton>
        <MenuList bg="#080808" borderColor="rgba(255,215,0,0.1)" minW="180px">
          <MenuItem
            icon={<FiDownload />}
            bg="transparent"
            color="white"
            _hover={{ bg: 'rgba(255,215,0,0.08)' }}
            fontSize="sm"
            onClick={() => downloadTemplate(type)}
          >
            Download Template
          </MenuItem>
          <MenuItem
            icon={<FiUpload />}
            bg="transparent"
            color="white"
            _hover={{ bg: 'rgba(255,215,0,0.08)' }}
            fontSize="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            Upload & Import
          </MenuItem>
        </MenuList>
      </Menu>
    </>
  );
}
