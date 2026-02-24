'use client';

import { useState, useCallback } from 'react';
import NextLink from 'next/link';
import {
  Box,
  SimpleGrid,
  Heading,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  HStack,
  VStack,
  Icon,
  Image,
  Button,
  Flex,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  useColorModeValue,
  Skeleton,
  Avatar,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  IconButton,
  Divider,
} from '@chakra-ui/react';
import { FiSearch, FiFilter, FiArrowRight, FiX } from 'react-icons/fi';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useCars, useAgencies } from '@/hooks';
import { parseCarImages } from '@/lib/imageUtils';
import { FadeInOnScroll } from '@/components/ui/FadeInOnScroll';
import type { Car } from '@berthonge21/sdk';

const MotionBox = motion.create(Box);

const FUEL_OPTIONS = ['All', 'Petrol', 'Diesel', 'Electric', 'Hybrid'];
const GEARBOX_OPTIONS = ['All', 'Automatic', 'Manual'];

function TiltCard({ children }: { children: React.ReactNode }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [6, -6]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), { stiffness: 200, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <MotionBox
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      transition={{ type: 'spring', stiffness: 200, damping: 20 } as never}
    >
      {children}
    </MotionBox>
  );
}

function CarCard({ car }: { car: Car }) {
  const cardBg = useColorModeValue('white', 'navy.700');
  const cardBorder = useColorModeValue('gray.100', 'navy.600');
  const specColor = useColorModeValue('text.muted', 'gray.400');

  const firstImage = parseCarImages(car.image)[0];

  return (
    <Box
      bg={cardBg}
      borderRadius="2xl"
      overflow="hidden"
      border="1px"
      borderColor={cardBorder}
      transition="all 0.3s"
      _hover={{ transform: 'translateY(-4px)', boxShadow: 'lg' }}
      position="relative"
    >
      {/* Gold accent bar — left edge */}
      <Box position="absolute" left={0} top={0} bottom={0} w="3px" bg="brand.400" zIndex={1} borderLeftRadius="2xl" />
      {/* Image */}
      <Box h="220px" bg="navy.800" position="relative" overflow="hidden">
        <Image
          src={firstImage || 'https://via.placeholder.com/400x220?text=No+Image'}
          alt={`${car.brand} ${car.model}`}
          w="100%"
          h="100%"
          objectFit="cover"
        />
        <Box position="absolute" top={0} right={0}>
          <Box bg="brand.400" px={3} py={1.5} borderBottomLeftRadius="lg" fontFamily="var(--font-display)" fontSize="xl" color="white" letterSpacing="0.04em" lineHeight="1">
            ${car.price}<Text as="span" fontSize="xs" fontWeight="normal" letterSpacing="normal">/day</Text>
          </Box>
        </Box>
      </Box>

      {/* Body */}
      <Box p={4}>
        <Text fontFamily="var(--font-display)" fontSize="2xl" letterSpacing="0.02em" color={useColorModeValue('navy.800', 'white')} mb={0.5} lineHeight="1.1">
          {car.brand} {car.model}
        </Text>
        <HStack spacing={3} mb={2} flexWrap="wrap">
          <Text fontSize="xs" color={specColor}>{car.year}</Text>
          <Text fontSize="xs" color={specColor}>·</Text>
          <Text fontSize="xs" color={specColor}>{car.fuel}</Text>
          <Text fontSize="xs" color={specColor}>·</Text>
          <Text fontSize="xs" color={specColor}>{car.gearBox}</Text>
          <Text fontSize="xs" color={specColor}>·</Text>
          <Text fontSize="xs" color={specColor}>{car.door} doors</Text>
        </HStack>
        {car.Agency && (
          <HStack spacing={2} mb={3}>
            <Avatar size="xs" name={car.Agency.name} bg="brand.400" color="white" />
            <Text fontSize="xs" color={specColor}>{car.Agency.name}</Text>
          </HStack>
        )}
        <Button
          as={NextLink}
          href={`/cars/${car.id}`}
          w="full"
          bg="brand.400"
          color="white"
          _hover={{ bg: 'brand.500' }}
          borderRadius="xl"
          size="sm"
          rightIcon={<FiArrowRight />}
        >
          View & Book
        </Button>
      </Box>
    </Box>
  );
}

function CarCardSkeleton() {
  return (
    <Box borderRadius="2xl" overflow="hidden" border="1px" borderColor="gray.100">
      <Skeleton h="220px" />
      <Box p={4}>
        <Skeleton h="20px" mb={2} />
        <Skeleton h="14px" mb={3} w="60%" />
        <Skeleton h="32px" borderRadius="xl" />
      </Box>
    </Box>
  );
}

function FilterPanel({
  agencies,
  agencyId,
  fuel,
  gearBox,
  priceRange,
  onAgencyChange,
  onFuelChange,
  onGearBoxChange,
  onPriceChange,
  onClear,
}: {
  agencies: { id: number; name: string }[];
  agencyId: number | undefined;
  fuel: string;
  gearBox: string;
  priceRange: [number, number];
  onAgencyChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onFuelChange: (val: string) => void;
  onGearBoxChange: (val: string) => void;
  onPriceChange: (val: [number, number]) => void;
  onClear: () => void;
}) {
  const textMuted = useColorModeValue('text.muted', 'gray.400');

  return (
    <VStack spacing={5} align="stretch">
      <Box>
        <Text fontSize="xs" fontWeight="semibold" color={textMuted} mb={2} textTransform="uppercase" letterSpacing="wider">
          Agency
        </Text>
        <Select size="sm" borderRadius="lg" onChange={onAgencyChange} value={agencyId ?? ''}>
          <option value="">All Agencies</option>
          {agencies.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </Select>
      </Box>

      <Box>
        <Text fontSize="xs" fontWeight="semibold" color={textMuted} mb={2} textTransform="uppercase" letterSpacing="wider">
          Fuel Type
        </Text>
        <Select size="sm" borderRadius="lg" value={fuel} onChange={(e) => onFuelChange(e.target.value)}>
          {FUEL_OPTIONS.map((f) => <option key={f}>{f}</option>)}
        </Select>
      </Box>

      <Box>
        <Text fontSize="xs" fontWeight="semibold" color={textMuted} mb={2} textTransform="uppercase" letterSpacing="wider">
          Transmission
        </Text>
        <Select size="sm" borderRadius="lg" value={gearBox} onChange={(e) => onGearBoxChange(e.target.value)}>
          {GEARBOX_OPTIONS.map((g) => <option key={g}>{g}</option>)}
        </Select>
      </Box>

      <Box>
        <Flex justify="space-between" mb={2}>
          <Text fontSize="xs" fontWeight="semibold" color={textMuted} textTransform="uppercase" letterSpacing="wider">
            Price / day
          </Text>
          <Text fontSize="xs" color="accent.400" fontWeight="semibold">
            ${priceRange[0]} – ${priceRange[1]}
          </Text>
        </Flex>
        <RangeSlider
          min={0} max={1000} step={10}
          value={priceRange}
          onChange={(val) => onPriceChange(val as [number, number])}
        >
          <RangeSliderTrack><RangeSliderFilledTrack bg="accent.400" /></RangeSliderTrack>
          <RangeSliderThumb index={0} />
          <RangeSliderThumb index={1} />
        </RangeSlider>
      </Box>

      <Button size="sm" variant="outline" colorScheme="gray" borderRadius="lg" onClick={onClear}>
        Clear Filters
      </Button>
    </VStack>
  );
}

export default function CarsPage() {
  const [search, setSearch] = useState('');
  const [agencyId, setAgencyId] = useState<number | undefined>();
  const [fuel, setFuel] = useState('All');
  const [gearBox, setGearBox] = useState('All');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [page, setPage] = useState(1);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const { data, isLoading } = useCars({ page, limit: 12, agencyId });
  const { data: agenciesData } = useAgencies({ limit: 100 });

  const filterBg = useColorModeValue('white', 'navy.700');
  const filterBorder = useColorModeValue('gray.100', 'navy.600');
  const textMuted = useColorModeValue('text.muted', 'gray.400');

  const allCars = data?.data ?? [];
  const agencies = agenciesData?.data ?? [];

  // Client-side filtering for fuel/gearbox/price/search
  const filtered = allCars.filter((car: Car) => {
    const q = search.toLowerCase();
    const matchSearch = !q || `${car.brand} ${car.model}`.toLowerCase().includes(q);
    const matchFuel = fuel === 'All' || car.fuel?.toLowerCase() === fuel.toLowerCase();
    const matchGear = gearBox === 'All' || car.gearBox?.toLowerCase() === gearBox.toLowerCase();
    const matchPrice = car.price >= priceRange[0] && car.price <= priceRange[1];
    return matchSearch && matchFuel && matchGear && matchPrice;
  });

  const totalPages = data?.meta?.totalPages ?? 1;

  const handleAgencyChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setAgencyId(val ? Number(val) : undefined);
    setPage(1);
  }, []);

  return (
    <Box>
      <VStack align="start" spacing={1} mb={6}>
        <Heading size="lg">
          <Text as="span" color="accent.400">Available</Text>{' '}Cars
        </Heading>
        <Text color={textMuted} fontSize="sm">
          {data?.meta?.total ?? 0} vehicles available across all agencies
        </Text>
      </VStack>

      <Flex gap={6} align="flex-start">
        {/* Desktop sidebar */}
        <Box
          w={{ base: 'full', lg: '260px' }}
          flexShrink={0}
          bg={filterBg}
          border="1px"
          borderColor={filterBorder}
          borderRadius="2xl"
          p={5}
          display={{ base: 'none', lg: 'block' }}
          position="sticky"
          top="100px"
        >
          <Flex align="center" gap={2} mb={5}>
            <Icon as={FiFilter} color="brand.400" />
            <Text fontWeight="semibold">Filters</Text>
          </Flex>
          <FilterPanel
            agencies={agencies}
            agencyId={agencyId}
            fuel={fuel}
            gearBox={gearBox}
            priceRange={priceRange}
            onAgencyChange={handleAgencyChange}
            onFuelChange={setFuel}
            onGearBoxChange={setGearBox}
            onPriceChange={setPriceRange}
            onClear={() => { setSearch(''); setAgencyId(undefined); setFuel('All'); setGearBox('All'); setPriceRange([0, 1000]); setPage(1); }}
          />
        </Box>

        {/* Main content */}
        <Box flex="1" minW={0}>
          {/* Mobile filter button */}
          <Button
            display={{ base: 'flex', lg: 'none' }}
            leftIcon={<FiFilter />}
            variant="outline"
            borderRadius="xl"
            mb={4}
            w="full"
            onClick={() => setFilterDrawerOpen(true)}
            borderColor={filterBorder}
          >
            Filters {(fuel !== 'All' || gearBox !== 'All' || agencyId !== undefined || priceRange[0] > 0 || priceRange[1] < 1000) && '·  Active'}
          </Button>

          {/* Search bar */}
          <InputGroup mb={6}>
            <InputLeftElement pointerEvents="none" h="full">
              <Icon as={FiSearch} color={textMuted} />
            </InputLeftElement>
            <Input
              placeholder="Search by brand or model..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              borderRadius="xl"
              h={12}
              pl={10}
              bg={filterBg}
            />
          </InputGroup>

          {isLoading ? (
            <SimpleGrid columns={{ base: 1, sm: 2, xl: 3 }} spacing={5}>
              {Array.from({ length: 6 }).map((_, i) => <CarCardSkeleton key={i} />)}
            </SimpleGrid>
          ) : filtered.length === 0 ? (
            <Box textAlign="center" py={20}>
              <Text fontSize="xl" mb={2}>No cars found</Text>
              <Text color={textMuted}>Try adjusting your filters</Text>
            </Box>
          ) : (
            <SimpleGrid columns={{ base: 1, sm: 2, xl: 3 }} spacing={5}>
              {filtered.map((car: Car, index: number) => (
                <FadeInOnScroll key={car.id} delay={Math.min(index % 3, 2) * 0.08} direction="up">
                  <TiltCard>
                    <CarCard car={car} />
                  </TiltCard>
                </FadeInOnScroll>
              ))}
            </SimpleGrid>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <HStack justify="center" mt={8} spacing={2}>
              <Button size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} isDisabled={page === 1} variant="outline">
                Previous
              </Button>
              <Text fontSize="sm" color={textMuted}>Page {page} of {totalPages}</Text>
              <Button size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} isDisabled={page === totalPages} variant="outline">
                Next
              </Button>
            </HStack>
          )}
        </Box>
      </Flex>

      {/* Mobile filter drawer */}
      <Drawer isOpen={filterDrawerOpen} placement="left" onClose={() => setFilterDrawerOpen(false)} size="xs">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">
            <Flex align="center" gap={2}>
              <Icon as={FiFilter} color="brand.400" />
              <Text fontWeight="semibold">Filters</Text>
            </Flex>
          </DrawerHeader>
          <DrawerCloseButton />
          <DrawerBody py={5}>
            <FilterPanel
              agencies={agencies}
              agencyId={agencyId}
              fuel={fuel}
              gearBox={gearBox}
              priceRange={priceRange}
              onAgencyChange={handleAgencyChange}
              onFuelChange={setFuel}
              onGearBoxChange={setGearBox}
              onPriceChange={setPriceRange}
              onClear={() => { setSearch(''); setAgencyId(undefined); setFuel('All'); setGearBox('All'); setPriceRange([0, 1000]); setPage(1); setFilterDrawerOpen(false); }}
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}
