'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';
import {
  Box,
  Button,
  Center,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  Image,
  Input,
  Select,
  SimpleGrid,
  Text,
  VStack,
  Avatar,
  IconButton,
  Tooltip,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import {
  FiTruck,
  FiArrowRight,
  FiArrowUp,
  FiUsers,
  FiAward,
  FiShield,
  FiClock,
  FiLogOut,
  FiUser,
  FiCalendar,
  FiSearch,
  FiCheckCircle,
  FiChevronsDown,
  FiMenu,
} from 'react-icons/fi';
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useMotionValueEvent,
  useSpring,
  useInView,
  useMotionValue,
} from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/auth.store';
import { useCars } from '@/hooks';
import { parseCarImages } from '@/lib/imageUtils';
import { CarLoader } from '@/components/ui/CarLoader';
import { CarPlaceholder } from '@/components/ui/CarPlaceholder';
import { Logo } from '@/components/ui/Logo';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { FadeInOnScroll, ScrollProgressBar } from '@/components/ui/FadeInOnScroll';
import type { Car } from '@berthonge21/sdk';

const MotionBox = motion.create(Box);
const MotionText = motion.create(Text);
const MotionIconButton = motion.create(IconButton);

/* ── Featured car card ── */
function FeaturedCarCard({ car }: { car: Car }) {
  const { t } = useTranslation();
  const images = parseCarImages(car.image);
  return (
    <Box
      as={NextLink}
      href={`/cars/${car.id}`}
      bg="rgba(255,255,255,0.03)"
      backdropFilter="blur(16px)"
      borderRadius="2xl"
      overflow="hidden"
      border="1px solid rgba(255,215,0,0.1)"
      boxShadow="0 2px 20px rgba(0,0,0,0.4)"
      transition="all 0.3s"
      _hover={{
        transform: 'translateY(-8px)',
        boxShadow: '0 20px 44px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,215,0,0.25)',
        bg: 'rgba(255,255,255,0.05)',
        textDecoration: 'none',
      }}
      display="block"
      position="relative"
    >
      <Box position="absolute" left={0} top={0} bottom={0} w="3px" bg="brand.400" zIndex={1} borderLeftRadius="2xl" />
      <Box h="220px" bg="#080808" overflow="hidden" position="relative">
        {images.length > 0 ? (
          <Image
            src={images[0]}
            alt={`${car.brand} ${car.model}`}
            w="100%"
            h="100%"
            objectFit="cover"
          />
        ) : (
          <CarPlaceholder h="220px" />
        )}
        <Box position="absolute" top={0} right={0}>
          <Box bg="brand.400" px={3} py={1.5} borderBottomLeftRadius="lg" fontFamily="var(--font-display)" fontSize="xl" color="#000000" letterSpacing="0.04em" lineHeight="1">
            ${car.price}<Text as="span" fontSize="xs" fontWeight="normal" letterSpacing="normal">/{t('cars.perDay')}</Text>
          </Box>
        </Box>
      </Box>
      <Box p={5}>
        <Text fontFamily="var(--font-display)" fontSize="2xl" color="white" letterSpacing="0.02em" lineHeight="1.1" mb={0.5}>
          {car.brand} {car.model}
        </Text>
        <HStack spacing={3} mb={2}>
          <Text fontSize="xs" color="gray.400">{car.year}</Text>
          <Text fontSize="xs" color="gray.400">&middot;</Text>
          <Text fontSize="xs" color="gray.400">{car.fuel}</Text>
          <Text fontSize="xs" color="gray.400">&middot;</Text>
          <Text fontSize="xs" color="gray.400">{car.gearBox}</Text>
        </HStack>
        {car.Agency && (
          <HStack spacing={2} mb={3}>
            <Avatar size="xs" name={car.Agency.name} bg="brand.400" color="#000000" />
            <Text fontSize="xs" color="gray.400">{car.Agency.name}</Text>
          </HStack>
        )}
        <Button
          w="full"
          bg="brand.400"
          color="#000000"
          _hover={{ bg: 'brand.500' }}
          borderRadius="xl"
          size="sm"
          rightIcon={<FiArrowRight />}
          onClick={(e) => e.stopPropagation()}
        >
          {t('landing.viewAndBook')}
        </Button>
      </Box>
    </Box>
  );
}

/* ── Landing page nav ── */
function LandingNav() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'superAdmin';

  return (
    <>
      <Box
        as="nav"
        position="fixed"
        top={0}
        left={0}
        right={0}
        zIndex={1000}
        bg="rgba(0,0,0,0.92)"
        backdropFilter="blur(12px)"
        borderBottom="1px solid rgba(255,215,0,0.08)"
        px={{ base: 4, md: 8, lg: 12 }}
        py={3}
      >
        <Flex align="center" justify="space-between" maxW="1200px" mx="auto">
          {/* Logo */}
          <Box as={NextLink} href="/" _hover={{ textDecoration: 'none' }}>
            <Logo size="sm" />
          </Box>

          {/* Center -- Browse Cars link (desktop only) */}
          <Button
            as={NextLink}
            href="/cars"
            variant="ghost"
            color="white"
            fontWeight="medium"
            fontSize="sm"
            _hover={{ color: 'brand.400', bg: 'transparent' }}
            display={{ base: 'none', md: 'inline-flex' }}
          >
            {t('landing.browseCars')}
          </Button>

          {/* Right */}
          <HStack spacing={2}>
            {/* Language switcher — always visible (desktop + mobile) */}
            <LanguageSwitcher />

            {/* Desktop auth links */}
            {isAuthenticated && user ? (
              <HStack spacing={2} display={{ base: 'none', md: 'flex' }}>
                <Button
                  as={NextLink}
                  href={isAdmin ? (user.role === 'superAdmin' ? '/super-admin/dashboard' : '/admin/dashboard') : '/rentals'}
                  variant="ghost"
                  size="sm"
                  color="white"
                  fontWeight="medium"
                  leftIcon={<FiCalendar />}
                  _hover={{ color: 'brand.400', bg: 'transparent' }}
                >
                  {isAdmin ? t('landing.goToDashboard') : t('landing.myRentals')}
                </Button>
                <Avatar
                  size="sm"
                  name={`${user.firstname} ${user.name}`}
                  src={user.image}
                  bg="brand.400"
                  color="#000000"
                />
                <Tooltip label={t('nav.logout')} hasArrow>
                  <IconButton
                    aria-label={t('nav.logout')}
                    icon={<FiLogOut />}
                    variant="ghost"
                    size="sm"
                    color="red.400"
                    _hover={{ bg: 'whiteAlpha.100' }}
                    onClick={handleLogout}
                  />
                </Tooltip>
              </HStack>
            ) : (
              <HStack spacing={2} display={{ base: 'none', md: 'flex' }}>
                <Button
                  as={NextLink}
                  href="/auth/login"
                  variant="ghost"
                  color="white"
                  size="sm"
                  fontWeight="medium"
                  _hover={{ color: 'brand.400', bg: 'transparent' }}
                >
                  {t('auth.signIn')}
                </Button>
                <Button
                  as={NextLink}
                  href="/register"
                  bg="brand.400"
                  color="#000000"
                  fontWeight="semibold"
                  _hover={{ bg: 'lightGold.400' }}
                  size="sm"
                  borderRadius="lg"
                >
                  {t('auth.signUp')}
                </Button>
              </HStack>
            )}

            {/* Mobile hamburger */}
            <IconButton
              aria-label="Open menu"
              icon={<FiMenu />}
              variant="ghost"
              color="white"
              size="md"
              borderRadius="lg"
              display={{ base: 'flex', md: 'none' }}
              onClick={onOpen}
              _hover={{ bg: 'rgba(255,215,0,0.08)' }}
            />
          </HStack>
        </Flex>
      </Box>

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="xs">
        <DrawerOverlay backdropFilter="blur(4px)" />
        <DrawerContent bg="#000000" borderLeft="1px solid rgba(255,215,0,0.12)">
          <DrawerCloseButton color="white" top={4} right={4} />
          <DrawerHeader borderBottomWidth="1px" borderColor="rgba(255,215,0,0.1)" pb={4} pt={5}>
            <Box as={NextLink} href="/" onClick={onClose} _hover={{ textDecoration: 'none' }}>
              <Logo size="sm" />
            </Box>
          </DrawerHeader>
          <DrawerBody px={4} py={5}>
            <VStack spacing={2} align="stretch">
              {/* Browse Cars */}
              <Box
                as={NextLink}
                href="/cars"
                onClick={onClose}
                display="flex"
                alignItems="center"
                gap={3}
                px={4}
                py={3}
                borderRadius="xl"
                color="white"
                fontWeight="medium"
                fontSize="sm"
                _hover={{ bg: 'rgba(255,215,0,0.08)', color: 'brand.400', textDecoration: 'none' }}
                transition="all 0.2s"
              >
                <Icon as={FiSearch} boxSize={4} color="brand.400" />
                <Text>{t('landing.browseCars')}</Text>
              </Box>

              {isAuthenticated && user ? (
                <>
                  <Box
                    as={NextLink}
                    href={isAdmin ? (user.role === 'superAdmin' ? '/super-admin/dashboard' : '/admin/dashboard') : '/rentals'}
                    onClick={onClose}
                    display="flex"
                    alignItems="center"
                    gap={3}
                    px={4}
                    py={3}
                    borderRadius="xl"
                    color="white"
                    fontWeight="medium"
                    fontSize="sm"
                    _hover={{ bg: 'rgba(255,215,0,0.08)', color: 'brand.400', textDecoration: 'none' }}
                    transition="all 0.2s"
                  >
                    <Icon as={FiCalendar} boxSize={4} color="brand.400" />
                    <Text>{isAdmin ? t('landing.goToDashboard') : t('landing.myRentals')}</Text>
                  </Box>
                  {!isAdmin && (
                    <Box
                      as={NextLink}
                      href="/profile"
                      onClick={onClose}
                      display="flex"
                      alignItems="center"
                      gap={3}
                      px={4}
                      py={3}
                      borderRadius="xl"
                      color="white"
                      fontWeight="medium"
                      fontSize="sm"
                      _hover={{ bg: 'rgba(255,215,0,0.08)', color: 'brand.400', textDecoration: 'none' }}
                      transition="all 0.2s"
                    >
                      <Icon as={FiUser} boxSize={4} color="brand.400" />
                      <Text>{t('nav.profile')}</Text>
                    </Box>
                  )}
                  <Box pt={2} borderTop="1px solid rgba(255,215,0,0.08)" mt={1}>
                    <Box
                      display="flex"
                      alignItems="center"
                      gap={3}
                      px={4}
                      py={3}
                      borderRadius="xl"
                      color="red.400"
                      fontWeight="medium"
                      fontSize="sm"
                      cursor="pointer"
                      _hover={{ bg: 'rgba(229,62,62,0.08)', textDecoration: 'none' }}
                      transition="all 0.2s"
                      onClick={() => { handleLogout(); onClose(); }}
                    >
                      <Icon as={FiLogOut} boxSize={4} />
                      <Text>{t('nav.logout')}</Text>
                    </Box>
                  </Box>
                </>
              ) : (
                <VStack spacing={3} pt={4} align="stretch">
                  <Button
                    as={NextLink}
                    href="/auth/login"
                    onClick={onClose}
                    variant="outline"
                    borderColor="rgba(255,255,255,0.15)"
                    color="white"
                    borderRadius="xl"
                    _hover={{ borderColor: 'brand.400', color: 'brand.400', bg: 'transparent' }}
                  >
                    {t('auth.signIn')}
                  </Button>
                  <Button
                    as={NextLink}
                    href="/register"
                    onClick={onClose}
                    bg="brand.400"
                    color="#000000"
                    fontWeight="bold"
                    borderRadius="xl"
                    _hover={{ bg: 'lightGold.400' }}
                  >
                    {t('auth.signUp')}
                  </Button>
                </VStack>
              )}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

/* ── Quick search bar ── */
function QuickSearchBar() {
  const { t } = useTranslation();
  const router = useRouter();
  const [searchBrand, setSearchBrand] = useState('');
  const [fuel, setFuel] = useState('');
  const [gearBox, setGearBox] = useState('');

  const handleSearch = () => {
    router.push('/cars');
  };

  return (
    <Box
      bg="rgba(255,255,255,0.03)"
      backdropFilter="blur(24px)"
      border="1px solid rgba(255,215,0,0.12)"
      borderRadius="2xl"
      p={{ base: 4, md: 6 }}
      boxShadow="0 8px 40px rgba(0,0,0,0.5)"
      maxW="900px"
      mx="auto"
      mt={12}
    >
      <Flex
        direction={{ base: 'column', md: 'row' }}
        gap={4}
        align={{ base: 'stretch', md: 'flex-end' }}
      >
        <Box flex={1}>
          <Text fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>
            {t('landing.brandModel')}
          </Text>
          <Input
            placeholder={t('landing.brandModelPlaceholder')}
            value={searchBrand}
            onChange={(e) => setSearchBrand(e.target.value)}
            borderRadius="lg"
            h={12}
            border="1px solid"
            borderColor="gray.200"
            _focus={{ borderColor: 'brand.400', boxShadow: '0 0 0 1px #C9A227' }}
          />
        </Box>
        <Box flex={1}>
          <Text fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>
            {t('landing.fuelType')}
          </Text>
          <Select
            placeholder={t('landing.anyFuelType')}
            value={fuel}
            onChange={(e) => setFuel(e.target.value)}
            borderRadius="lg"
            h={12}
            border="1px solid"
            borderColor="gray.200"
            _focus={{ borderColor: 'brand.400', boxShadow: '0 0 0 1px #C9A227' }}
          >
            <option value="Petrol">{t('landing.petrol')}</option>
            <option value="Diesel">{t('landing.diesel')}</option>
            <option value="Electric">{t('landing.electric')}</option>
            <option value="Hybrid">{t('landing.hybrid')}</option>
          </Select>
        </Box>
        <Box flex={1}>
          <Text fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>
            {t('landing.gearbox')}
          </Text>
          <Select
            placeholder={t('landing.anyGearbox')}
            value={gearBox}
            onChange={(e) => setGearBox(e.target.value)}
            borderRadius="lg"
            h={12}
            border="1px solid"
            borderColor="gray.200"
            _focus={{ borderColor: 'brand.400', boxShadow: '0 0 0 1px #C9A227' }}
          >
            <option value="Automatic">{t('landing.automatic')}</option>
            <option value="Manual">{t('landing.manual')}</option>
          </Select>
        </Box>
        <Button
          bg="brand.400"
          color="#000000"
          fontWeight="semibold"
          _hover={{ bg: 'lightGold.400' }}
          borderRadius="lg"
          h={12}
          px={8}
          flexShrink={0}
          leftIcon={<FiSearch />}
          onClick={handleSearch}
        >
          {t('landing.searchCars')}
        </Button>
      </Flex>
    </Box>
  );
}

/* ── Scroll indicator ── */
function ScrollIndicator() {
  const { t } = useTranslation();
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 80], [1, 0]);

  return (
    <MotionBox
      position="absolute"
      bottom={8}
      left="50%"
      transform="translateX(-50%)"
      style={{ opacity }}
      textAlign="center"
    >
      <MotionBox
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Icon as={FiChevronsDown} boxSize={6} color="whiteAlpha.700" />
      </MotionBox>
      <Text fontSize="xs" color="whiteAlpha.500" mt={1}>
        {t('landing.scroll')}
      </Text>
    </MotionBox>
  );
}

/* ── Back to Top button ── */
function FloatingBackToTop() {
  const [show, setShow] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setShow(latest > 400);
  });

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {show && (
        <MotionIconButton
          aria-label="Back to top"
          icon={<FiArrowUp />}
          position="fixed"
          bottom={8}
          right={8}
          zIndex={1000}
          bg="brand.400"
          color="#000000"
          borderRadius="full"
          size="lg"
          boxShadow="lg"
          _hover={{ bg: 'lightGold.400' }}
          onClick={scrollToTop}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.25 }}
        />
      )}
    </AnimatePresence>
  );
}


/* ── Animated count-up stat ── */
function CountUpStat({ value, label }: { value: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  // extract trailing non-digit suffix like '+' or 'K+'
  const numMatch = value.match(/^([\d.]+)([^\d.]*)$/);
  const numericPart = numMatch ? parseFloat(numMatch[1]) : 0;
  const suffix = numMatch ? numMatch[2] : '';

  const count = useSpring(0, { stiffness: 60, damping: 20 });

  useEffect(() => {
    if (isInView) count.set(numericPart);
  }, [isInView, numericPart, count]);

  const displayValue = useTransform(count, (v) =>
    `${Math.round(v).toLocaleString()}${suffix}`
  );

  return (
    <VStack ref={ref} spacing={0}>
      <MotionText fontSize="2xl" fontWeight="bold" color="brand.400" style={{ fontVariantNumeric: 'tabular-nums' } as React.CSSProperties}>
        {displayValue}
      </MotionText>
      <Text fontSize="sm" color="whiteAlpha.600">{label}</Text>
    </VStack>
  );
}

/* ── TiltCard: 3D perspective tilt on hover ── */
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

/* ── Landing page (public) ── */
function LandingPage() {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuthStore();
  const { data: carsData } = useCars({ limit: 6 });
  const cars = carsData?.data ?? [];

  const isClient = isAuthenticated && user?.role === 'client';

  // Parallax refs — orbs drift at different speeds as sections scroll through viewport
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const featuredCarsRef = useRef<HTMLDivElement>(null);
  const whyChooseUsRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress: howWorksP } = useScroll({ target: howItWorksRef, offset: ['start end', 'end start'] });
  const { scrollYProgress: featuredP } = useScroll({ target: featuredCarsRef, offset: ['start end', 'end start'] });
  const { scrollYProgress: whyP } = useScroll({ target: whyChooseUsRef, offset: ['start end', 'end start'] });

  const howOrb1Y = useTransform(howWorksP, [0, 1], [-80, 80]);
  const howOrb2Y = useTransform(howWorksP, [0, 1], [80, -80]);
  const featOrb1Y = useTransform(featuredP, [0, 1], [-70, 70]);
  const featOrb2Y = useTransform(featuredP, [0, 1], [70, -70]);
  const whyOrb1Y = useTransform(whyP, [0, 1], [-90, 90]);
  const whyOrb2Y = useTransform(whyP, [0, 1], [90, -90]);

  const stats = [
    { value: '500+', label: t('landing.vehicles') },
    { value: '50+', label: t('landing.agencies') },
    { value: '10K+', label: t('landing.clients') },
  ];

  const steps = [
    {
      icon: FiSearch,
      title: t('landing.chooseYourCar'),
      desc: t('landing.chooseYourCarDesc'),
      number: '01',
    },
    {
      icon: FiCalendar,
      title: t('landing.bookOnline'),
      desc: t('landing.bookOnlineDesc'),
      number: '02',
    },
    {
      icon: FiCheckCircle,
      title: t('landing.hitTheRoad'),
      desc: t('landing.hitTheRoadDesc'),
      number: '03',
    },
  ];

  const features = [
    {
      icon: FiShield,
      title: t('landing.fullyInsured'),
      desc: t('landing.fullyInsuredDesc'),
    },
    {
      icon: FiUsers,
      title: t('landing.topAgencies'),
      desc: t('landing.topAgenciesDesc'),
    },
    {
      icon: FiAward,
      title: t('landing.bestPrice'),
      desc: t('landing.bestPriceDesc'),
    },
    {
      icon: FiClock,
      title: t('landing.support247'),
      desc: t('landing.support247Desc'),
    },
    {
      icon: FiCalendar,
      title: t('landing.easyBooking'),
      desc: t('landing.easyBookingDesc'),
    },
    {
      icon: FiCheckCircle,
      title: t('landing.instantConfirmation'),
      desc: t('landing.instantConfirmationDesc'),
    },
  ];

  return (
    <Box bg="#F7F9FC">
      <ScrollProgressBar />
      <LandingNav />
      {/* ---- Hero Section ---- */}
      <Box minH="100vh" bg="navy.800" pt="80px" position="relative" overflow="hidden">
        {/* Subtle noise texture overlay */}
        <Box
          position="absolute"
          inset={0}
          opacity={0.035}
          backgroundImage="url(&quot;data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E&quot;)"
          backgroundSize="200px 200px"
          pointerEvents="none"
          zIndex={1}
        />
        {/* Diagonal gold accent lines */}
        <Box
          position="absolute"
          top={0}
          right={{ base: '-20%', lg: '0' }}
          w="600px"
          h="100%"
          opacity={0.04}
          background="repeating-linear-gradient(-45deg, #C9A227 0px, #C9A227 1px, transparent 1px, transparent 40px)"
          pointerEvents="none"
          zIndex={1}
        />
        {/* Teal glow bottom-left */}
        <Box
          position="absolute"
          bottom="-10%"
          left="-5%"
          w="500px"
          h="500px"
          borderRadius="full"
          bg="rgba(27,197,189,0.07)"
          filter="blur(80px)"
          pointerEvents="none"
        />

        {/* Main layout — text left, car right */}
        <Flex
          maxW="1300px"
          mx="auto"
          px={{ base: 4, md: 8, lg: 12 }}
          minH="calc(90vh - 80px)"
          align="center"
          direction={{ base: 'column', lg: 'row' }}
          pt={{ base: 6, lg: 0 }}
          position="relative"
        >
          {/* Left: text content */}
          <VStack
            align={{ base: 'center', lg: 'start' }}
            spacing={7}
            flex="1"
            maxW={{ base: 'full', lg: '540px' }}
            zIndex={2}
            pb={{ base: 8, lg: 0 }}
            textAlign={{ base: 'center', lg: 'left' }}
          >
            {/* Gold accent rule */}
            <Box w="48px" h="2px" bg="brand.400" />

            {/* Badge — persistent glow ring */}
            <MotionBox
              display="inline-flex"
              alignItems="center"
              gap={2}
              bg="rgba(27,197,189,0.1)"
              border="1px solid rgba(27,197,189,0.25)"
              borderRadius="full"
              px={4}
              py={1.5}
              animate={{
                boxShadow: [
                  '0 0 0px rgba(27,197,189,0)',
                  '0 0 22px rgba(27,197,189,0.4)',
                  '0 0 0px rgba(27,197,189,0)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Icon as={FiTruck} color="accent.400" boxSize={3.5} />
              <Text
                fontSize="xs"
                fontWeight="semibold"
                color="accent.400"
                textTransform="uppercase"
                letterSpacing="wider"
              >
                {t('landing.premiumCarRental')}
              </Text>
            </MotionBox>

            {/* Huge stacked heading */}
            <Box>
              <Text
                fontSize={{ base: '6xl', md: '8xl', lg: '9xl' }}
                fontWeight="400"
                color="white"
                lineHeight="0.92"
                letterSpacing="0.02em"
                fontFamily="var(--font-display)"
                textTransform="uppercase"
              >
                {t('landing.driveYour')}
              </Text>
              <MotionText
                fontSize={{ base: '6xl', md: '8xl', lg: '9xl' }}
                fontWeight="400"
                color="brand.400"
                lineHeight="0.92"
                letterSpacing="0.02em"
                fontFamily="var(--font-display)"
                textTransform="uppercase"
                animate={{
                  textShadow: [
                    '0 0 0px rgba(201,162,39,0)',
                    '0 0 55px rgba(201,162,39,0.55)',
                    '0 0 0px rgba(201,162,39,0)',
                  ],
                }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                {t('landing.dreamCar')}
              </MotionText>
            </Box>

            {/* Subtitle */}
            <Text
              fontSize={{ base: 'sm', lg: 'md' }}
              color="whiteAlpha.600"
              maxW={{ base: '300px', lg: '380px' }}
              lineHeight="tall"
              letterSpacing="0.01em"
              textTransform="uppercase"
              fontWeight="medium"
            >
              {t('landing.heroSubtitle')}{' '}
              <Text as="span" color="brand.400" fontWeight="semibold">
                {t('landing.fastSimpleReliable')}
              </Text>
            </Text>

            {/* CTA buttons */}
            <HStack spacing={4} flexWrap="wrap" justify={{ base: 'center', lg: 'flex-start' }}>
              <Button
                as={NextLink}
                href="/cars"
                size="lg"
                bg="brand.400"
                color="#000"
                _hover={{
                  bg: 'brand.500',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 24px rgba(201,162,39,0.4)',
                }}
                borderRadius="full"
                px={10}
                rightIcon={<FiArrowRight />}
              >
                {t('landing.browseCars')}
              </Button>
              {isClient ? (
                <Button
                  as={NextLink}
                  href="/rentals"
                  size="lg"
                  variant="outline"
                  color="white"
                  borderColor="whiteAlpha.400"
                  _hover={{ bg: 'whiteAlpha.100', borderColor: 'white' }}
                  borderRadius="full"
                  px={10}
                >
                  {t('landing.myRentals')}
                </Button>
              ) : (
                !isAuthenticated && (
                  <Button
                    as={NextLink}
                    href="/register"
                    size="lg"
                    variant="outline"
                    color="white"
                    borderColor="whiteAlpha.400"
                    _hover={{ bg: 'whiteAlpha.100', borderColor: 'white' }}
                    borderRadius="full"
                    px={10}
                  >
                    {t('auth.signUpFree')}
                  </Button>
                )
              )}
            </HStack>

            {/* Stats */}
            <HStack spacing={10} pt={2} justify={{ base: 'center', lg: 'flex-start' }}>
              {stats.map((s) => (
                <CountUpStat key={s.label} value={s.value} label={s.label} />
              ))}
            </HStack>
          </VStack>

          {/* Right: car image — smooth continuous float + drift */}
          <Box
            flex={{ base: 'none', lg: '1' }}
            w={{ base: 'full', lg: 'auto' }}
            display="flex"
            alignItems="center"
            justifyContent="center"
            position="relative"
          >
            <MotionBox
              animate={{ y: [0, -22, 0], x: [0, 8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              position="relative"
              w="full"
              maxW={{ base: '380px', lg: 'none' }}
            >
              {/* Pulsing gold glow beneath car — synced with float */}
              <MotionBox
                position="absolute"
                bottom={-4}
                left="50%"
                transform="translateX(-50%)"
                w="70%"
                h="50px"
                bg="rgba(201,162,39,0.4)"
                filter="blur(28px)"
                borderRadius="full"
                animate={{ opacity: [0.3, 0.85, 0.3], scaleX: [0.7, 1.1, 0.7] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              />
              <Image
                src="/img/test.png"
                alt="Premium rental car"
                w="100%"
                objectFit="contain"
                maxH={{ base: '260px', lg: '520px' }}
                filter="drop-shadow(0 30px 50px rgba(0,0,0,0.5))"
              />
            </MotionBox>
          </Box>
        </Flex>

        {/* Quick search bar */}
        <Box maxW="1200px" mx="auto" px={{ base: 4, md: 8, lg: 12 }} pb={16}>
          <QuickSearchBar />
        </Box>

        {/* Scroll indicator */}
        <ScrollIndicator />
      </Box>

      {/* ---- How It Works ---- */}
      <Box ref={howItWorksRef} bg="#000000" backgroundImage="radial-gradient(circle, rgba(255,215,0,0.04) 1px, transparent 1px)" backgroundSize="28px 28px" py={20} px={{ base: 4, md: 8, lg: 12 }} position="relative" overflow="hidden">
        {/* Parallax orbs — drift in opposite directions as you scroll */}
        <MotionBox position="absolute" top="-8%" right="-3%" w="500px" h="500px" borderRadius="full" bg="rgba(27,197,189,0.08)" filter="blur(72px)" style={{ y: howOrb1Y }} pointerEvents="none" />
        <MotionBox position="absolute" bottom="-8%" left="-3%" w="450px" h="450px" borderRadius="full" bg="rgba(201,162,39,0.07)" filter="blur(60px)" style={{ y: howOrb2Y }} pointerEvents="none" />
        {/* Floating glass panel */}
        <VStack
          spacing={16}
          maxW="1020px"
          mx="auto"
          position="relative"
          bg="rgba(255,255,255,0.02)"
          backdropFilter="blur(24px)"
          border="1px solid rgba(255,215,0,0.1)"
          borderRadius="3xl"
          boxShadow="0 24px 64px rgba(0,0,0,0.5)"
          p={{ base: 8, md: 12, lg: 14 }}
        >
          <FadeInOnScroll>
            <VStack spacing={3} textAlign="center">
              <Text fontSize="xs" fontWeight="bold" color="brand.400" textTransform="uppercase" letterSpacing="widest" mb={1}>
                {t('landing.simpleProcess')}
              </Text>
              <Box w="32px" h="2px" bg="brand.400" mb={3} mx="auto" />
              <Heading fontFamily="var(--font-display)" fontSize={{ base: '4xl', md: '5xl' }} color="white" letterSpacing="0.02em" textTransform="uppercase">
                {t('landing.howItWorks')}
              </Heading>
              <Text color="gray.400" fontSize="md" maxW="420px">
                {t('landing.howItWorksSubtitle')}
              </Text>
            </VStack>
          </FadeInOnScroll>

          {/* Mobile layout */}
          <VStack spacing={8} w="full" display={{ base: 'flex', md: 'none' }}>
            {steps.map((step, index) => (
              <FadeInOnScroll key={step.title} delay={0.1 * index}>
                <HStack spacing={5} align="start">
                  <VStack spacing={0} flexShrink={0}>
                    <Box
                      w={12}
                      h={12}
                      borderRadius="full"
                      bg="accent.400"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      boxShadow="0 0 0 4px rgba(27,197,189,0.2)"
                    >
                      <Text fontWeight="bold" fontSize="lg" color="white">
                        {index + 1}
                      </Text>
                    </Box>
                    {index < steps.length - 1 && (
                      <Box w="2px" h={10} bg="gray.700" mt={2} />
                    )}
                  </VStack>
                  <VStack align="start" spacing={2} pt={2}>
                    <Box
                      w={10}
                      h={10}
                      bg="navy.800"
                      borderRadius="xl"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Icon as={step.icon} boxSize={5} color="brand.400" />
                    </Box>
                    <Text fontWeight="bold" fontSize="lg" color="white">
                      {step.title}
                    </Text>
                    <Text color="gray.400" fontSize="sm" lineHeight="tall">
                      {step.desc}
                    </Text>
                  </VStack>
                </HStack>
              </FadeInOnScroll>
            ))}
          </VStack>

          {/* Desktop alternating timeline */}
          <Box w="full" position="relative" display={{ base: 'none', md: 'block' }}>
            {/* Center vertical line */}
            <Box
              position="absolute"
              left="50%"
              top={0}
              bottom={0}
              w="2px"
              bgGradient="linear(to-b, transparent, rgba(27,197,189,0.18) 20%, rgba(27,197,189,0.18) 80%, transparent)"
              transform="translateX(-50%)"
            />

            <VStack spacing={16} w="full">
              {steps.map((step, index) => {
                const isLeft = index % 2 === 0;
                return (
                  <Box key={step.title} w="full" position="relative">
                    {/* Numbered circle on center line */}
                    <Box
                      position="absolute"
                      left="50%"
                      top="50%"
                      transform="translate(-50%, -50%)"
                      w={14}
                      h={14}
                      borderRadius="full"
                      bg="accent.400"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      zIndex={2}
                      boxShadow="0 0 0 6px rgba(0,0,0,0.8), 0 0 0 10px rgba(27,197,189,0.2)"
                    >
                      <Text fontWeight="extrabold" fontSize="xl" color="white">
                        {index + 1}
                      </Text>
                    </Box>

                    <Grid templateColumns="1fr 80px 1fr" gap={0} alignItems="center">
                      {/* Left slot */}
                      <GridItem pr={10}>
                        <FadeInOnScroll direction={isLeft ? 'right' : 'left'} delay={0.1}>
                          {isLeft ? (
                            /* Text block on left */
                            <VStack align="end" spacing={3} textAlign="right">
                              <Text fontWeight="bold" fontSize="xl" color="white">
                                {step.title}
                              </Text>
                              <Text color="gray.400" fontSize="sm" lineHeight="tall" maxW="280px">
                                {step.desc}
                              </Text>
                            </VStack>
                          ) : (
                            /* Icon card on left */
                            <Flex justify="flex-end">
                              <Box
                                w={20}
                                h={20}
                                bg="navy.800"
                                borderRadius="2xl"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                boxShadow="0 8px 24px rgba(11,28,45,0.2)"
                              >
                                <Icon as={step.icon} boxSize={8} color="brand.400" />
                              </Box>
                            </Flex>
                          )}
                        </FadeInOnScroll>
                      </GridItem>

                      {/* Center spacer (for the circle) */}
                      <GridItem />

                      {/* Right slot */}
                      <GridItem pl={10}>
                        <FadeInOnScroll direction={isLeft ? 'left' : 'right'} delay={0.1}>
                          {isLeft ? (
                            /* Icon card on right */
                            <Box
                              w={20}
                              h={20}
                              bg="navy.800"
                              borderRadius="2xl"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              boxShadow="0 8px 24px rgba(11,28,45,0.2)"
                            >
                              <Icon as={step.icon} boxSize={8} color="brand.400" />
                            </Box>
                          ) : (
                            /* Text block on right */
                            <VStack align="start" spacing={3} textAlign="left">
                              <Text fontWeight="bold" fontSize="xl" color="white">
                                {step.title}
                              </Text>
                              <Text color="gray.400" fontSize="sm" lineHeight="tall" maxW="280px">
                                {step.desc}
                              </Text>
                            </VStack>
                          )}
                        </FadeInOnScroll>
                      </GridItem>
                    </Grid>
                  </Box>
                );
              })}
            </VStack>
          </Box>
        </VStack>
      </Box>

      {/* ---- Featured Cars ---- */}
      {cars.length > 0 && (
        <Box ref={featuredCarsRef} bg="#000000" py={20} px={{ base: 4, md: 8, lg: 12 }} position="relative" overflow="hidden">
          <MotionBox position="absolute" top="-10%" left="15%" w="580px" h="580px" borderRadius="full" bg="rgba(201,162,39,0.06)" filter="blur(80px)" style={{ y: featOrb1Y }} pointerEvents="none" />
          <MotionBox position="absolute" bottom="-5%" right="10%" w="480px" h="480px" borderRadius="full" bg="rgba(27,197,189,0.06)" filter="blur(70px)" style={{ y: featOrb2Y }} pointerEvents="none" />
          <VStack spacing={10} maxW="1200px" mx="auto" position="relative">
            <FadeInOnScroll>
              <VStack spacing={3} textAlign="center">
                <Box w="32px" h="2px" bg="brand.400" mb={3} mx="auto" />
                <Heading fontFamily="var(--font-display)" fontSize={{ base: '4xl', md: '5xl' }} color="white" letterSpacing="0.02em" textTransform="uppercase">
                  {t('landing.featuredCars')}
                </Heading>
                <Text color="gray.400" maxW="500px">
                  {t('landing.featuredCarsSubtitle')}
                </Text>
              </VStack>
            </FadeInOnScroll>
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={6} w="full">
              {cars.map((car: Car, index: number) => (
                <FadeInOnScroll key={car.id} delay={Math.min(index, 2) * 0.1} direction="up">
                  <TiltCard>
                    <FeaturedCarCard car={car} />
                  </TiltCard>
                </FadeInOnScroll>
              ))}
            </SimpleGrid>
            <FadeInOnScroll delay={0.2}>
              <Button
                as={NextLink}
                href="/cars"
                variant="outline"
                color="white"
                borderColor="rgba(255,215,0,0.3)"
                rightIcon={<FiArrowRight />}
                borderRadius="lg"
                size="lg"
                _hover={{ bg: 'rgba(255,215,0,0.08)' }}
              >
                {t('landing.viewAllCars')}
              </Button>
            </FadeInOnScroll>
          </VStack>
        </Box>
      )}

      {/* ---- Why Choose Us ---- */}
      <Box ref={whyChooseUsRef} bg="#000000" backgroundImage="radial-gradient(circle, rgba(255,215,0,0.04) 1px, transparent 1px)" backgroundSize="28px 28px" py={20} px={{ base: 4, md: 8, lg: 12 }} position="relative" overflow="hidden">
        {/* Parallax orbs — drift in opposite directions */}
        <MotionBox position="absolute" top="5%" right="-5%" w="560px" h="560px" borderRadius="full" bg="rgba(201,162,39,0.08)" filter="blur(80px)" style={{ y: whyOrb1Y }} pointerEvents="none" />
        <MotionBox position="absolute" bottom="5%" left="-5%" w="500px" h="500px" borderRadius="full" bg="rgba(27,197,189,0.07)" filter="blur(70px)" style={{ y: whyOrb2Y }} pointerEvents="none" />
        {/* Floating glass panel */}
        <VStack
          spacing={16}
          maxW="1240px"
          mx="auto"
          position="relative"
          bg="rgba(255,255,255,0.02)"
          backdropFilter="blur(24px)"
          border="1px solid rgba(255,215,0,0.1)"
          borderRadius="3xl"
          boxShadow="0 24px 64px rgba(0,0,0,0.5)"
          p={{ base: 8, md: 12, lg: 14 }}
        >
          <FadeInOnScroll>
            <VStack spacing={3} textAlign="center">
              <Box w="32px" h="2px" bg="brand.400" mb={3} mx="auto" />
              <Heading fontFamily="var(--font-display)" fontSize={{ base: '4xl', md: '5xl' }} color="white" letterSpacing="0.02em" textTransform="uppercase">
                {t('landing.whyChooseUs')}
              </Heading>
              <Text color="gray.400" fontSize="md" maxW="460px">
                {t('landing.whyChooseUsSubtitle')}
              </Text>
            </VStack>
          </FadeInOnScroll>

          {/* Mobile: vertical stack */}
          <VStack spacing={6} w="full" display={{ base: 'flex', lg: 'none' }}>
            {features.map((f, index) => (
              <FadeInOnScroll key={f.title} delay={0.08 * index}>
                <HStack spacing={4} align="start">
                  <Box
                    w={12}
                    h={12}
                    bg="navy.800"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink={0}
                    boxShadow="0 4px 14px rgba(11,28,45,0.15)"
                  >
                    <Icon as={f.icon} boxSize={5} color="brand.400" />
                  </Box>
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="bold" color="white">
                      {f.title}
                    </Text>
                    <Text fontSize="sm" color="gray.400" lineHeight="tall">
                      {f.desc}
                    </Text>
                  </VStack>
                </HStack>
              </FadeInOnScroll>
            ))}
          </VStack>

          {/* Desktop: radial spoke layout */}
          <Grid
            display={{ base: 'none', lg: 'grid' }}
            templateColumns="1fr 220px 1fr"
            gap={8}
            w="full"
            alignItems="center"
          >
            {/* Left column — 3 features, icon on the right side facing center */}
            <VStack spacing={10} align="stretch">
              {features.slice(0, 3).map((f, index) => (
                <FadeInOnScroll key={f.title} direction="right" delay={0.1 * index}>
                  <HStack spacing={4} justify="flex-end">
                    <VStack align="end" spacing={1} textAlign="right">
                      <Text fontWeight="bold" fontSize="md" color="white">
                        {f.title}
                      </Text>
                      <Text fontSize="sm" color="gray.400" lineHeight="tall" maxW="220px">
                        {f.desc}
                      </Text>
                    </VStack>
                    <Box
                      w={14}
                      h={14}
                      bg="navy.800"
                      borderRadius="full"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      flexShrink={0}
                      boxShadow="0 4px 16px rgba(11,28,45,0.15)"
                    >
                      <Icon as={f.icon} boxSize={6} color="brand.400" />
                    </Box>
                  </HStack>
                </FadeInOnScroll>
              ))}
            </VStack>

            {/* Center circle */}
            <FadeInOnScroll>
              <Center>
                <Box
                  w="180px"
                  h="180px"
                  borderRadius="full"
                  bg="navy.800"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  boxShadow="0 0 0 12px rgba(201,162,39,0.1), 0 0 0 24px rgba(201,162,39,0.05), 0 20px 50px rgba(11,28,45,0.25)"
                >
                  <VStack spacing={2}>
                    <Icon as={FiTruck} boxSize={12} color="brand.400" />
                    <Text fontSize="xs" fontWeight="bold" color="white" textAlign="center" lineHeight="short">
                      BTHG{'\n'}Rental
                    </Text>
                  </VStack>
                </Box>
              </Center>
            </FadeInOnScroll>

            {/* Right column — 3 features, icon on the left side facing center */}
            <VStack spacing={10} align="stretch">
              {features.slice(3, 6).map((f, index) => (
                <FadeInOnScroll key={f.title} direction="left" delay={0.1 * index}>
                  <HStack spacing={4}>
                    <Box
                      w={14}
                      h={14}
                      bg="navy.800"
                      borderRadius="full"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      flexShrink={0}
                      boxShadow="0 4px 16px rgba(11,28,45,0.15)"
                    >
                      <Icon as={f.icon} boxSize={6} color="brand.400" />
                    </Box>
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="bold" fontSize="md" color="white">
                        {f.title}
                      </Text>
                      <Text fontSize="sm" color="gray.400" lineHeight="tall" maxW="220px">
                        {f.desc}
                      </Text>
                    </VStack>
                  </HStack>
                </FadeInOnScroll>
              ))}
            </VStack>
          </Grid>
        </VStack>
      </Box>

      {/* ---- CTA Banner ---- */}
      <Box py={16} px={{ base: 4, md: 8, lg: 12 }} bg="#000000">
        <FadeInOnScroll>
          <Box
            maxW="1200px"
            mx="auto"
            bg="navy.800"
            borderRadius="3xl"
            py={16}
            px={{ base: 6, md: 12 }}
            textAlign="center"
            position="relative"
            overflow="hidden"
            border="1px solid rgba(255,255,255,0.07)"
            boxShadow="0 24px 60px rgba(11,28,45,0.25), inset 0 1px 0 rgba(255,255,255,0.05)"
          >
            {/* Decorative circles */}
            <Box
              position="absolute"
              top="-20%"
              right="-5%"
              w="300px"
              h="300px"
              borderRadius="full"
              bg="rgba(201,162,39,0.08)"
            />
            <Box
              position="absolute"
              bottom="-15%"
              left="-5%"
              w="250px"
              h="250px"
              borderRadius="full"
              bg="rgba(27,197,189,0.06)"
            />

            <VStack spacing={6} position="relative">
              <Heading fontFamily="var(--font-display)" fontSize={{ base: '5xl', md: '7xl' }} color="white" letterSpacing="0.03em" textTransform="uppercase" lineHeight="0.95" whiteSpace="pre-line">
                {t('landing.readyToDrive')}
              </Heading>
              <Text color="whiteAlpha.700" maxW="500px" fontSize="lg">
                {t('landing.ctaSubtitle')}
              </Text>
              <HStack spacing={4} flexWrap="wrap" justify="center" pt={2}>
                <Button
                  as={NextLink}
                  href="/register"
                  size="lg"
                  bg="brand.400"
                  color="#000000"
                  fontWeight="bold"
                  _hover={{ bg: 'lightGold.400' }}
                  borderRadius="lg"
                  px={8}
                >
                  {t('landing.getStartedFree')}
                </Button>
                <Button
                  as={NextLink}
                  href="/cars"
                  size="lg"
                  variant="outline"
                  color="white"
                  borderColor="whiteAlpha.400"
                  _hover={{ bg: 'whiteAlpha.100' }}
                  borderRadius="lg"
                  px={8}
                >
                  {t('landing.browseCars')}
                </Button>
              </HStack>
            </VStack>
          </Box>
        </FadeInOnScroll>
      </Box>

      {/* ---- Footer ---- */}
      <Box bg="#000000" borderTop="1px solid rgba(255,215,0,0.1)" py={10} px={{ base: 4, md: 8, lg: 12 }}>
        <Flex
          maxW="1200px"
          mx="auto"
          justify="space-between"
          align="center"
          flexWrap="wrap"
          gap={4}
        >
          <Box as={NextLink} href="/" _hover={{ textDecoration: 'none' }}>
            <Logo size="sm" />
          </Box>
          <HStack spacing={6} display={{ base: 'none', md: 'flex' }}>
            <Text
              as={NextLink}
              href="/cars"
              fontSize="sm"
              color="gray.500"
              _hover={{ color: 'white' }}
            >
              {t('landing.browseCars')}
            </Text>
            <Text
              as={NextLink}
              href="/auth/login"
              fontSize="sm"
              color="gray.500"
              _hover={{ color: 'white' }}
            >
              {t('auth.signIn')}
            </Text>
            <Text
              as={NextLink}
              href="/register"
              fontSize="sm"
              color="gray.500"
              _hover={{ color: 'white' }}
            >
              {t('auth.signUp')}
            </Text>
          </HStack>
          <Text fontSize="sm" color="gray.400">
            &copy; {new Date().getFullYear()} {t('common.brand')}. {t('common.allRightsReserved')}
          </Text>
        </Flex>
      </Box>

      {/* Back to top */}
      <FloatingBackToTop />
    </Box>
  );
}

/* ── Root page ── */
export default function HomePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isAuthenticated, user, isLoading, isInitializing } = useAuthStore();

  useEffect(() => {
    if (isInitializing || isLoading) return;
    if (!isAuthenticated) return;
    if (user?.role === 'superAdmin') {
      router.replace('/super-admin/dashboard');
      return;
    }
    if (user?.role === 'admin') {
      router.replace('/admin/dashboard');
      return;
    }
    // Client role: stay on landing page (don't redirect)
  }, [isAuthenticated, user, isLoading, isInitializing, router]);

  // Show loader while initializing auth state
  if (isInitializing) {
    return <CarLoader fullScreen text={t('loading.loadingText')} />;
  }

  // Admin/superAdmin authenticated -- waiting for redirect
  if (isAuthenticated && (user?.role === 'admin' || user?.role === 'superAdmin')) {
    return <CarLoader fullScreen text={t('loading.redirecting')} />;
  }

  // Show landing page for guests AND authenticated clients
  return <LandingPage />;
}
