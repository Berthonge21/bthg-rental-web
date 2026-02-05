'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  Stack,
  Text,
  useToast,
  useColorModeValue,
  Icon,
  VStack,
  HStack,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiEye, FiEyeOff, FiTruck, FiLock, FiMail } from 'react-icons/fi';
import { useAuthStore } from '@/stores/auth.store';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const { loginAdmin, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const cardBg = useColorModeValue('white', 'gray.800');
  const inputBg = useColorModeValue('gray.50', 'gray.700');
  const textMuted = useColorModeValue('gray.500', 'gray.400');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await loginAdmin(data.email, data.password);
      const user = useAuthStore.getState().user;
      toast({
        title: user?.role === 'superAdmin' ? 'Welcome back, Super Admin!' : 'Welcome back, Admin!',
        status: 'success',
        duration: 3000,
      });
      if (user?.role === 'superAdmin') {
        router.push('/super-admin/dashboard');
      } else {
        router.push('/admin/dashboard');
      }
    } catch (error) {
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
      });
    }
  };

  return (
    <Box
      bg={cardBg}
      p={{ base: 6, md: 10 }}
      borderRadius="2xl"
      boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.25)"
      maxW="440px"
      w="full"
      border="1px solid"
      borderColor={useColorModeValue('gray.100', 'gray.700')}
    >
      <VStack spacing={8}>
        {/* Logo and Header */}
        <VStack spacing={4}>
          <Box
            w={16}
            h={16}
            bgGradient="linear(135deg, brand.500, mauve.500)"
            borderRadius="2xl"
            display="flex"
            alignItems="center"
            justifyContent="center"
            boxShadow="0 10px 40px rgba(99, 102, 241, 0.4)"
          >
            <Icon as={FiTruck} color="white" boxSize={8} />
          </Box>
          <VStack spacing={1}>
            <Heading
              size="lg"
              bgGradient="linear(to-r, brand.500, mauve.500)"
              bgClip="text"
            >
              BTHG Rental
            </Heading>
            <Text color={textMuted} textAlign="center">
              Sign in to access the admin portal
            </Text>
          </VStack>
        </VStack>

        {/* Login Form */}
        <Box as="form" onSubmit={handleSubmit(onSubmit)} w="full">
          <Stack spacing={5}>
            <FormControl isInvalid={!!errors.email}>
              <FormLabel fontWeight="medium" fontSize="sm">
                Email Address
              </FormLabel>
              <InputGroup>
                <Input
                  type="email"
                  placeholder="admin@example.com"
                  bg={inputBg}
                  border="1px solid"
                  borderColor={useColorModeValue('gray.200', 'gray.600')}
                  borderRadius="xl"
                  py={6}
                  pl={12}
                  _focus={{
                    borderColor: 'brand.500',
                    boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
                  }}
                  _placeholder={{ color: 'gray.400' }}
                  {...register('email')}
                />
                <Box
                  position="absolute"
                  left={4}
                  top="50%"
                  transform="translateY(-50%)"
                  zIndex={2}
                >
                  <Icon as={FiMail} color="gray.400" boxSize={5} />
                </Box>
              </InputGroup>
              <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.password}>
              <FormLabel fontWeight="medium" fontSize="sm">
                Password
              </FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  bg={inputBg}
                  border="1px solid"
                  borderColor={useColorModeValue('gray.200', 'gray.600')}
                  borderRadius="xl"
                  py={6}
                  pl={12}
                  _focus={{
                    borderColor: 'brand.500',
                    boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
                  }}
                  _placeholder={{ color: 'gray.400' }}
                  {...register('password')}
                />
                <Box
                  position="absolute"
                  left={4}
                  top="50%"
                  transform="translateY(-50%)"
                  zIndex={2}
                >
                  <Icon as={FiLock} color="gray.400" boxSize={5} />
                </Box>
                <InputRightElement h="full" pr={2}>
                  <IconButton
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    icon={showPassword ? <FiEyeOff /> : <FiEye />}
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    color="gray.400"
                    _hover={{ color: 'brand.500' }}
                  />
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
            </FormControl>

            <Button
              type="submit"
              size="lg"
              w="full"
              bgGradient="linear(135deg, brand.500, mauve.500)"
              color="white"
              borderRadius="xl"
              py={7}
              fontWeight="semibold"
              isLoading={isLoading}
              loadingText="Signing in..."
              _hover={{
                bgGradient: 'linear(135deg, brand.600, mauve.600)',
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 40px rgba(99, 102, 241, 0.4)',
              }}
              _active={{
                transform: 'translateY(0)',
              }}
              transition="all 0.2s"
            >
              Sign In
            </Button>
          </Stack>
        </Box>

        {/* Footer */}
        <VStack spacing={2}>
          <Text textAlign="center" fontSize="sm" color={textMuted}>
            This portal is for agency administrators only.
          </Text>
          <HStack spacing={1} fontSize="xs" color={textMuted}>
            <Text>Powered by</Text>
            <Text fontWeight="semibold" bgGradient="linear(to-r, brand.500, mauve.500)" bgClip="text">
              BTHG Rental
            </Text>
          </HStack>
        </VStack>
      </VStack>
    </Box>
  );
}
