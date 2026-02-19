'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';
import {
  Box,
  Button,
  Center,
  Flex,
  Grid,
  Heading,
  HStack,
  Icon,
  Image,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
  useColorModeValue,
  Badge,
  Avatar,
} from '@chakra-ui/react';
import { FiTruck, FiArrowRight, FiUsers, FiAward, FiShield } from 'react-icons/fi';
import { useAuthStore } from '@/stores/auth.store';
import { useCars, useAgencies } from '@/hooks';
import { parseCarImages } from '@/lib/imageUtils';
import type { Car, Agency } from '@bthgrentalcar/sdk';

/* ── Featured car card ── */
function FeaturedCarCard({ car }: { car: Car }) {
  const cardBg = useColorModeValue('white', 'navy.700');
  const cardBorder = useColorModeValue('gray.100', 'navy.600');
  const textMuted = useColorModeValue('text.muted', 'gray.400');

  return (
    <Box
      as={NextLink}
      href="/login"
      bg={cardBg}
      borderRadius="2xl"
      overflow="hidden"
      border="1px"
      borderColor={cardBorder}
      transition="all 0.3s"
      _hover={{ transform: 'translateY(-4px)', boxShadow: 'lg', textDecoration: 'none' }}
      display="block"
    >
      <Box h="180px" bg="navy.800" overflow="hidden">
        <Image
          src={parseCarImages(car.image)[0] || 'https://via.placeholder.com/400x200?text=Car'}
          alt={`${car.brand} ${car.model}`}
          w="100%"
          h="100%"
          objectFit="cover"
          opacity={0.9}
        />
      </Box>
      <Box p={4}>
        <Text fontWeight="bold" fontSize="md" mb={1}>
          {car.brand} {car.model}
        </Text>
        <HStack justify="space-between">
          <Text fontSize="xs" color={textMuted}>{car.fuel} · {car.gearBox}</Text>
          <Text fontWeight="bold" color="accent.400">${car.price}/day</Text>
        </HStack>
      </Box>
    </Box>
  );
}

/* ── Agency card ── */
function AgencyCard({ agency }: { agency: Agency }) {
  const cardBg = useColorModeValue('white', 'navy.700');
  const cardBorder = useColorModeValue('gray.100', 'navy.600');
  const textMuted = useColorModeValue('text.muted', 'gray.400');

  return (
    <Box
      bg={cardBg}
      borderRadius="xl"
      border="1px"
      borderColor={cardBorder}
      p={4}
      display="flex"
      alignItems="center"
      gap={3}
      transition="all 0.2s"
      _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }}
    >
      <Avatar size="md" name={agency.name} src={agency.image} bg="brand.400" color="white" borderRadius="lg" />
      <VStack align="start" spacing={0} minW={0}>
        <Text fontWeight="semibold" fontSize="sm" noOfLines={1}>{agency.name}</Text>
        <Text fontSize="xs" color={textMuted} noOfLines={1}>{agency.address}</Text>
      </VStack>
    </Box>
  );
}

/* ── Landing page (public) ── */
function LandingPage() {
  const { data: carsData } = useCars({ limit: 6 });
  const { data: agenciesData } = useAgencies({ limit: 6 });
  const cars = carsData?.data ?? [];
  const agencies = agenciesData?.data ?? [];

  const heroBg = useColorModeValue('navy.800', 'navy.900');
  const sectionBg = useColorModeValue('surface.light', 'surface.dark');
  const altBg = useColorModeValue('gray.50', 'navy.800');
  const textMuted = useColorModeValue('text.muted', 'gray.400');
  const featureCardBg = useColorModeValue('white', 'navy.700');

  const stats = [
    { value: '500+', label: 'Vehicles' },
    { value: '50+', label: 'Agencies' },
    { value: '10K+', label: 'Happy Clients' },
  ];

  const features = [
    { icon: FiShield, title: 'Fully Insured', desc: 'All rentals come with comprehensive coverage.' },
    { icon: FiUsers, title: 'Top Agencies', desc: 'Vetted, professional rental agencies.' },
    { icon: FiAward, title: 'Best Price', desc: 'Transparent daily rates, no hidden fees.' },
  ];

  return (
    <Box>
      {/* Hero */}
      <Box bg={heroBg} minH="100vh" position="relative" overflow="hidden">
        {/* Decorative circles */}
        <Box position="absolute" top="-10%" right="-5%" w="500px" h="500px" borderRadius="full" bg="rgba(201,162,39,0.08)" />
        <Box position="absolute" bottom="-15%" left="-8%" w="600px" h="600px" borderRadius="full" bg="rgba(27,197,189,0.05)" />

        {/* Nav */}
        <Flex
          position="absolute"
          top={0}
          left={0}
          right={0}
          px={{ base: 6, md: 12 }}
          py={5}
          align="center"
          justify="space-between"
          zIndex={10}
        >
          <HStack spacing={3}>
            <Box w={10} h={10} bg="brand.400" borderRadius="lg" display="flex" alignItems="center" justifyContent="center">
              <Icon as={FiTruck} color="white" boxSize={5} />
            </Box>
            <Text fontSize="lg" fontWeight="bold" color="white">BTHG Rental</Text>
          </HStack>
          <HStack spacing={3}>
            <Button as={NextLink} href="/login" variant="ghost" color="white" _hover={{ bg: 'whiteAlpha.100' }} size="sm">
              Sign In
            </Button>
            <Button as={NextLink} href="/register" bg="brand.400" color="white" _hover={{ bg: 'brand.500' }} size="sm" borderRadius="full">
              Get Started
            </Button>
          </HStack>
        </Flex>

        {/* Hero content */}
        <Center minH="100vh" px={{ base: 6, md: 12 }}>
          <VStack spacing={8} textAlign="center" maxW="700px">
            <Badge colorScheme="yellow" variant="subtle" px={4} py={1} borderRadius="full" fontSize="sm">
              Premium Car Rental Platform
            </Badge>
            <Heading fontSize={{ base: '4xl', md: '6xl' }} fontWeight="extrabold" color="white" lineHeight="1.1">
              Find Your{' '}
              <Text as="span" color="brand.400">Perfect</Text>
              {' '}Ride
            </Heading>
            <Text fontSize={{ base: 'md', lg: 'xl' }} color="whiteAlpha.700" maxW="500px">
              Browse hundreds of vehicles from top agencies. Book in minutes, drive with confidence.
            </Text>
            <HStack spacing={4} flexWrap="wrap" justify="center">
              <Button
                as={NextLink}
                href="/register"
                size="lg"
                bg="brand.400"
                color="white"
                _hover={{ bg: 'brand.500' }}
                borderRadius="full"
                px={8}
                rightIcon={<FiArrowRight />}
              >
                Browse Cars
              </Button>
              <Button
                as={NextLink}
                href="/login"
                size="lg"
                variant="outline"
                color="white"
                borderColor="whiteAlpha.400"
                _hover={{ bg: 'whiteAlpha.100' }}
                borderRadius="full"
                px={8}
              >
                Sign In
              </Button>
            </HStack>

            {/* Stats */}
            <HStack spacing={10} pt={4}>
              {stats.map((s) => (
                <VStack key={s.label} spacing={0}>
                  <Text fontSize="2xl" fontWeight="bold" color="brand.400">{s.value}</Text>
                  <Text fontSize="sm" color="whiteAlpha.600">{s.label}</Text>
                </VStack>
              ))}
            </HStack>
          </VStack>
        </Center>
      </Box>

      {/* Features */}
      <Box bg={altBg} py={20} px={{ base: 6, md: 12 }}>
        <VStack spacing={12} maxW="1200px" mx="auto">
          <VStack spacing={3} textAlign="center">
            <Text fontSize="sm" fontWeight="semibold" color="brand.400" textTransform="uppercase" letterSpacing="wider">
              Why Choose Us
            </Text>
            <Heading size="xl">The smarter way to rent</Heading>
          </VStack>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} w="full">
            {features.map((f) => (
              <VStack key={f.title} p={8} bg={featureCardBg} borderRadius="2xl" spacing={4} align="start" boxShadow="sm">
                <Box w={12} h={12} bg="brand.50" borderRadius="xl" display="flex" alignItems="center" justifyContent="center">
                  <Icon as={f.icon} boxSize={6} color="brand.400" />
                </Box>
                <Text fontWeight="bold" fontSize="lg">{f.title}</Text>
                <Text color={textMuted} fontSize="sm">{f.desc}</Text>
              </VStack>
            ))}
          </SimpleGrid>
        </VStack>
      </Box>

      {/* Featured cars */}
      {cars.length > 0 && (
        <Box bg={sectionBg} py={20} px={{ base: 6, md: 12 }}>
          <VStack spacing={10} maxW="1200px" mx="auto">
            <Flex justify="space-between" align="center" w="full">
              <VStack align="start" spacing={1}>
                <Text fontSize="sm" fontWeight="semibold" color="accent.400" textTransform="uppercase" letterSpacing="wider">
                  Featured Vehicles
                </Text>
                <Heading size="lg">Popular Cars</Heading>
              </VStack>
              <Button as={NextLink} href="/login" variant="outline" colorScheme="brand" rightIcon={<FiArrowRight />} size="sm" borderRadius="full">
                View All
              </Button>
            </Flex>
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={5} w="full">
              {cars.map((car) => <FeaturedCarCard key={car.id} car={car} />)}
            </SimpleGrid>
          </VStack>
        </Box>
      )}

      {/* Agencies */}
      {agencies.length > 0 && (
        <Box bg={altBg} py={20} px={{ base: 6, md: 12 }}>
          <VStack spacing={10} maxW="1200px" mx="auto">
            <VStack spacing={3} textAlign="center">
              <Text fontSize="sm" fontWeight="semibold" color="brand.400" textTransform="uppercase" letterSpacing="wider">
                Our Partners
              </Text>
              <Heading size="lg">Trusted Agencies</Heading>
            </VStack>
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={4} w="full">
              {agencies.map((agency) => <AgencyCard key={agency.id} agency={agency} />)}
            </SimpleGrid>
          </VStack>
        </Box>
      )}

      {/* Footer */}
      <Box bg="navy.800" py={10} px={{ base: 6, md: 12 }}>
        <Flex maxW="1200px" mx="auto" justify="space-between" align="center" flexWrap="wrap" gap={4}>
          <HStack spacing={3}>
            <Box w={8} h={8} bg="brand.400" borderRadius="lg" display="flex" alignItems="center" justifyContent="center">
              <Icon as={FiTruck} color="white" boxSize={4} />
            </Box>
            <Text fontWeight="bold" color="white">BTHG Rental Car</Text>
          </HStack>
          <Text fontSize="sm" color="whiteAlpha.500">© {new Date().getFullYear()} BTHG Rental. All rights reserved.</Text>
        </Flex>
      </Box>
    </Box>
  );
}

/* ── Root page ── */
export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    if (user?.role === 'superAdmin') { router.replace('/super-admin/dashboard'); return; }
    if (user?.role === 'admin') { router.replace('/admin/dashboard'); return; }
    // client role → go to car catalog
    router.replace('/cars');
  }, [isAuthenticated, user, isLoading, router]);

  // Show landing page while loading or when not authenticated
  if (isLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="brand.400" thickness="4px" />
      </Center>
    );
  }

  // Authenticated users get redirected above; show landing for guests
  if (!isAuthenticated) return <LandingPage />;

  // Authenticated — waiting for redirect
  return (
    <Center h="100vh">
      <Spinner size="xl" color="brand.400" thickness="4px" />
    </Center>
  );
}
