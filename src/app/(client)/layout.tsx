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
import { FiSearch, FiCalendar, FiUser, FiLogOut, FiSun, FiMoon, FiMenu } from 'react-icons/fi';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { CarLoader } from '@/components/ui/CarLoader';
import { Logo } from '@/components/ui/Logo';

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
      bg="rgba(0,0,0,0.95)"
      borderBottom="1px"
      borderColor="rgba(255,215,0,0.1)"
      boxShadow="sm"
      px={{ base: 4, md: 6 }}
      py={3}
    >
      <Flex align="center" justify="space-between" maxW="1400px" mx="auto">
        {/* Brand */}
        <Box as={NextLink} href="/cars" _hover={{ textDecoration: 'none' }}>
          <Logo size="sm" />
        </Box>

        {/* Nav links -- desktop pill */}
        <HStack spacing={1} display={{ base: 'none', md: 'flex' }} bg="rgba(255,255,255,0.05)" borderRadius="full" p={1}>
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
                bg={isActive ? '#FFD700' : 'transparent'}
                color={isActive ? '#000000' : 'gray.300'}
                fontWeight={isActive ? 'semibold' : 'medium'}
                fontSize="sm"
                transition="all 0.2s"
                _hover={{ bg: isActive ? '#FFD700' : 'rgba(255,215,0,0.08)', color: isActive ? '#000000' : 'white', textDecoration: 'none' }}
              >
                <Icon as={item.icon} boxSize={4} mr={2} />
                <Text>{item.label}</Text>
              </Box>
            );
          })}
        </HStack>

        {/* Right side */}
        <HStack spacing={2}>
          {/* Theme toggle */}
          <IconButton
            aria-label="Toggle color mode"
            icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
            variant="ghost"
            color="white"
            borderRadius="full"
            size="md"
            onClick={toggleColorMode}
            _hover={{ bg: 'rgba(255,215,0,0.08)' }}
          />

          {/* Desktop: avatar + name + logout */}
          <HStack spacing={2} pl={1} display={{ base: 'none', md: 'flex' }}>
            <Avatar size="sm" name={`${user?.firstname} ${user?.name}`} src={user?.image} bg="brand.400" color="#000000" />
            <Text fontSize="sm" fontWeight="medium" color="white">{user?.firstname}</Text>
            <IconButton
              aria-label="Logout"
              icon={<FiLogOut />}
              variant="ghost"
              borderRadius="full"
              size="sm"
              color="red.400"
              bg="rgba(229,62,62,0.1)"
              _hover={{ bg: 'rgba(229,62,62,0.2)' }}
              onClick={handleLogout}
            />
          </HStack>

          {/* Mobile: hamburger */}
          <IconButton
            aria-label="Open menu"
            icon={<FiMenu />}
            variant="ghost"
            color="white"
            borderRadius="lg"
            size="md"
            display={{ base: 'inline-flex', md: 'none' }}
            onClick={onMenuOpen}
            _hover={{ bg: 'rgba(255,215,0,0.08)' }}
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

  const handleLogout = () => {
    logout();
    onClose();
    router.push('/auth/login');
  };

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="xs">
      <DrawerOverlay backdropFilter="blur(4px)" />
      <DrawerContent bg="#000000">
        <DrawerCloseButton color="white" />
        <DrawerHeader borderBottomWidth="1px" borderColor="rgba(255,215,0,0.1)">
          {/* User info */}
          <HStack spacing={3} mt={2}>
            <Avatar size="md" name={`${user?.firstname} ${user?.name}`} src={user?.image} bg="brand.400" color="#000000" />
            <Box>
              <Text fontSize="md" fontWeight="bold" color="white">
                {user?.firstname} {user?.name}
              </Text>
              <Text fontSize="xs" color="gray.400">{user?.email}</Text>
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
                  bg={isActive ? '#FFD700' : 'transparent'}
                  color={isActive ? '#000000' : 'white'}
                  fontWeight={isActive ? 'semibold' : 'medium'}
                  fontSize="sm"
                  transition="all 0.2s"
                  _hover={{ bg: isActive ? '#FFD700' : 'rgba(255,215,0,0.08)', textDecoration: 'none' }}
                >
                  <Icon as={item.icon} boxSize={5} />
                  <Text>{item.label}</Text>
                </Box>
              );
            })}

            <Divider my={2} borderColor="rgba(255,215,0,0.1)" />

            {/* Theme toggle */}
            <Box
              as="button"
              display="flex"
              alignItems="center"
              gap={3}
              px={4} py={3}
              borderRadius="xl"
              color="white"
              fontWeight="medium"
              fontSize="sm"
              w="full"
              transition="all 0.2s"
              _hover={{ bg: 'rgba(255,215,0,0.08)' }}
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
              color="red.400"
              fontWeight="medium"
              fontSize="sm"
              w="full"
              transition="all 0.2s"
              _hover={{ bg: 'rgba(229,62,62,0.1)' }}
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
    <Box minH="100vh" bg="#000000">
      <ClientNav onMenuOpen={() => setDrawerOpen(true)} />
      <Box as="main" pt="80px" px={{ base: 4, md: 6, lg: 8 }} pb={8} maxW="1400px" mx="auto">
        {children}
      </Box>
      <MobileDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </Box>
  );
}
