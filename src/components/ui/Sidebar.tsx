'use client';

import { usePathname } from 'next/navigation';
import NextLink from 'next/link';
import {
  Box,
  Flex,
  Icon,
  Text,
  VStack,
  Divider,
} from '@chakra-ui/react';
import {
  FiHome,
  FiTruck,
  FiCalendar,
  FiUser,
  FiUsers,
  FiGrid,
} from 'react-icons/fi';
import type { IconType } from 'react-icons';
import { Logo } from '@/components/ui/Logo';

interface NavItem {
  label: string;
  href: string;
  icon: IconType;
}

interface SidebarProps {
  items: NavItem[];
  brandName?: string;
}

export function Sidebar({ items, brandName = 'BTHG Rental' }: SidebarProps) {
  const pathname = usePathname();

  return (
    <Box
      as="nav"
      pos="fixed"
      left={0}
      top={0}
      h="100vh"
      w="240px"
      bg="#000000"
      borderRight="1px"
      borderColor="rgba(255,215,0,0.1)"
      py={6}
      display={{ base: 'none', lg: 'block' }}
    >
      {/* Brand */}
      <Flex px={6} mb={8} alignItems="center">
        <Logo size="sm" />
      </Flex>

      {/* Navigation */}
      <VStack spacing={1} align="stretch" px={3}>
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <NavLink key={item.href} item={item} isActive={isActive} />
          );
        })}
      </VStack>
    </Box>
  );
}

function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
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
      transition="all 0.2s"
      _hover={{
        bg: isActive ? '#FFD700' : 'rgba(255,215,0,0.08)',
      }}
    >
      <Icon as={item.icon} boxSize={5} mr={3} />
      <Text>{item.label}</Text>
    </Box>
  );
}

// Predefined navigation configs
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

export const clientNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: FiHome },
  { label: 'Browse Cars', href: '/cars', icon: FiTruck },
  { label: 'My Rentals', href: '/rentals', icon: FiCalendar },
  { label: 'Profile', href: '/profile', icon: FiUser },
];
