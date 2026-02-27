'use client';

import { usePathname } from 'next/navigation';
import NextLink from 'next/link';
import {
  Box,
  Flex,
  HStack,
  Icon,
  Text,
  IconButton,
  Avatar,
  useColorMode,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  VStack,
  Tooltip,
  Badge,
} from '@chakra-ui/react';
import {
  FiHome,
  FiTruck,
  FiCalendar,
  FiUser,
  FiUsers,
  FiGrid,
  FiMenu,
  FiSun,
  FiMoon,
  FiBell,
  FiLogOut,
} from 'react-icons/fi';
import type { IconType } from 'react-icons';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/auth.store';
import { Logo } from '@/components/ui/Logo';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

interface NavItem {
  label: string;
  href: string;
  icon: IconType;
}

interface TopNavigationProps {
  items: NavItem[];
  brandName?: string;
}

export function TopNavigation({ items, brandName = 'BTHG Rental' }: TopNavigationProps) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { colorMode, toggleColorMode } = useColorMode();
  const { user, logout } = useAuthStore();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleLogout = () => {
    logout();
    window.location.href = '/auth/login';
  };

  return (
    <>
      {/* Main Top Navigation */}
      <Box
        as="nav"
        position="fixed"
        top={0}
        left={0}
        right={0}
        zIndex={1000}
        bg="rgba(0,0,0,0.95)"
        borderBottom="1px"
        borderColor="rgba(255,215,0,0.1)"
        boxShadow="sm"
        px={{ base: 4, md: 6 }}
        py={3}
      >
        <Flex align="center" justify="space-between" maxW="1600px" mx="auto">
          {/* Left: Brand Logo */}
          <HStack spacing={3}>
            {/* Mobile Menu Button */}
            <IconButton
              aria-label="Open menu"
              icon={<FiMenu />}
              variant="ghost"
              color="white"
              display={{ base: 'flex', lg: 'none' }}
              onClick={onOpen}
              _hover={{ bg: 'rgba(255,215,0,0.08)' }}
            />

            {/* Brand Logo */}
            <Box as={NextLink} href="/admin/dashboard" _hover={{ textDecoration: 'none' }}>
              <Logo size="sm" />
            </Box>
          </HStack>

          {/* Center: Navigation Links */}
          <HStack
            spacing={1}
            display={{ base: 'none', lg: 'flex' }}
            position="absolute"
            left="50%"
            transform="translateX(-50%)"
            bg="rgba(255,255,255,0.05)"
            borderRadius="full"
            p={1}
          >
            {items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <NavLink key={item.href} item={item} isActive={isActive} />
              );
            })}
          </HStack>

          {/* Right: Notifications, Theme, User + Logout */}
          <HStack spacing={2}>
            {/* Notifications */}
            <Tooltip label="Notifications" hasArrow>
              <IconButton
                aria-label="Notifications"
                icon={
                  <Box position="relative">
                    <FiBell />
                    <Badge
                      position="absolute"
                      top="-6px"
                      right="-6px"
                      colorScheme="red"
                      variant="solid"
                      borderRadius="full"
                      fontSize="10px"
                      minW={4}
                      h={4}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      3
                    </Badge>
                  </Box>
                }
                variant="ghost"
                color="white"
                borderRadius="full"
                size="md"
                _hover={{ bg: 'rgba(255,215,0,0.08)' }}
              />
            </Tooltip>

            {/* Color Mode Toggle */}
            <Tooltip label={colorMode === 'light' ? 'Dark mode' : 'Light mode'} hasArrow>
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
            </Tooltip>

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* User info + logout icon */}
            <HStack spacing={2} pl={2}>
              <Avatar
                size="sm"
                name={`${user?.firstname} ${user?.name}`}
                src={user?.image}
                bg="brand.400"
                color="#000000"
              />
              <VStack
                spacing={0}
                alignItems="flex-start"
                display={{ base: 'none', md: 'flex' }}
              >
                <Text fontSize="sm" fontWeight="medium" lineHeight="short" color="white">
                  {user?.firstname} {user?.name}
                </Text>
                <Text fontSize="xs" color="gray.400" lineHeight="short">
                  {user?.role === 'superAdmin' ? 'Super Admin' : 'Admin'}
                </Text>
              </VStack>

              {/* Logout icon */}
              <Tooltip label="Logout" hasArrow>
                <IconButton
                  aria-label="Logout"
                  icon={<FiLogOut />}
                  variant="ghost"
                  borderRadius="full"
                  size="md"
                  bg="red.50"
                  color="red.500"
                  onClick={handleLogout}
                  _hover={{ bg: 'red.100' }}
                />
              </Tooltip>
            </HStack>
          </HStack>
        </Flex>
      </Box>

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bg="#000000">
          <DrawerCloseButton color="white" />
          <DrawerHeader borderBottomWidth="1px" borderColor="rgba(255,215,0,0.1)">
            <Logo size="sm" />
          </DrawerHeader>
          <DrawerBody p={4}>
            <VStack spacing={1} align="stretch">
              {items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <MobileNavLink
                    key={item.href}
                    item={item}
                    isActive={isActive}
                    onClick={onClose}
                  />
                );
              })}
              <Box pt={3} borderTop="1px solid" borderColor="rgba(255,215,0,0.1)" mt={2}>
                <LanguageSwitcher />
              </Box>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const { t } = useTranslation();
  return (
    <Box
      as={NextLink}
      href={item.href}
      display="flex"
      alignItems="center"
      px={4}
      py={2}
      borderRadius="full"
      bg={isActive ? '#FFD700' : 'transparent'}
      color={isActive ? '#000000' : 'gray.300'}
      fontWeight={isActive ? 'semibold' : 'medium'}
      fontSize="sm"
      transition="all 0.2s"
      _hover={{
        bg: isActive ? '#FFD700' : 'rgba(255,215,0,0.08)',
        color: isActive ? '#000000' : 'white',
      }}
    >
      <Icon as={item.icon} boxSize={4} mr={2} />
      <Text>{t(item.label)}</Text>
    </Box>
  );
}

function MobileNavLink({
  item,
  isActive,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Box
      as={NextLink}
      href={item.href}
      display="flex"
      alignItems="center"
      px={4}
      py={3}
      borderRadius="lg"
      bg={isActive ? '#FFD700' : 'transparent'}
      color={isActive ? '#000000' : 'white'}
      fontWeight={isActive ? 'semibold' : 'medium'}
      onClick={onClick}
      _hover={{ bg: isActive ? '#FFD700' : 'rgba(255,215,0,0.08)' }}
    >
      <Icon as={item.icon} boxSize={5} mr={3} />
      <Text>{t(item.label)}</Text>
    </Box>
  );
}

// Navigation configs
// Labels use translation keys from the `nav` namespace
export const adminNavItems: NavItem[] = [
  { label: 'nav.dashboard', href: '/admin/dashboard', icon: FiHome },
  { label: 'nav.cars', href: '/admin/cars', icon: FiTruck },
  { label: 'nav.rentals', href: '/admin/rentals', icon: FiCalendar },
  { label: 'nav.profile', href: '/admin/profile', icon: FiUser },
];

export const superAdminNavItems: NavItem[] = [
  { label: 'nav.dashboard', href: '/super-admin/dashboard', icon: FiHome },
  { label: 'nav.agencies', href: '/super-admin/agencies', icon: FiGrid },
  { label: 'nav.admins', href: '/super-admin/admins', icon: FiUsers },
  { label: 'nav.rentals', href: '/super-admin/rentals', icon: FiCalendar },
  { label: 'nav.profile', href: '/super-admin/profile', icon: FiUser },
];
