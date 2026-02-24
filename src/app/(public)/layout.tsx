'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Box,
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  HStack,
  Icon,
  IconButton,
  Text,
  Avatar,
  Tooltip,
  VStack,
} from '@chakra-ui/react';
import { FiSearch, FiCalendar, FiUser, FiLogOut, FiMenu } from 'react-icons/fi';
import { useAuthStore } from '@/stores/auth.store';
import { Logo } from '@/components/ui/Logo';

function PublicNav({ onMenuOpen }: { onMenuOpen: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'superAdmin';
  const isBrowseActive = pathname === '/cars' || pathname.startsWith('/cars/');

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
      px={{ base: 4, md: 8, lg: 12 }}
      py={3}
    >
      <Flex align="center" justify="space-between" maxW="1400px" mx="auto">
        {/* Logo */}
        <Box as={NextLink} href="/" _hover={{ textDecoration: 'none' }}>
          <Logo size="sm" />
        </Box>

        {/* Center -- Browse Cars active link */}
        <>
          {/* Desktop: full button */}
          <Button
            as={NextLink}
            href="/cars"
            variant="ghost"
            color={isBrowseActive ? 'brand.400' : 'white'}
            fontWeight="semibold"
            fontSize="sm"
            leftIcon={<FiSearch />}
            _hover={{ color: 'brand.400', bg: 'transparent' }}
            display={{ base: 'none', md: 'inline-flex' }}
          >
            Browse Cars
          </Button>
          {/* Mobile: icon only */}
          <IconButton
            as={NextLink}
            href="/cars"
            aria-label="Browse Cars"
            icon={<FiSearch />}
            variant="ghost"
            color={isBrowseActive ? 'brand.400' : 'white'}
            display={{ base: 'inline-flex', md: 'none' }}
            _hover={{ bg: 'rgba(255,215,0,0.08)' }}
          />
        </>

        {/* Right side */}
        {isAuthenticated && user ? (
          isAdmin ? (
            <HStack spacing={2}>
              <Button
                as={NextLink}
                href={user.role === 'superAdmin' ? '/super-admin/dashboard' : '/admin/dashboard'}
                bg="brand.400"
                color="#000000"
                size="sm"
                borderRadius="lg"
                _hover={{ bg: 'lightGold.400' }}
                display={{ base: 'none', md: 'inline-flex' }}
              >
                Go to Dashboard
              </Button>
              {/* Mobile hamburger */}
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
          ) : (
            <HStack spacing={3}>
              <Button
                as={NextLink}
                href="/rentals"
                variant="ghost"
                size="sm"
                color="white"
                fontWeight="medium"
                leftIcon={<FiCalendar />}
                display={{ base: 'none', md: 'inline-flex' }}
                _hover={{ bg: 'rgba(255,215,0,0.08)' }}
              >
                My Rentals
              </Button>
              <Button
                as={NextLink}
                href="/profile"
                variant="ghost"
                size="sm"
                color="white"
                fontWeight="medium"
                leftIcon={<FiUser />}
                display={{ base: 'none', md: 'inline-flex' }}
                _hover={{ bg: 'rgba(255,215,0,0.08)' }}
              >
                Profile
              </Button>
              <HStack spacing={2}>
                <Avatar
                  size="sm"
                  name={`${user.firstname} ${user.name}`}
                  src={user.image}
                  bg="brand.400"
                  color="#000000"
                />
                <Text
                  fontSize="sm"
                  fontWeight="medium"
                  color="white"
                  display={{ base: 'none', lg: 'block' }}
                >
                  {user.firstname}
                </Text>
                <Tooltip label="Logout" hasArrow>
                  <IconButton
                    aria-label="Logout"
                    icon={<FiLogOut />}
                    variant="ghost"
                    size="sm"
                    color="red.400"
                    _hover={{ bg: 'rgba(229,62,62,0.1)' }}
                    onClick={handleLogout}
                  />
                </Tooltip>
              </HStack>
              {/* Mobile hamburger */}
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
          )
        ) : (
          <HStack spacing={3}>
            <Button
              as={NextLink}
              href="/auth/login"
              variant="ghost"
              color="white"
              size="sm"
              fontWeight="medium"
              display={{ base: 'none', md: 'inline-flex' }}
              _hover={{ bg: 'rgba(255,215,0,0.08)' }}
            >
              Sign In
            </Button>
            <Button
              as={NextLink}
              href="/register"
              bg="brand.400"
              color="#000000"
              _hover={{ bg: 'lightGold.400' }}
              size="sm"
              borderRadius="lg"
              display={{ base: 'none', md: 'inline-flex' }}
            >
              Sign Up
            </Button>
            {/* Mobile hamburger */}
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
        )}
      </Flex>
    </Box>
  );
}

function PublicMobileDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const isAdmin = user?.role === 'admin' || user?.role === 'superAdmin';

  const handleLogout = () => {
    logout();
    onClose();
    router.push('/');
  };

  const clientNavItems = [
    { label: 'Browse Cars', href: '/cars', icon: FiSearch },
    { label: 'My Rentals', href: '/rentals', icon: FiCalendar },
    { label: 'Profile', href: '/profile', icon: FiUser },
  ];

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="xs">
      <DrawerOverlay backdropFilter="blur(4px)" />
      <DrawerContent bg="#000000">
        <DrawerCloseButton color="white" />
        <DrawerHeader borderBottomWidth="1px" borderColor="rgba(255,215,0,0.1)" pb={4}>
          <Box mt={2}>
            <Logo size="sm" />
          </Box>
        </DrawerHeader>
        <DrawerBody px={3} py={4}>
          <VStack spacing={1} align="stretch">
            {isAuthenticated && user ? (
              isAdmin ? (
                <Box
                  as={NextLink}
                  href={user.role === 'superAdmin' ? '/super-admin/dashboard' : '/admin/dashboard'}
                  onClick={onClose}
                  display="flex" alignItems="center" gap={3}
                  px={4} py={3} borderRadius="xl"
                  bg="brand.400" color="#000000"
                  fontWeight="semibold" fontSize="sm"
                  _hover={{ bg: 'lightGold.400', textDecoration: 'none' }}
                >
                  <Icon as={FiSearch} boxSize={5} />
                  <Text>Go to Dashboard</Text>
                </Box>
              ) : (
                clientNavItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Box
                      key={item.href}
                      as={NextLink}
                      href={item.href}
                      onClick={onClose}
                      display="flex" alignItems="center" gap={3}
                      px={4} py={3} borderRadius="xl"
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
                })
              )
            ) : (
              <>
                <Box
                  as={NextLink} href="/cars" onClick={onClose}
                  display="flex" alignItems="center" gap={3}
                  px={4} py={3} borderRadius="xl"
                  color="white" fontWeight="medium" fontSize="sm"
                  _hover={{ bg: 'rgba(255,215,0,0.08)', textDecoration: 'none' }}
                >
                  <Icon as={FiSearch} boxSize={5} />
                  <Text>Browse Cars</Text>
                </Box>
                <Box
                  as={NextLink} href="/auth/login" onClick={onClose}
                  display="flex" alignItems="center" gap={3}
                  px={4} py={3} borderRadius="xl"
                  color="white" fontWeight="medium" fontSize="sm"
                  _hover={{ bg: 'rgba(255,215,0,0.08)', textDecoration: 'none' }}
                >
                  <Icon as={FiUser} boxSize={5} />
                  <Text>Sign In</Text>
                </Box>
                <Box
                  as={NextLink} href="/register" onClick={onClose}
                  display="flex" alignItems="center" gap={3}
                  px={4} py={3} borderRadius="xl"
                  bg="brand.400" color="#000000"
                  fontWeight="semibold" fontSize="sm"
                  _hover={{ bg: 'lightGold.400', textDecoration: 'none' }}
                >
                  <Icon as={FiUser} boxSize={5} />
                  <Text>Sign Up</Text>
                </Box>
              </>
            )}

            {isAuthenticated && !isAdmin && (
              <>
                <Divider my={2} borderColor="rgba(255,215,0,0.1)" />
                <Box
                  as="button"
                  display="flex" alignItems="center" gap={3}
                  px={4} py={3} borderRadius="xl"
                  color="red.400" fontWeight="medium" fontSize="sm"
                  w="full" transition="all 0.2s"
                  _hover={{ bg: 'rgba(229,62,62,0.1)' }}
                  onClick={handleLogout}
                >
                  <Icon as={FiLogOut} boxSize={5} />
                  <Text>Logout</Text>
                </Box>
              </>
            )}
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  return (
    <Box minH="100vh" bg="#000000">
      <PublicNav onMenuOpen={() => setDrawerOpen(true)} />
      <Box as="main" pt="80px" px={{ base: 4, md: 6, lg: 8 }} pb={8} maxW="1400px" mx="auto">
        {children}
      </Box>
      <PublicMobileDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </Box>
  );
}
