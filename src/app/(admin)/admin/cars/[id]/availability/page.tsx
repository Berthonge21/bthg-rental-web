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
  Flex,
  Tooltip,
  Alert,
  AlertIcon,
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
  isAfter,
  startOfDay,
  addMonths,
  subMonths,
  getDay,
  isSameDay,
} from 'date-fns';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CarAvailabilityPage() {
  const router = useRouter();
  const params = useParams();
  const toast = useToast();
  const carId = Number(params.id);

  const [currentDate, setCurrentDate] = useState(new Date());
  // Range selection: startDate and endDate
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

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
  const rangeBg = useColorModeValue('brand.50', 'brand.900');
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

  // Get selected dates as array (all dates in the range)
  const selectedDates = useMemo(() => {
    if (!rangeStart) return [];

    const end = rangeEnd || rangeStart;
    const start = isBefore(rangeStart, end) ? rangeStart : end;
    const endDate = isAfter(rangeStart, end) ? rangeStart : end;

    return eachDayOfInterval({ start, end: endDate }).map(d => format(d, 'yyyy-MM-dd'));
  }, [rangeStart, rangeEnd]);

  // Check if a date is in the selection range (including hover preview)
  const isInRange = (date: Date) => {
    if (!rangeStart) return false;

    const end = rangeEnd || hoverDate || rangeStart;
    const start = isBefore(rangeStart, end) ? rangeStart : end;
    const endDate = isAfter(rangeStart, end) ? rangeStart : end;

    return !isBefore(date, start) && !isAfter(date, endDate);
  };

  const isRangeStart = (date: Date) => rangeStart && isSameDay(date, rangeStart);
  const isRangeEnd = (date: Date) => rangeEnd && isSameDay(date, rangeEnd);

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

    // Range selection logic
    if (!rangeStart || rangeEnd) {
      // Start new selection
      setRangeStart(date);
      setRangeEnd(null);
    } else {
      // Complete the range
      if (isBefore(date, rangeStart)) {
        // If clicked date is before start, swap them
        setRangeEnd(rangeStart);
        setRangeStart(date);
      } else {
        setRangeEnd(date);
      }
    }
  };

  const handleDateHover = (date: Date | null) => {
    if (rangeStart && !rangeEnd) {
      setHoverDate(date);
    }
  };

  const clearSelection = () => {
    setRangeStart(null);
    setRangeEnd(null);
    setHoverDate(null);
  };

  const handleBlockSelected = async () => {
    const datesToBlock = selectedDates.filter(
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
      clearSelection();
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
    const datesToUnblock = selectedDates.filter(
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
      clearSelection();
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
          {/* Instructions */}
          <Alert status="info" mb={4} borderRadius="md">
            <AlertIcon />
            <Text fontSize="sm">
              <strong>Range Selection:</strong> Click a start date, then click an end date to select the entire range.
              All dates in between will be automatically included.
            </Text>
          </Alert>

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
              const isPast = isBefore(day, startOfDay(new Date()));
              const isCurrentMonth = isSameMonth(day, currentDate);
              const inRange = isInRange(day);
              const isStart = isRangeStart(day);
              const isEnd = isRangeEnd(day);

              let bgColor = 'transparent';
              let cursor = 'pointer';
              let borderRadius = 'md';

              if (isPast) {
                bgColor = pastBg;
                cursor = 'not-allowed';
              } else if (status === 'rental') {
                bgColor = rentalBg;
                cursor = 'not-allowed';
              } else if (status === 'blocked') {
                bgColor = blockedBg;
              } else if (isStart || isEnd) {
                bgColor = selectedBg;
                borderRadius = isStart ? 'md 0 0 md' : '0 md md 0';
                if (isStart && isEnd) borderRadius = 'md';
              } else if (inRange) {
                bgColor = rangeBg;
                borderRadius = '0';
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
                      : rangeStart && !rangeEnd
                      ? 'Click to complete range'
                      : 'Click to start selection'
                  }
                  hasArrow
                >
                  <Box
                    h="60px"
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    borderRadius={borderRadius}
                    bg={bgColor}
                    opacity={isCurrentMonth ? 1 : 0.5}
                    cursor={cursor}
                    border={(isStart || isEnd) ? '2px solid' : '1px solid'}
                    borderColor={(isStart || isEnd) ? 'brand.500' : 'gray.200'}
                    onClick={() => !isPast && handleDateClick(day)}
                    onMouseEnter={() => handleDateHover(day)}
                    onMouseLeave={() => handleDateHover(null)}
                    _hover={
                      !isPast && status !== 'rental'
                        ? { borderColor: 'brand.400' }
                        : undefined
                    }
                    transition="all 0.2s"
                  >
                    <Text
                      fontWeight={isToday(day) || isStart || isEnd ? 'bold' : 'normal'}
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
          {/* Selection Info */}
          {rangeStart && (
            <Box bg={cardBg} p={6} borderRadius="xl" boxShadow="sm">
              <Heading size="md" mb={4}>
                Selection
              </Heading>
              <VStack align="stretch" spacing={2}>
                <HStack justify="space-between">
                  <Text color="gray.500">Start Date</Text>
                  <Text fontWeight="bold">{format(rangeStart, 'MMM d, yyyy')}</Text>
                </HStack>
                {rangeEnd && (
                  <>
                    <HStack justify="space-between">
                      <Text color="gray.500">End Date</Text>
                      <Text fontWeight="bold">{format(rangeEnd, 'MMM d, yyyy')}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text color="gray.500">Total Days</Text>
                      <Badge colorScheme="brand" fontSize="md" px={2}>
                        {selectedDates.length}
                      </Badge>
                    </HStack>
                  </>
                )}
                {!rangeEnd && (
                  <Text fontSize="sm" color="orange.500">
                    Click another date to complete the range
                  </Text>
                )}
              </VStack>
            </Box>
          )}

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
                <Text fontSize="sm">Range Start/End</Text>
              </HStack>
              <HStack>
                <Box w={4} h={4} bg={rangeBg} borderRadius="sm" />
                <Text fontSize="sm">In Range</Text>
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
              Select a date range on the calendar, then use the buttons below to block or unblock them.
            </Text>
            <VStack spacing={3}>
              <Button
                w="full"
                colorScheme="red"
                onClick={handleBlockSelected}
                isLoading={blockMutation.isPending}
                isDisabled={selectedDates.length === 0 || !rangeEnd}
              >
                Block Range ({selectedDates.length} days)
              </Button>
              <Button
                w="full"
                colorScheme="green"
                variant="outline"
                onClick={handleUnblockSelected}
                isLoading={unblockMutation.isPending}
                isDisabled={selectedDates.length === 0 || !rangeEnd}
              >
                Unblock Range
              </Button>
              <Button
                w="full"
                variant="ghost"
                onClick={clearSelection}
                isDisabled={!rangeStart}
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
