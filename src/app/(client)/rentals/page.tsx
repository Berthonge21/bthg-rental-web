'use client';

import { useState } from 'react';
import NextLink from 'next/link';
import {
  Box, Button, Center, Flex, HStack, Icon, Image, SimpleGrid,
  Spinner, Text, VStack, useColorModeValue, useDisclosure, useToast,
} from '@chakra-ui/react';
import {
  FiCalendar, FiArrowRight, FiSearch, FiClock, FiZap,
  FiCheckCircle, FiXCircle, FiDollarSign, FiTrendingUp, FiX,
} from 'react-icons/fi';
import type { IconType } from 'react-icons';
import { motion } from 'framer-motion';
import { useRentals, useCancelRental } from '@/hooks';
import { ConfirmDialog } from '@/components/ui';
import { RentalStatus } from '@berthonge21/sdk';
import { format, parseISO, isValid } from 'date-fns';
import type { Rental } from '@berthonge21/sdk';
import { parseCarImages } from '@/lib/imageUtils';
import { FadeInOnScroll } from '@/components/ui/FadeInOnScroll';

const MotionBox = motion.create(Box);

const STATUS_META: Record<string, { color: string; bg: string; label: string; icon: IconType }> = {
  reserved:  { color: '#C9A227', bg: 'rgba(201,162,39,0.15)',  label: 'Reserved',  icon: FiClock },
  ongoing:   { color: '#1BC5BD', bg: 'rgba(27,197,189,0.15)',  label: 'Ongoing',   icon: FiZap },
  completed: { color: '#38A169', bg: 'rgba(56,161,105,0.15)',  label: 'Completed', icon: FiCheckCircle },
  cancelled: { color: '#E53E3E', bg: 'rgba(229,62,62,0.15)',   label: 'Cancelled', icon: FiXCircle },
};

function RentalCard({ rental, onCancel }: { rental: Rental; onCancel?: (id: number) => void }) {
  const images = parseCarImages(rental.car?.image);
  const coverImage = images[0] || 'https://via.placeholder.com/400x220?text=Car';
  const meta = STATUS_META[rental.status] ?? STATUS_META.reserved;
  const StatusIcon = meta.icon;

  const days = Math.max(
    1,
    Math.ceil((new Date(rental.endDate).getTime() - new Date(rental.startDate).getTime()) / 86400000)
  );

  const startFmt = isValid(parseISO(rental.startDate)) ? format(parseISO(rental.startDate), 'MMM d') : '—';
  const endFmt   = isValid(parseISO(rental.endDate))   ? format(parseISO(rental.endDate),   'MMM d, yyyy') : '—';

  const cardBg     = useColorModeValue('white', '#080808');
  const cardBorder = useColorModeValue('gray.100', 'rgba(255,215,0,0.08)');
  const specColor  = useColorModeValue('gray.500', 'gray.400');

  return (
    <Box
      bg={cardBg}
      borderRadius="2xl"
      overflow="hidden"
      border="1px"
      borderColor={cardBorder}
      transition="all 0.3s"
      _hover={{ transform: 'translateY(-4px)', boxShadow: '0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,215,0,0.15)' }}
      position="relative"
    >
      <Box position="absolute" left={0} top={0} bottom={0} w="3px" bg="brand.400" zIndex={1} borderLeftRadius="2xl" />
      {/* Cover image */}
      <Box h="220px" bg="navy.800" position="relative" overflow="hidden">
        <Image src={coverImage} alt={`${rental.car?.brand} ${rental.car?.model}`} w="100%" h="100%" objectFit="cover" />
        {/* Gradient fade — image to card */}
        <Box
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          h="80px"
          bgGradient="linear(to-t, #080808, transparent)"
          pointerEvents="none"
        />
        <Box position="absolute" top={3} right={3}>
          <Flex
            bg={meta.bg}
            backdropFilter="blur(8px)"
            borderRadius="full" px={3} py={1}
            align="center" gap={1}
            border={`1px solid ${meta.color}50`}
          >
            <Icon as={StatusIcon} color={meta.color} boxSize={3} />
            <Text fontSize="xs" fontWeight="semibold" color={meta.color}>{meta.label}</Text>
          </Flex>
        </Box>
      </Box>

      {/* Body */}
      <Box p={4}>
        <Text fontFamily="var(--font-display)" fontSize="2xl" letterSpacing="0.02em" lineHeight="1.1" mb={0.5} color={useColorModeValue('navy.800', 'white')}>
          {rental.car?.brand} {rental.car?.model}
        </Text>
        <HStack spacing={3} mb={2} flexWrap="wrap">
          <Text fontSize="xs" color={specColor}>{rental.car?.year}</Text>
          <Text fontSize="xs" color={specColor}>·</Text>
          <HStack spacing={1}>
            <Icon as={FiCalendar} boxSize={3} color={specColor} />
            <Text fontSize="xs" color={specColor}>{startFmt} → {endFmt}</Text>
          </HStack>
          <Text fontSize="xs" color={specColor}>·</Text>
          <HStack spacing={1}>
            <Icon as={FiClock} boxSize={3} color={specColor} />
            <Text fontSize="xs" color={specColor}>{days} day{days !== 1 ? 's' : ''}</Text>
          </HStack>
        </HStack>
        <Flex justify="space-between" align="center" mb={3}>
          <Text fontSize="xs" color={specColor} textTransform="uppercase" letterSpacing="wide">Total</Text>
          <Text fontWeight="bold" fontSize="lg" color="accent.400">${rental.total?.toLocaleString()}</Text>
        </Flex>
        <HStack spacing={2}>
          {rental.status === 'reserved' && onCancel && (
            <Button
              size="sm" variant="outline" colorScheme="red"
              leftIcon={<FiX />} borderRadius="xl" flexShrink={0}
              onClick={() => onCancel(rental.id)}
            >
              Cancel
            </Button>
          )}
          <Button
            as={NextLink} href={`/rentals/${rental.id}`}
            flex={1} size="sm" bg="brand.400" color="#000000"
            borderRadius="xl" rightIcon={<FiArrowRight />}
            _hover={{ bg: 'brand.500' }}
          >
            View Details
          </Button>
        </HStack>
      </Box>
    </Box>
  );
}

export default function RentalsPage() {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [cancelId, setCancelId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const cancelMutation = useCancelRental();

  const { data: activeData,    isLoading: activeLoading }  = useRentals({ status: RentalStatus.RESERVED });
  const { data: ongoingData }                               = useRentals({ status: RentalStatus.ONGOING });
  const { data: historyData,   isLoading: historyLoading }  = useRentals({ status: RentalStatus.COMPLETED });
  const { data: cancelledData }                             = useRentals({ status: RentalStatus.CANCELLED });

  const activeRentals    = [...(activeData?.data ?? []), ...(ongoingData?.data ?? [])];
  const historyRentals   = historyData?.data ?? [];
  const cancelledRentals = cancelledData?.data ?? [];
  const totalSpent       = historyRentals.reduce((sum: number, r: Rental) => sum + (r.total ?? 0), 0);

  const textMuted = useColorModeValue('text.muted', 'gray.400');

  const handleCancelRequest  = (id: number) => { setCancelId(id); onOpen(); };
  const handleConfirmCancel  = async () => {
    if (!cancelId) return;
    try {
      await cancelMutation.mutateAsync(cancelId);
      toast({ title: 'Rental cancelled', status: 'success', duration: 3000 });
    } catch (err) {
      toast({ title: 'Failed to cancel', description: err instanceof Error ? err.message : 'An error occurred', status: 'error', duration: 5000 });
    } finally {
      onClose();
      setCancelId(null);
    }
  };

  return (
    <Box minH="calc(100vh - 80px)">
      {/* Page header */}
      <Box mb={8} position="relative">
        {/* Decorative gold line */}
        <Box w="32px" h="2px" bg="brand.400" mb={3} borderRadius="full" />
        <Text fontSize="xs" fontWeight="bold" color="brand.400" textTransform="uppercase" letterSpacing="widest" mb={1}>
          My Account
        </Text>
        <Text fontFamily="var(--font-display)" fontSize="3xl" fontWeight="black" letterSpacing="0.02em" textTransform="uppercase" color="white">
          My Rentals
        </Text>
        <Text fontSize="sm" color="gray.500" mt={1}>Track and manage your car reservations</Text>
      </Box>

      {/* Stats */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={8}>
        {([
          { icon: FiCalendar,   label: 'Active',      value: String(activeRentals.length),      color: 'brand.400' },
          { icon: FiTrendingUp, label: 'Completed',   value: String(historyRentals.length),     color: 'accent.400' },
          { icon: FiXCircle,    label: 'Cancelled',   value: String(cancelledRentals.length),   color: '#E53E3E' },
          { icon: FiDollarSign, label: 'Total Spent', value: `$${totalSpent.toLocaleString()}`, color: 'accent.400' },
        ] as const).map((s) => (
          <Box
            key={s.label}
            bg="rgba(255,255,255,0.04)"
            backdropFilter="blur(12px)"
            border="1px solid rgba(255,255,255,0.07)"
            borderRadius="2xl" px={5} py={4}
            boxShadow="0 2px 12px rgba(11,28,45,0.06)"
          >
            <HStack spacing={3}>
              <Box w={10} h={10} borderRadius="xl" bg="rgba(201,162,39,0.08)" display="flex" alignItems="center" justifyContent="center">
                <Icon as={s.icon} color={s.color} boxSize={5} />
              </Box>
              <Box>
                <Text fontSize="xs" color={textMuted}>{s.label}</Text>
                <Text fontWeight="bold" fontSize="lg" color={useColorModeValue('navy.800', 'white')}>{s.value}</Text>
              </Box>
            </HStack>
          </Box>
        ))}
      </SimpleGrid>

      {/* Segmented tabs */}
      <Box
        display="flex"
        w={{ base: 'full', md: 'auto' }}
        bg="rgba(255,255,255,0.04)"
        backdropFilter="blur(8px)"
        border="1px solid rgba(255,255,255,0.07)"
        borderRadius="xl" p={1} mb={6}
        boxShadow="0 2px 8px rgba(11,28,45,0.06)"
      >
        {(['active', 'history'] as const).map((tab) => (
          <Button
            key={tab} size="sm" borderRadius="lg" px={6} flex={1}
            bg={activeTab === tab ? 'brand.400' : 'transparent'}
            color={activeTab === tab ? 'white' : 'gray.500'}
            fontWeight={activeTab === tab ? 'semibold' : 'medium'}
            _hover={{ bg: activeTab === tab ? 'brand.500' : 'rgba(255,255,255,0.08)' }}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'active' ? `Active (${activeRentals.length})` : `History (${historyRentals.length})`}
          </Button>
        ))}
      </Box>

      {/* Active */}
      {activeTab === 'active' && (
        activeLoading ? (
          <Center py={16}><Spinner size="lg" color="brand.400" thickness="3px" /></Center>
        ) : activeRentals.length === 0 ? (
          <Center py={20}>
            <VStack spacing={4}>
              <Box w={20} h={20} borderRadius="full" bg="rgba(201,162,39,0.08)" display="flex" alignItems="center" justifyContent="center">
                <Icon as={FiSearch} boxSize={8} color="brand.400" />
              </Box>
              <VStack spacing={1}>
                <Text fontWeight="semibold" color={useColorModeValue('navy.800', 'white')}>No active rentals</Text>
                <Text fontSize="sm" color={textMuted}>Browse our fleet and book your next ride</Text>
              </VStack>
              <Button as={NextLink} href="/cars" bg="brand.400" color="white" borderRadius="lg" _hover={{ bg: 'brand.500' }}>
                Browse Cars
              </Button>
            </VStack>
          </Center>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={5}>
            {activeRentals.map((r, i: number) => (
              <FadeInOnScroll key={r.id} delay={Math.min(i, 4) * 0.07} direction="up">
                <RentalCard rental={r} onCancel={handleCancelRequest} />
              </FadeInOnScroll>
            ))}
          </SimpleGrid>
        )
      )}

      {/* History */}
      {activeTab === 'history' && (
        historyLoading ? (
          <Center py={16}><Spinner size="lg" color="brand.400" thickness="3px" /></Center>
        ) : historyRentals.length === 0 ? (
          <Center py={20}>
            <VStack spacing={4}>
              <Box w={20} h={20} borderRadius="full" bg="rgba(27,197,189,0.08)" display="flex" alignItems="center" justifyContent="center">
                <Icon as={FiCalendar} boxSize={8} color="accent.400" />
              </Box>
              <VStack spacing={1}>
                <Text fontWeight="semibold" color={useColorModeValue('navy.800', 'white')}>No rental history yet</Text>
                <Text fontSize="sm" color={textMuted}>Your completed rentals will appear here</Text>
              </VStack>
            </VStack>
          </Center>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={5}>
            {historyRentals.map((r: Rental, i: number) => (
              <FadeInOnScroll key={r.id} delay={Math.min(i, 4) * 0.07} direction="up">
                <RentalCard rental={r} />
              </FadeInOnScroll>
            ))}
          </SimpleGrid>
        )
      )}

      <ConfirmDialog
        isOpen={isOpen} onClose={onClose} onConfirm={handleConfirmCancel}
        title="Cancel Rental"
        message="Are you sure you want to cancel this reservation? This action cannot be undone."
        confirmText="Cancel Booking"
        isLoading={cancelMutation.isPending}
        colorScheme="red"
      />
    </Box>
  );
}
