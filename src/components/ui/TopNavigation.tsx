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
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Avatar,
  Button,
  useColorMode,
  useColorModeValue,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  VStack,
  InputGroup,
  InputLeftElement,
  Input,
  Badge,
  Tooltip,
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
  FiSearch,
  FiLogOut,
  FiSettings,
  FiChevronDown,
} from 'react-icons/fi';
import type { IconType } from 'react-icons';
import { useAuthStore } from '@/stores/auth.store';

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
  const pathname = usePathname();
  const { colorMode, toggleColorMode } = useColorMode();
  const { user, logout } = useAuthStore();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const bgColor = useColorModeValue('white', 'gray.900');
  const borderColor = useColorModeValue('gray.100', 'gray.800');
  const glassBg = useColorModeValue(
    'rgba(255, 255, 255, 0.9)',
    'rgba(15, 23, 42, 0.9)'
  );

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
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
        bg={glassBg}
        backdropFilter="blur(20px)"
        borderBottom="1px"
        borderColor={borderColor}
        px={{ base: 4, md: 6 }}
        py={3}
      >
        <Flex align="center" justify="space-between" maxW="1600px" mx="auto">
          {/* Left: Brand + Navigation */}
          <HStack spacing={8}>
            {/* Mobile Menu Button */}
            <IconButton
              aria-label="Open menu"
              icon={<FiMenu />}
              variant="ghost"
              display={{ base: 'flex', lg: 'none' }}
              onClick={onOpen}
            />

            {/* Brand Logo */}
            <HStack spacing={3} as={NextLink} href="/admin/dashboard">
              <Box
                w={10}
                h={10}
                bgGradient="linear(135deg, brand.500, mauve.500)"
                borderRadius="xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
                boxShadow="0 4px 14px rgba(99, 102, 241, 0.4)"
              >
                <Icon as={FiTruck} color="white" boxSize={5} />
              </Box>
              <Text
                fontSize="xl"
                fontWeight="bold"
                bgGradient="linear(135deg, brand.500, mauve.500)"
                bgClip="text"
                display={{ base: 'none', md: 'block' }}
              >
                {brandName}
              </Text>
            </HStack>

            {/* Desktop Navigation Links */}
            <HStack spacing={1} display={{ base: 'none', lg: 'flex' }}>
              {items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <NavLink key={item.href} item={item} isActive={isActive} />
                );
              })}
            </HStack>
          </HStack>

          {/* Right: Search, Notifications, User */}
          <HStack spacing={3}>
            {/* Search - Desktop only */}
            <InputGroup maxW="250px" display={{ base: 'none', xl: 'flex' }}>
              <InputLeftElement>
                <Icon as={FiSearch} color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search..."
                variant="filled"
                borderRadius="full"
                bg={useColorModeValue('gray.100', 'gray.800')}
                _hover={{ bg: useColorModeValue('gray.200', 'gray.700') }}
                _focus={{ bg: useColorModeValue('white', 'gray.800'), borderColor: 'brand.500' }}
              />
            </InputGroup>

            {/* Notifications */}
            <Tooltip label="Notifications" hasArrow>
              <IconButton
                aria-label="Notifications"
                icon={
                  <Box position="relative">
                    <FiBell />
                    <Badge
                      position="absolute"
                      top="-8px"
                      right="-8px"
                      colorScheme="red"
                      variant="solid"
                      borderRadius="full"
                      fontSize="xs"
                      minW={4}
                      h={4}
                    >
                      3
                    </Badge>
                  </Box>
                }
                variant="ghost"
                borderRadius="full"
              />
            </Tooltip>

            {/* Color Mode Toggle */}
            <Tooltip label={colorMode === 'light' ? 'Dark mode' : 'Light mode'} hasArrow>
              <IconButton
                aria-label="Toggle color mode"
                icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
                variant="ghost"
                borderRadius="full"
                onClick={toggleColorMode}
              />
            </Tooltip>

            {/* User Menu */}
            <Menu>
              <MenuButton
                as={Button}
                variant="ghost"
                borderRadius="full"
                px={2}
                _hover={{ bg: useColorModeValue('gray.100', 'gray.800') }}
              >
                <HStack spacing={3}>
                  <Avatar
                    size="sm"
                    name={`${user?.firstname} ${user?.name}`}
                    bg="linear-gradient(135deg, #6366f1, #d946ef)"
                  />
                  <VStack
                    spacing={0}
                    alignItems="flex-start"
                    display={{ base: 'none', md: 'flex' }}
                  >
                    <Text fontSize="sm" fontWeight="semibold" lineHeight="short">
                      {user?.firstname} {user?.name}
                    </Text>
                    <Text fontSize="xs" color="gray.500" lineHeight="short">
                      {user?.role === 'superAdmin' ? 'Super Admin' : 'Admin'}
                    </Text>
                  </VStack>
                  <Icon as={FiChevronDown} display={{ base: 'none', md: 'block' }} />
                </HStack>
              </MenuButton>
              <MenuList>
                <MenuItem icon={<FiUser />} as={NextLink} href="/admin/profile">
                  My Profile
                </MenuItem>
                <MenuItem icon={<FiSettings />}>
                  Settings
                </MenuItem>
                <MenuDivider />
                <MenuItem icon={<FiLogOut />} onClick={handleLogout} color="red.500">
                  Logout
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Flex>
      </Box>

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            <HStack spacing={3}>
              <Box
                w={8}
                h={8}
                bgGradient="linear(135deg, brand.500, mauve.500)"
                borderRadius="lg"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon as={FiTruck} color="white" boxSize={4} />
              </Box>
              <Text fontWeight="bold" bgGradient="linear(135deg, brand.500, mauve.500)" bgClip="text">
                {brandName}
              </Text>
            </HStack>
          </DrawerHeader>
          <DrawerBody p={4}>
            <VStack spacing={2} align="stretch">
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
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const activeBg = useColorModeValue('brand.50', 'brand.900');
  const activeColor = useColorModeValue('brand.600', 'brand.200');
  const hoverBg = useColorModeValue('gray.100', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  return (
    <Box
      as={NextLink}
      href={item.href}
      display="flex"
      alignItems="center"
      px={4}
      py={2}
      borderRadius="full"
      bg={isActive ? activeBg : 'transparent'}
      color={isActive ? activeColor : textColor}
      fontWeight={isActive ? 'semibold' : 'medium'}
      fontSize="sm"
      transition="all 0.2s"
      position="relative"
      _hover={{
        bg: isActive ? activeBg : hoverBg,
        color: isActive ? activeColor : 'brand.500',
      }}
      _after={isActive ? {
        content: '""',
        position: 'absolute',
        bottom: '-12px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '20px',
        height: '3px',
        bgGradient: 'linear(to-r, brand.500, mauve.500)',
        borderRadius: 'full',
      } : undefined}
    >
      <Icon as={item.icon} boxSize={4} mr={2} />
      <Text>{item.label}</Text>
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
  const activeBg = useColorModeValue('brand.50', 'brand.900');
  const activeColor = useColorModeValue('brand.600', 'brand.200');

  return (
    <Box
      as={NextLink}
      href={item.href}
      display="flex"
      alignItems="center"
      px={4}
      py={3}
      borderRadius="xl"
      bg={isActive ? activeBg : 'transparent'}
      color={isActive ? activeColor : undefined}
      fontWeight={isActive ? 'semibold' : 'medium'}
      onClick={onClick}
      _hover={{ bg: activeBg }}
    >
      <Icon as={item.icon} boxSize={5} mr={3} />
      <Text>{item.label}</Text>
    </Box>
  );
}

// Navigation configs
export const adminNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: FiHome },
  { label: 'Cars', href: '/admin/cars', icon: FiTruck },
  { label: 'Rentals', href: '/admin/rentals', icon: FiCalendar },
  { label: 'Profile', href: '/admin/profile', icon: FiUser },
];

export const superAdminNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/super-admin/dashboard', icon: FiHome },
  { label: 'Agencies', href: '/super-admin/agencies', icon: FiGrid },
  { label: 'Admins', href: '/super-admin/admins', icon: FiUsers },
  { label: 'Rentals', href: '/super-admin/rentals', icon: FiCalendar },
  { label: 'Profile', href: '/super-admin/profile', icon: FiUser },
];
