'use client';

import { useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Heading,
  Button,
  HStack,
  VStack,
  Text,
  SimpleGrid,
  Badge,
  useColorModeValue,
  useToast,
  IconButton,
  Select,
  Flex,
  Tooltip,
} from '@chakra-ui/react';
import { FiArrowLeft, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { LoadingSpinner } from '@/components/ui';
import { useCar, useCarAvailabilityCalendar, useBlockDates, useUnblockDates } from '@/hooks';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isBefore,
  startOfDay,
  addMonths,
  subMonths,
  getDay,
} from 'date-fns';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CarAvailabilityPage() {
  const router = useRouter();
  const params = useParams();
  const toast = useToast();
  const carId = Number(params.id);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const { data: car, isLoading: carLoading } = useCar(carId);
  const { data: calendar, isLoading: calendarLoading, refetch } = useCarAvailabilityCalendar(
    carId,
    year,
    month
  );

  const blockMutation = useBlockDates();
  const unblockMutation = useUnblockDates();

  const cardBg = useColorModeValue('white', 'gray.800');
  const todayBg = useColorModeValue('blue.50', 'blue.900');
  const selectedBg = useColorModeValue('brand.100', 'brand.800');
  const blockedBg = useColorModeValue('red.100', 'red.900');
  const rentalBg = useColorModeValue('yellow.100', 'yellow.900');
  const pastBg = useColorModeValue('gray.100', 'gray.700');

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Add padding for first week
    const startPadding = getDay(monthStart);
    const paddedDays: (Date | null)[] = Array(startPadding).fill(null);

    return [...paddedDays, ...days];
  }, [currentDate]);

  // Build a map of blocked and rental dates
  const dateStatusMap = useMemo(() => {
    const map = new Map<string, 'blocked' | 'rental'>();

    if (calendar) {
      // Mark manually blocked dates
      calendar.blockedDates.forEach((bd) => {
        const dateStr = format(new Date(bd.date), 'yyyy-MM-dd');
        map.set(dateStr, 'blocked');
      });

      // Mark rental dates
      calendar.rentals.forEach((rental) => {
        const start = new Date(rental.startDate);
        const end = new Date(rental.endDate);
        const days = eachDayOfInterval({ start, end });
        days.forEach((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          if (!map.has(dateStr)) {
            map.set(dateStr, 'rental');
          }
        });
      });
    }

    return map;
  }, [calendar]);

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const handleDateClick = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const status = dateStatusMap.get(dateStr);

    // Can't select rental dates
    if (status === 'rental') {
      toast({
        title: 'Cannot modify',
        description: 'This date has an active rental',
        status: 'warning',
        duration: 2000,
      });
      return;
    }

    // Can't select past dates
    if (isBefore(date, startOfDay(new Date()))) {
      return;
    }

    const newSelected = new Set(selectedDates);
    if (newSelected.has(dateStr)) {
      newSelected.delete(dateStr);
    } else {
      newSelected.add(dateStr);
    }
    setSelectedDates(newSelected);
  };

  const handleBlockSelected = async () => {
    const datesToBlock = Array.from(selectedDates).filter(
      (d) => !dateStatusMap.has(d)
    );

    if (datesToBlock.length === 0) {
      toast({
        title: 'No dates to block',
        description: 'Selected dates are already blocked or have rentals',
        status: 'info',
        duration: 2000,
      });
      return;
    }

    try {
      await blockMutation.mutateAsync({ carId, dates: datesToBlock });
      toast({
        title: 'Dates blocked',
        description: `${datesToBlock.length} date(s) blocked successfully`,
        status: 'success',
        duration: 2000,
      });
      setSelectedDates(new Set());
      refetch();
    } catch (error) {
      toast({
        title: 'Failed to block dates',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleUnblockSelected = async () => {
    const datesToUnblock = Array.from(selectedDates).filter(
      (d) => dateStatusMap.get(d) === 'blocked'
    );

    if (datesToUnblock.length === 0) {
      toast({
        title: 'No dates to unblock',
        description: 'Selected dates are not blocked',
        status: 'info',
        duration: 2000,
      });
      return;
    }

    try {
      await unblockMutation.mutateAsync({ carId, dates: datesToUnblock });
      toast({
        title: 'Dates unblocked',
        description: `${datesToUnblock.length} date(s) unblocked successfully`,
        status: 'success',
        duration: 2000,
      });
      setSelectedDates(new Set());
      refetch();
    } catch (error) {
      toast({
        title: 'Failed to unblock dates',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
      });
    }
  };

  if (carLoading || calendarLoading) {
    return <LoadingSpinner text="Loading availability..." />;
  }

  if (!car) {
    return (
      <Box textAlign="center" py={10}>
        <Text>Car not found</Text>
        <Button mt={4} onClick={() => router.back()}>
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <HStack>
          <Button
            variant="ghost"
            leftIcon={<FiArrowLeft />}
            onClick={() => router.push(`/admin/cars/${carId}`)}
          >
            Back to Car
          </Button>
          <Heading size="lg">
            Availability: {car.brand} {car.model}
          </Heading>
        </HStack>
      </HStack>

      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
        {/* Calendar */}
        <Box bg={cardBg} p={6} borderRadius="xl" boxShadow="sm" gridColumn={{ lg: 'span 2' }}>
          {/* Month Navigation */}
          <Flex justify="space-between" align="center" mb={4}>
            <IconButton
              aria-label="Previous month"
              icon={<FiChevronLeft />}
              onClick={handlePrevMonth}
              variant="ghost"
            />
            <Heading size="md">
              {format(currentDate, 'MMMM yyyy')}
            </Heading>
            <IconButton
              aria-label="Next month"
              icon={<FiChevronRight />}
              onClick={handleNextMonth}
              variant="ghost"
            />
          </Flex>

          {/* Weekday Headers */}
          <SimpleGrid columns={7} spacing={1} mb={2}>
            {WEEKDAYS.map((day) => (
              <Box key={day} textAlign="center" fontWeight="bold" fontSize="sm" py={2}>
                {day}
              </Box>
            ))}
          </SimpleGrid>

          {/* Calendar Grid */}
          <SimpleGrid columns={7} spacing={1}>
            {calendarDays.map((day, index) => {
              if (!day) {
                return <Box key={`empty-${index}`} h="60px" />;
              }

              const dateStr = format(day, 'yyyy-MM-dd');
              const status = dateStatusMap.get(dateStr);
              const isSelected = selectedDates.has(dateStr);
              const isPast = isBefore(day, startOfDay(new Date()));
              const isCurrentMonth = isSameMonth(day, currentDate);

              let bgColor = 'transparent';
              let cursor = 'pointer';

              if (isPast) {
                bgColor = pastBg;
                cursor = 'not-allowed';
              } else if (status === 'rental') {
                bgColor = rentalBg;
                cursor = 'not-allowed';
              } else if (status === 'blocked') {
                bgColor = blockedBg;
              } else if (isSelected) {
                bgColor = selectedBg;
              } else if (isToday(day)) {
                bgColor = todayBg;
              }

              return (
                <Tooltip
                  key={dateStr}
                  label={
                    status === 'rental'
                      ? 'Rental booked'
                      : status === 'blocked'
                      ? 'Manually blocked'
                      : isPast
                      ? 'Past date'
                      : 'Available'
                  }
                  hasArrow
                >
                  <Box
                    h="60px"
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    borderRadius="md"
                    bg={bgColor}
                    opacity={isCurrentMonth ? 1 : 0.5}
                    cursor={cursor}
                    border={isSelected ? '2px solid' : '1px solid'}
                    borderColor={isSelected ? 'brand.500' : 'gray.200'}
                    onClick={() => !isPast && handleDateClick(day)}
                    _hover={
                      !isPast && status !== 'rental'
                        ? { borderColor: 'brand.400' }
                        : undefined
                    }
                    transition="all 0.2s"
                  >
                    <Text
                      fontWeight={isToday(day) ? 'bold' : 'normal'}
                      color={isToday(day) ? 'blue.600' : undefined}
                    >
                      {format(day, 'd')}
                    </Text>
                    {status && (
                      <Badge
                        size="xs"
                        colorScheme={status === 'rental' ? 'yellow' : 'red'}
                        fontSize="8px"
                      >
                        {status === 'rental' ? 'Booked' : 'Blocked'}
                      </Badge>
                    )}
                  </Box>
                </Tooltip>
              );
            })}
          </SimpleGrid>
        </Box>

        {/* Stats & Actions */}
        <VStack spacing={6} align="stretch">
          {/* Stats */}
          <Box bg={cardBg} p={6} borderRadius="xl" boxShadow="sm">
            <Heading size="md" mb={4}>
              Statistics
            </Heading>
            {calendar && (
              <VStack align="stretch" spacing={3}>
                <HStack justify="space-between">
                  <Text color="gray.500">Total Days</Text>
                  <Text fontWeight="bold">{calendar.stats.totalDays}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text color="green.500">Available</Text>
                  <Text fontWeight="bold" color="green.500">
                    {calendar.stats.availableDays}
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text color="yellow.500">Rental Blocked</Text>
                  <Text fontWeight="bold" color="yellow.500">
                    {calendar.stats.rentalBlockedDays}
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text color="red.500">Manually Blocked</Text>
                  <Text fontWeight="bold" color="red.500">
                    {calendar.stats.manuallyBlockedDays}
                  </Text>
                </HStack>
              </VStack>
            )}
          </Box>

          {/* Legend */}
          <Box bg={cardBg} p={6} borderRadius="xl" boxShadow="sm">
            <Heading size="md" mb={4}>
              Legend
            </Heading>
            <VStack align="stretch" spacing={2}>
              <HStack>
                <Box w={4} h={4} bg={todayBg} borderRadius="sm" />
                <Text fontSize="sm">Today</Text>
              </HStack>
              <HStack>
                <Box w={4} h={4} bg={selectedBg} borderRadius="sm" border="2px solid" borderColor="brand.500" />
                <Text fontSize="sm">Selected</Text>
              </HStack>
              <HStack>
                <Box w={4} h={4} bg={rentalBg} borderRadius="sm" />
                <Text fontSize="sm">Booked (Rental)</Text>
              </HStack>
              <HStack>
                <Box w={4} h={4} bg={blockedBg} borderRadius="sm" />
                <Text fontSize="sm">Manually Blocked</Text>
              </HStack>
              <HStack>
                <Box w={4} h={4} bg={pastBg} borderRadius="sm" />
                <Text fontSize="sm">Past Date</Text>
              </HStack>
            </VStack>
          </Box>

          {/* Actions */}
          <Box bg={cardBg} p={6} borderRadius="xl" boxShadow="sm">
            <Heading size="md" mb={4}>
              Actions
            </Heading>
            <Text fontSize="sm" color="gray.500" mb={4}>
              Select dates on the calendar, then use the buttons below to block or unblock them.
            </Text>
            <VStack spacing={3}>
              <Button
                w="full"
                colorScheme="red"
                onClick={handleBlockSelected}
                isLoading={blockMutation.isPending}
                isDisabled={selectedDates.size === 0}
              >
                Block Selected ({selectedDates.size})
              </Button>
              <Button
                w="full"
                colorScheme="green"
                variant="outline"
                onClick={handleUnblockSelected}
                isLoading={unblockMutation.isPending}
                isDisabled={selectedDates.size === 0}
              >
                Unblock Selected
              </Button>
              <Button
                w="full"
                variant="ghost"
                onClick={() => setSelectedDates(new Set())}
                isDisabled={selectedDates.size === 0}
              >
                Clear Selection
              </Button>
            </VStack>
          </Box>
        </VStack>
      </SimpleGrid>
    </Box>
  );
}
