'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Flex,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  useDisclosure,
  useColorModeValue,
  VStack,
  Icon,
  Text,
} from '@chakra-ui/react';
import { FiTruck } from 'react-icons/fi';
import { useAuthStore } from '@/stores/auth.store';
import { Sidebar, superAdminNavItems, Navbar } from '@/components/ui';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import NextLink from 'next/link';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  const bgColor = useColorModeValue('gray.50', 'gray.900');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || isLoading) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.role !== 'superAdmin') {
      router.push('/admin/dashboard');
    }
  }, [isAuthenticated, user, isLoading, mounted, router]);

  if (!mounted || isLoading) {
    return <LoadingSpinner fullPage />;
  }

  if (!isAuthenticated || user?.role !== 'superAdmin') {
    return <LoadingSpinner fullPage />;
  }

  return (
    <Box minH="100vh" bg={bgColor}>
      {/* Sidebar - Desktop */}
      <Sidebar items={superAdminNavItems} brandName="BTHG Admin" />

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            <Flex alignItems="center">
              <Box
                w={8}
                h={8}
                bg="brand.400"
                borderRadius="lg"
                display="flex"
                alignItems="center"
                justifyContent="center"
                mr={2}
              >
                <Icon as={FiTruck} color="white" boxSize={4} />
              </Box>
              <Text fontWeight="bold" color="brand.400">
                BTHG Admin
              </Text>
            </Flex>
          </DrawerHeader>
          <DrawerBody p={0}>
            <VStack spacing={1} align="stretch" p={3} mt={4}>
              {superAdminNavItems.map((item) => (
                <Box
                  key={item.href}
                  as={NextLink}
                  href={item.href}
                  display="flex"
                  alignItems="center"
                  px={4}
                  py={3}
                  borderRadius="lg"
                  _hover={{ bg: 'gray.100' }}
                  onClick={onClose}
                >
                  <Icon as={item.icon} boxSize={5} mr={3} />
                  <Text>{item.label}</Text>
                </Box>
              ))}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Main content */}
      <Box ml={{ base: 0, lg: '240px' }}>
        <Navbar onMenuClick={onOpen} />
        <Box as="main" p={6}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
