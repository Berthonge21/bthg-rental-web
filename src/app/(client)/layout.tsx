'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';
import {
  Box,
  Flex,
  HStack,
  VStack,
  Icon,
  Text,
  IconButton,
  Avatar,
  useColorMode,
  useColorModeValue,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Divider,
} from '@chakra-ui/react';
import { FiTruck, FiSearch, FiCalendar, FiUser, FiLogOut, FiSun, FiMoon, FiMenu } from 'react-icons/fi';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { CarLoader } from '@/components/ui/CarLoader';

const navItems = [
  { label: 'Browse Cars', href: '/cars', icon: FiSearch },
  { label: 'My Rentals', href: '/rentals', icon: FiCalendar },
  { label: 'Profile', href: '/profile', icon: FiUser },
];

function ClientNav({ onMenuOpen }: { onMenuOpen: () => void }) {
  const pathname = usePathname();
  const { colorMode, toggleColorMode } = useColorMode();
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const bgColor = useColorModeValue('white', 'navy.800');
  const borderColor = useColorModeValue('gray.100', 'navy.700');
  const navPillBg = useColorModeValue('gray.50', 'navy.700');
  const brandTextColor = useColorModeValue('navy.800', 'white');
  const activeBg = 'accent.400';
  const activeColor = 'white';
  const hoverBg = useColorModeValue('gray.100', 'navy.600');
  const textColor = useColorModeValue('text.secondary', 'gray.300');

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <Box
      as="nav"
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex={100}
      bg={bgColor}
      borderBottom="1px"
      borderColor={borderColor}
      boxShadow="sm"
      px={{ base: 4, md: 6 }}
      py={3}
    >
      <Flex align="center" justify="space-between" maxW="1400px" mx="auto">
        {/* Brand */}
        <HStack spacing={3} as={NextLink} href="/cars" _hover={{ textDecoration: 'none' }}>
          <Box
            w={10} h={10} bg="navy.800" borderRadius="lg"
            display="flex" alignItems="center" justifyContent="center"
          >
            <Icon as={FiTruck} color="brand.400" boxSize={5} />
          </Box>
          <Text fontFamily="var(--font-display)" fontSize="2xl" color={brandTextColor} letterSpacing="0.06em" display={{ base: 'none', md: 'block' }}>
            BTHG RENTAL
          </Text>
        </HStack>

        {/* Nav links — desktop pill */}
        <HStack spacing={1} display={{ base: 'none', md: 'flex' }} bg={navPillBg} borderRadius="full" p={1}>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Box
                key={item.href}
                as={NextLink}
                href={item.href}
                display="flex"
                alignItems="center"
                px={4} py={2}
                borderRadius="full"
                bg={isActive ? activeBg : 'transparent'}
                color={isActive ? activeColor : textColor}
                fontWeight={isActive ? 'semibold' : 'medium'}
                fontSize="sm"
                transition="all 0.2s"
                _hover={{ bg: isActive ? activeBg : hoverBg, color: isActive ? activeColor : 'text.primary', textDecoration: 'none' }}
              >
                <Icon as={item.icon} boxSize={4} mr={2} />
                <Text>{item.label}</Text>
              </Box>
            );
          })}
        </HStack>

        {/* Right side */}
        <HStack spacing={2}>
          {/* Theme toggle — always visible */}
          <IconButton
            aria-label="Toggle color mode"
            icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
            variant="ghost"
            borderRadius="full"
            size="md"
            onClick={toggleColorMode}
          />

          {/* Desktop: avatar + name + logout */}
          <HStack spacing={2} pl={1} display={{ base: 'none', md: 'flex' }}>
            <Avatar size="sm" name={`${user?.firstname} ${user?.name}`} src={user?.image} bg="brand.400" color="white" />
            <Text fontSize="sm" fontWeight="medium" color="text.primary">{user?.firstname}</Text>
            <IconButton
              aria-label="Logout"
              icon={<FiLogOut />}
              variant="ghost"
              borderRadius="full"
              size="sm"
              color="red.500"
              bg="red.50"
              _hover={{ bg: 'red.100' }}
              onClick={handleLogout}
            />
          </HStack>

          {/* Mobile: hamburger */}
          <IconButton
            aria-label="Open menu"
            icon={<FiMenu />}
            variant="ghost"
            borderRadius="lg"
            size="md"
            display={{ base: 'inline-flex', md: 'none' }}
            onClick={onMenuOpen}
          />
        </HStack>
      </Flex>
    </Box>
  );
}

function MobileDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { colorMode, toggleColorMode } = useColorMode();
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const bgColor = useColorModeValue('white', 'navy.800');
  const borderColor = useColorModeValue('gray.100', 'navy.700');
  const textColor = useColorModeValue('navy.800', 'white');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');
  const hoverBg = useColorModeValue('gray.50', 'navy.700');
  const logoutHoverBg = useColorModeValue('red.50', 'rgba(229,62,62,0.1)');

  const handleLogout = () => {
    logout();
    onClose();
    router.push('/auth/login');
  };

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="xs">
      <DrawerOverlay backdropFilter="blur(4px)" />
      <DrawerContent bg={bgColor}>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px" borderColor={borderColor}>
          {/* User info */}
          <HStack spacing={3} mt={2}>
            <Avatar size="md" name={`${user?.firstname} ${user?.name}`} src={user?.image} bg="brand.400" color="white" />
            <Box>
              <Text fontSize="md" fontWeight="bold" color={textColor}>
                {user?.firstname} {user?.name}
              </Text>
              <Text fontSize="xs" color={mutedColor}>{user?.email}</Text>
            </Box>
          </HStack>
        </DrawerHeader>

        <DrawerBody px={3} py={4}>
          <VStack spacing={1} align="stretch">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Box
                  key={item.href}
                  as={NextLink}
                  href={item.href}
                  onClick={onClose}
                  display="flex"
                  alignItems="center"
                  gap={3}
                  px={4} py={3}
                  borderRadius="xl"
                  bg={isActive ? 'accent.400' : 'transparent'}
                  color={isActive ? 'white' : textColor}
                  fontWeight={isActive ? 'semibold' : 'medium'}
                  fontSize="sm"
                  transition="all 0.2s"
                  _hover={{ bg: isActive ? 'accent.500' : hoverBg, textDecoration: 'none' }}
                >
                  <Icon as={item.icon} boxSize={5} />
                  <Text>{item.label}</Text>
                </Box>
              );
            })}

            <Divider my={2} />

            {/* Theme toggle */}
            <Box
              as="button"
              display="flex"
              alignItems="center"
              gap={3}
              px={4} py={3}
              borderRadius="xl"
              color={textColor}
              fontWeight="medium"
              fontSize="sm"
              w="full"
              transition="all 0.2s"
              _hover={{ bg: hoverBg }}
              onClick={toggleColorMode}
            >
              <Icon as={colorMode === 'light' ? FiMoon : FiSun} boxSize={5} />
              <Text>{colorMode === 'light' ? 'Dark Mode' : 'Light Mode'}</Text>
            </Box>

            {/* Logout */}
            <Box
              as="button"
              display="flex"
              alignItems="center"
              gap={3}
              px={4} py={3}
              borderRadius="xl"
              color="red.500"
              fontWeight="medium"
              fontSize="sm"
              w="full"
              transition="all 0.2s"
              _hover={{ bg: logoutHoverBg }}
              onClick={handleLogout}
            >
              <Icon as={FiLogOut} boxSize={5} />
              <Text>Logout</Text>
            </Box>
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const bgColor = useColorModeValue('surface.light', 'surface.dark');
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    if (user?.role === 'admin') { router.push('/admin/dashboard'); return; }
    if (user?.role === 'superAdmin') { router.push('/super-admin/dashboard'); }
  }, [isAuthenticated, user, isLoading, router]);

  if (isLoading || !isAuthenticated || user?.role === 'admin' || user?.role === 'superAdmin') {
    return <CarLoader fullScreen />;
  }

  return (
    <Box minH="100vh" bg={bgColor}>
      <ClientNav onMenuOpen={() => setDrawerOpen(true)} />
      <Box as="main" pt="80px" px={{ base: 4, md: 6, lg: 8 }} pb={8} maxW="1400px" mx="auto">
        {children}
      </Box>
      <MobileDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </Box>
  );
}
