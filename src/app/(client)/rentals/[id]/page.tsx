'use client';

import { useParams, useRouter } from 'next/navigation';
import {
  Box, Button, Center, Divider, Flex, Grid, GridItem, HStack,
  Icon, Image, Spinner, Text, VStack,
  useColorModeValue, useDisclosure, useToast,
} from '@chakra-ui/react';
import {
  FiArrowLeft, FiCalendar, FiClock, FiDollarSign, FiX,
  FiCheckCircle, FiZap, FiXCircle,
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useRental, useCancelRental } from '@/hooks';
import { ConfirmDialog } from '@/components/ui';
import { format, parseISO, isValid } from 'date-fns';
import { parseCarImages } from '@/lib/imageUtils';

const MotionBox = motion.create(Box);

const STATUS_META: Record<string, { color: string; bg: string; label: string }> = {
  reserved:  { color: '#C9A227', bg: 'rgba(201,162,39,0.15)',  label: 'Reserved' },
  ongoing:   { color: '#1BC5BD', bg: 'rgba(27,197,189,0.15)',  label: 'Ongoing'  },
  completed: { color: '#38A169', bg: 'rgba(56,161,105,0.15)',  label: 'Completed'},
  cancelled: { color: '#E53E3E', bg: 'rgba(229,62,62,0.15)',   label: 'Cancelled'},
};

const TIMELINE_STEPS = [
  { key: 'reserved',  label: 'Reserved',  icon: FiClock },
  { key: 'ongoing',   label: 'Picked up', icon: FiZap },
  { key: 'completed', label: 'Completed', icon: FiCheckCircle },
];

function safeTime(raw: string | undefined): string {
  if (!raw) return '—';
  try {
    const d = parseISO(raw);
    if (isValid(d)) return format(d, 'h:mm a');
  } catch { /* ignore */ }
  // fallback for plain HH:mm strings
  return raw.length <= 8 ? raw : '—';
}

function safeDate(raw: string | undefined, fmt: string): string {
  if (!raw) return '—';
  const d = parseISO(raw);
  return isValid(d) ? format(d, fmt) : '—';
}

export default function RentalDetailPage() {
  const params   = useParams();
  const router   = useRouter();
  const toast    = useToast();
  const rentalId = Number(params.id);

  const { data: rental, isLoading } = useRental(rentalId);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelMutation = useCancelRental();

  const textMuted    = useColorModeValue('gray.500', 'gray.400');
  const cardBg       = useColorModeValue('rgba(255,255,255,0.85)', 'rgba(11,28,45,0.7)');
  const cardBorder   = useColorModeValue('rgba(255,255,255,0.9)', 'rgba(255,255,255,0.06)');
  const rowBg        = useColorModeValue('gray.50', 'navy.600');
  const headingColor = useColorModeValue('navy.800', 'white');

  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync(rentalId);
      toast({ title: 'Rental cancelled successfully', status: 'success', duration: 3000 });
      router.push('/rentals');
    } catch (err) {
      toast({ title: 'Failed to cancel', description: err instanceof Error ? err.message : 'An error occurred', status: 'error', duration: 5000 });
    } finally {
      onClose();
    }
  };

  if (isLoading) return <Center h="60vh"><Spinner size="xl" color="brand.400" thickness="4px" /></Center>;
  if (!rental)   return (
    <Center h="60vh">
      <VStack>
        <Text>Rental not found</Text>
        <Button onClick={() => router.back()}>Go Back</Button>
      </VStack>
    </Center>
  );

  const images     = parseCarImages(rental.car?.image);
  const coverImage = images[0] || 'https://via.placeholder.com/700x260?text=Car';
  const meta       = STATUS_META[rental.status] ?? STATUS_META.reserved;

  const days = Math.max(
    1,
    Math.ceil((new Date(rental.endDate).getTime() - new Date(rental.startDate).getTime()) / 86400000)
  );
  const ratePerDay = days > 0 && rental.total ? Math.round(rental.total / days) : (rental.car?.price ?? 0);

  const isCancelled = rental.status === 'cancelled';
  const currentStepIdx = TIMELINE_STEPS.findIndex((s) => s.key === rental.status);

  return (
    <Box w="full">
      {/* Back link */}
      <Button
        variant="ghost" leftIcon={<FiArrowLeft />} mb={5}
        color={textMuted} _hover={{ color: headingColor, bg: 'transparent' }}
        onClick={() => router.push('/rentals')}
        px={0}
      >
        My Rentals
      </Button>

      {/* Header row — vehicle name + cancel button */}
      <MotionBox
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Flex justify="space-between" align={{ base: 'flex-start', md: 'center' }} mb={6} gap={3} flexWrap="wrap">
          <Box>
            <Text fontSize="2xl" fontWeight="extrabold" color={headingColor} lineHeight="short">
              {rental.car?.brand} {rental.car?.model}
            </Text>
            <Text fontSize="sm" color={textMuted}>{rental.car?.year}</Text>
          </Box>
          {rental.status === 'reserved' && (
            <Button
              colorScheme="red" variant="outline"
              leftIcon={<FiX />} borderRadius="xl"
              onClick={onOpen}
            >
              Cancel Reservation
            </Button>
          )}
        </Flex>
      </MotionBox>

      {/* 2x2 Grid */}
      <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} templateRows={{ lg: 'auto auto' }} gap={5}>

        {/* TOP-LEFT: Trip Details */}
        <GridItem>
          <MotionBox
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.35, delay: 0.08 }}
            bg={cardBg}
            backdropFilter="blur(12px)"
            border={`1px solid ${cardBorder}`}
            borderRadius="2xl"
            p={6}
            boxShadow="0 4px 20px rgba(11,28,45,0.07)"
            h="full"
          >
            <HStack mb={4} spacing={2}>
              <Box w={8} h={8} borderRadius="lg" bg="rgba(201,162,39,0.1)" display="flex" alignItems="center" justifyContent="center">
                <Icon as={FiCalendar} color="brand.400" boxSize={4} />
              </Box>
              <Text fontWeight="semibold" color={headingColor}>Trip Details</Text>
            </HStack>

            <VStack spacing={2} align="stretch">
              {[
                { label: 'Pick-up Date',  value: safeDate(rental.startDate, 'MMMM d, yyyy') },
                { label: 'Pick-up Time',  value: safeTime(rental.startTime) },
                { label: 'Return Date',   value: safeDate(rental.endDate, 'MMMM d, yyyy') },
                { label: 'Return Time',   value: safeTime(rental.endTime) },
                { label: 'Duration',      value: `${days} day${days !== 1 ? 's' : ''}` },
              ].map(({ label, value }) => (
                <Flex key={label} justify="space-between" align="center" py={2.5} px={3} bg={rowBg} borderRadius="lg">
                  <Text fontSize="sm" color={textMuted}>{label}</Text>
                  <Text fontSize="sm" fontWeight="medium" color={headingColor}>{value}</Text>
                </Flex>
              ))}
            </VStack>
          </MotionBox>
        </GridItem>

        {/* TOP-RIGHT: Image Card */}
        <GridItem>
          <MotionBox
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.35, delay: 0.1 }}
            bg={cardBg}
            backdropFilter="blur(12px)"
            border={`1px solid ${cardBorder}`}
            borderRadius="2xl"
            boxShadow="0 4px 20px rgba(11,28,45,0.07)"
            overflow="hidden"
            position="relative"
            minH="240px"
            h="full"
          >
            <Image
              src={coverImage}
              alt={`${rental.car?.brand} ${rental.car?.model}`}
              w="100%" h="100%"
              objectFit="cover"
              position="absolute"
              inset={0}
            />
            {/* Dark gradient overlay */}
            <Box
              position="absolute"
              inset={0}
              bgGradient="linear(to-t, rgba(11,28,45,0.7) 0%, transparent 50%)"
            />
            {/* Status badge */}
            <Flex
              position="absolute" bottom={4} right={4}
              bg={meta.bg} backdropFilter="blur(8px)"
              border={`1px solid ${meta.color}50`}
              borderRadius="full" px={4} py={1.5}
              align="center" gap={2}
            >
              <Box w={2} h={2} borderRadius="full" bg={meta.color} />
              <Text fontSize="sm" fontWeight="semibold" color={meta.color}>{meta.label}</Text>
            </Flex>
          </MotionBox>
        </GridItem>

        {/* BOTTOM-LEFT: Price Breakdown */}
        <GridItem>
          <MotionBox
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.35, delay: 0.14 }}
            bg={cardBg}
            backdropFilter="blur(12px)"
            border={`1px solid ${cardBorder}`}
            borderRadius="2xl"
            p={6}
            boxShadow="0 4px 20px rgba(11,28,45,0.07)"
            h="full"
          >
            <HStack mb={4} spacing={2}>
              <Box w={8} h={8} borderRadius="lg" bg="rgba(27,197,189,0.1)" display="flex" alignItems="center" justifyContent="center">
                <Icon as={FiDollarSign} color="accent.400" boxSize={4} />
              </Box>
              <Text fontWeight="semibold" color={headingColor}>Price Breakdown</Text>
            </HStack>

            <VStack spacing={3} align="stretch">
              <Flex justify="space-between">
                <Text fontSize="sm" color={textMuted}>Rate per day</Text>
                <Text fontSize="sm" fontWeight="medium" color={headingColor}>${ratePerDay}/day</Text>
              </Flex>
              <Flex justify="space-between">
                <Text fontSize="sm" color={textMuted}>Duration</Text>
                <Text fontSize="sm" fontWeight="medium" color={headingColor}>{days} day{days !== 1 ? 's' : ''}</Text>
              </Flex>
              <Divider />
              <Flex justify="space-between" align="center">
                <Text fontWeight="bold" color={headingColor}>Total</Text>
                <Text fontWeight="extrabold" fontSize="xl" color="accent.400">${rental.total?.toLocaleString()}</Text>
              </Flex>
            </VStack>
          </MotionBox>
        </GridItem>

        {/* BOTTOM-RIGHT: Status Process / Timeline */}
        <GridItem>
          <MotionBox
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.35, delay: 0.18 }}
            bg={cardBg}
            backdropFilter="blur(12px)"
            border={`1px solid ${cardBorder}`}
            borderRadius="2xl"
            p={6}
            boxShadow="0 4px 20px rgba(11,28,45,0.07)"
            h="full"
          >
            <HStack mb={5} spacing={2}>
              <Box w={8} h={8} borderRadius="lg" bg="rgba(201,162,39,0.1)" display="flex" alignItems="center" justifyContent="center">
                <Icon as={FiClock} color="brand.400" boxSize={4} />
              </Box>
              <Text fontWeight="semibold" color={headingColor}>Status</Text>
            </HStack>

            {isCancelled ? (
              <Flex
                align="center" gap={3} bg="rgba(229,62,62,0.08)"
                border="1px solid rgba(229,62,62,0.2)"
                borderRadius="xl" p={4}
              >
                <Icon as={FiXCircle} color="red.400" boxSize={6} />
                <Box>
                  <Text fontWeight="semibold" color="red.400">Cancelled</Text>
                  <Text fontSize="xs" color={textMuted}>This reservation was cancelled</Text>
                </Box>
              </Flex>
            ) : (
              <VStack spacing={0} align="stretch">
                {TIMELINE_STEPS.map((step, i) => {
                  const isDone   = currentStepIdx > i;
                  const isActive = currentStepIdx === i;
                  const dotColor = isDone ? '#1BC5BD' : isActive ? '#C9A227' : '#E2E8F0';
                  const StepIcon = step.icon;
                  return (
                    <HStack key={step.key} spacing={4} align="flex-start">
                      {/* Dot + connector */}
                      <VStack spacing={0} align="center" flexShrink={0}>
                        <Box
                          w={9} h={9} borderRadius="full"
                          bg={isDone || isActive ? dotColor : 'gray.100'}
                          display="flex" alignItems="center" justifyContent="center"
                          boxShadow={isActive ? `0 0 0 4px ${dotColor}30` : 'none'}
                          transition="all 0.3s"
                        >
                          <Icon
                            as={StepIcon}
                            boxSize={4}
                            color={isDone || isActive ? 'white' : 'gray.400'}
                          />
                        </Box>
                        {i < TIMELINE_STEPS.length - 1 && (
                          <Box w="2px" h={8} bg={isDone ? '#1BC5BD' : 'gray.200'} transition="all 0.3s" />
                        )}
                      </VStack>
                      {/* Label */}
                      <Box pt={1.5}>
                        <Text
                          fontSize="sm" fontWeight={isActive ? 'bold' : 'medium'}
                          color={isActive ? dotColor : isDone ? 'accent.400' : textMuted}
                        >
                          {step.label}
                        </Text>
                      </Box>
                    </HStack>
                  );
                })}
              </VStack>
            )}
          </MotionBox>
        </GridItem>

      </Grid>

      <ConfirmDialog
        isOpen={isOpen} onClose={onClose} onConfirm={handleCancel}
        title="Cancel Reservation"
        message="Are you sure you want to cancel this reservation? This action cannot be undone."
        confirmText="Yes, Cancel"
        isLoading={cancelMutation.isPending}
        colorScheme="red"
      />
    </Box>
  );
}
