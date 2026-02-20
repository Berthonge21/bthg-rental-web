'use client';

import { useRouter } from 'next/navigation';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Text,
  Avatar,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { FiTruck, FiSearch, FiCalendar, FiUser, FiLogOut } from 'react-icons/fi';
import { useAuthStore } from '@/stores/auth.store';

function PublicNav() {
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
      bg="white"
      borderBottom="1px"
      borderColor="gray.100"
      px={{ base: 4, md: 8, lg: 12 }}
      py={3}
    >
      <Flex align="center" justify="space-between" maxW="1400px" mx="auto">
        {/* Logo */}
        <HStack spacing={3} as={NextLink} href="/" _hover={{ textDecoration: 'none' }}>
          <Box
            w={10}
            h={10}
            bg="navy.800"
            borderRadius="lg"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Icon as={FiTruck} color="brand.400" boxSize={5} />
          </Box>
          <Text
            fontSize="lg"
            fontWeight="bold"
            color="navy.800"
            display={{ base: 'none', md: 'block' }}
          >
            BTHG Rental
          </Text>
        </HStack>

        {/* Center — Browse Cars active link */}
        <Button
          as={NextLink}
          href="/cars"
          variant="ghost"
          color={isBrowseActive ? 'brand.400' : 'navy.800'}
          fontWeight="semibold"
          fontSize="sm"
          leftIcon={<FiSearch />}
          _hover={{ color: 'brand.400', bg: 'transparent' }}
          display={{ base: 'none', md: 'inline-flex' }}
        >
          Browse Cars
        </Button>

        {/* Right side */}
        {isAuthenticated && user ? (
          isAdmin ? (
            <Button
              as={NextLink}
              href={user.role === 'superAdmin' ? '/super-admin/dashboard' : '/admin/dashboard'}
              bg="navy.800"
              color="white"
              size="sm"
              borderRadius="lg"
              _hover={{ bg: 'navy.700' }}
            >
              Go to Dashboard
            </Button>
          ) : (
            <HStack spacing={3}>
              <Button
                as={NextLink}
                href="/rentals"
                variant="ghost"
                size="sm"
                color="navy.800"
                fontWeight="medium"
                leftIcon={<FiCalendar />}
                display={{ base: 'none', md: 'inline-flex' }}
              >
                My Rentals
              </Button>
              <Button
                as={NextLink}
                href="/profile"
                variant="ghost"
                size="sm"
                color="navy.800"
                fontWeight="medium"
                leftIcon={<FiUser />}
                display={{ base: 'none', md: 'inline-flex' }}
              >
                Profile
              </Button>
              <HStack spacing={2}>
                <Avatar
                  size="sm"
                  name={`${user.firstname} ${user.name}`}
                  src={user.image}
                  bg="brand.400"
                  color="white"
                />
                <Text
                  fontSize="sm"
                  fontWeight="medium"
                  color="navy.800"
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
                    color="red.500"
                    _hover={{ bg: 'red.50' }}
                    onClick={handleLogout}
                  />
                </Tooltip>
              </HStack>
            </HStack>
          )
        ) : (
          <HStack spacing={3}>
            <Button
              as={NextLink}
              href="/login"
              variant="ghost"
              color="navy.800"
              size="sm"
              fontWeight="medium"
            >
              Sign In
            </Button>
            <Button
              as={NextLink}
              href="/register"
              bg="navy.800"
              color="white"
              _hover={{ bg: 'navy.700' }}
              size="sm"
              borderRadius="lg"
            >
              Sign Up
            </Button>
          </HStack>
        )}
      </Flex>
    </Box>
  );
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box minH="100vh" bg="gray.50">
      <PublicNav />
      <Box as="main" pt="80px" px={{ base: 4, md: 6, lg: 8 }} pb={8} maxW="1400px" mx="auto">
        {children}
      </Box>
    </Box>
  );
}
