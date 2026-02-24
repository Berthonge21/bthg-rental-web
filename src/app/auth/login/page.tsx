'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import NextLink from 'next/link';
import { ProgressButton } from '@/components/ui/ProgressButton';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  InputGroup,
  InputRightElement,
  InputLeftElement,
  IconButton,
  Stack,
  Text,
  Link,
  useToast,
  Icon,
  VStack,
  HStack,
  Alert,
  AlertIcon,
  AlertDescription,
  Center,
  Spinner,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiEye, FiEyeOff, FiLock, FiMail, FiRefreshCw } from 'react-icons/fi';
import { useAuthStore } from '@/stores/auth.store';
import type { DeactivationErrorResponse } from '@berthonge21/sdk';
import { ApiError } from '@berthonge21/sdk';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

function getDeactivationError(error: unknown): DeactivationErrorResponse | null {
  if (error instanceof ApiError && error.originalError) {
    const data = error.originalError.response?.data as Record<string, unknown> | undefined;
    if (data && data.code === 'ACCOUNT_DEACTIVATED') {
      return data as unknown as DeactivationErrorResponse;
    }
  }
  return null;
}

interface DeactivationState {
  message: string;
  canReactivate: boolean;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const { login, reactivateAccount, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isReactivating, setIsReactivating] = useState(false);
  const [deactivation, setDeactivation] = useState<DeactivationState | null>(null);

  const redirectTo = searchParams.get('redirect') || null;

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setDeactivation(null);
    try {
      await login(data.email, data.password);

      toast({ title: 'Welcome back!', status: 'success', duration: 3000 });

      // Get role from store after login
      const user = useAuthStore.getState().user;

      // Role-based redirect
      if (user?.role === 'superAdmin') {
        router.push('/super-admin/dashboard');
        return;
      }
      if (user?.role === 'admin') {
        router.push('/admin/dashboard');
        return;
      }


      // Client -- restore booking intent or go to redirect/default
      const intentRaw = sessionStorage.getItem('bthg-booking-intent');
      if (intentRaw && !redirectTo) {
        try {
          const intent = JSON.parse(intentRaw);
          if (intent.carId) {
            router.push(`/cars/${intent.carId}?book=true`);
            return;
          }
        } catch { /* ignore */ }
      }

      router.push(redirectTo ?? '/');
    } catch (error) {
      const deactivationError = getDeactivationError(error);
      if (deactivationError) {
        setDeactivation({
          message: deactivationError.selfDeactivated
            ? 'Your account has been deactivated. You can reactivate it below.'
            : 'Your account has been deactivated by an administrator. Please contact support.',
          canReactivate: !!deactivationError.selfDeactivated,
        });
        return;
      }

      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'Invalid email or password',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleReactivate = async () => {
    const { email, password } = getValues();
    setIsReactivating(true);
    try {
      await reactivateAccount(email, password);
      toast({
        title: 'Account reactivated',
        description: 'Welcome back!',
        status: 'success',
        duration: 4000,
      });
      setDeactivation(null);
      router.push(redirectTo ?? '/');
    } catch (error) {
      toast({
        title: 'Reactivation failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsReactivating(false);
    }
  };

  return (
    <Box
      w="full"
      maxW="420px"
      bg="rgba(0,0,0,0.85)"
      borderRadius="2xl"
      overflow="hidden"
      position="relative"
      border="1px solid"
      borderColor="rgba(255,215,0,0.15)"
      boxShadow="0 24px 60px rgba(0,0,0,0.5)"
    >
      {/* Gold top accent bar */}
      <Box h="4px" bg="brand.400" />

      <VStack spacing={6} p={8}>
        {/* Header */}
        <VStack spacing={1} w="full">
          <Text
            fontFamily="var(--font-display)"
            fontSize="3xl"
            letterSpacing="0.04em"
            color="white"
            textTransform="uppercase"
          >
            Sign In
          </Text>
          <Text color="gray.400" fontSize="sm">
            Works for clients, admins &amp; super admins
          </Text>
        </VStack>

        {/* Deactivation Alert */}
        {deactivation && (
          <Alert
            status={deactivation.canReactivate ? 'warning' : 'error'}
            borderRadius="lg"
            variant="left-accent"
            flexDirection="column"
            alignItems="flex-start"
          >
            <HStack mb={deactivation.canReactivate ? 2 : 0}>
              <AlertIcon />
              <AlertDescription fontSize="sm">{deactivation.message}</AlertDescription>
            </HStack>
            {deactivation.canReactivate && (
              <Button
                size="sm"
                colorScheme="brand"
                leftIcon={<FiRefreshCw />}
                onClick={handleReactivate}
                isLoading={isReactivating}
                loadingText="Reactivating..."
                ml={8}
              >
                Reactivate Account
              </Button>
            )}
          </Alert>
        )}

        {/* Form */}
        <Box as="form" onSubmit={handleSubmit(onSubmit)} w="full">
          <Stack spacing={4}>
            <FormControl isInvalid={!!errors.email}>
              <FormLabel fontWeight="medium" fontSize="sm" color="white">
                Email Address
              </FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none" h="full">
                  <Icon as={FiMail} color="gray.500" />
                </InputLeftElement>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  borderRadius="lg"
                  h={12}
                  pl={10}
                  bg="#0a0a0a"
                  color="white"
                  border="1px solid"
                  borderColor="rgba(255,215,0,0.15)"
                  _focus={{ borderColor: 'brand.400', boxShadow: '0 0 0 1px #FFD700' }}
                  _placeholder={{ color: 'gray.500' }}
                  {...register('email')}
                />
              </InputGroup>
              <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.password}>
              <FormLabel fontWeight="medium" fontSize="sm" color="white">
                Password
              </FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none" h="full">
                  <Icon as={FiLock} color="gray.500" />
                </InputLeftElement>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  borderRadius="lg"
                  h={12}
                  pl={10}
                  bg="#0a0a0a"
                  color="white"
                  border="1px solid"
                  borderColor="rgba(255,215,0,0.15)"
                  _focus={{ borderColor: 'brand.400', boxShadow: '0 0 0 1px #FFD700' }}
                  _placeholder={{ color: 'gray.500' }}
                  {...register('password')}
                />
                <InputRightElement h="full" pr={1}>
                  <IconButton
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    icon={showPassword ? <FiEyeOff /> : <FiEye />}
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    color="gray.500"
                    _hover={{ color: 'brand.400' }}
                  />
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
            </FormControl>

            <ProgressButton
              type="submit"
              size="lg"
              w="full"
              bg="brand.400"
              color="#000000"
              borderRadius="lg"
              h={12}
              fontWeight="semibold"
              isLoading={isLoading}
              _hover={{ bg: 'lightGold.400' }}
            >
              Sign In
            </ProgressButton>
          </Stack>
        </Box>

        {/* Footer links */}
        <VStack spacing={2} w="full">
          <Text textAlign="center" fontSize="sm" color="gray.400">
            New client?{' '}
            <Link as={NextLink} href="/register" color="brand.400" fontWeight="semibold">
              Create an account
            </Link>
          </Text>
          <Text textAlign="center" fontSize="xs" color="gray.500">
            Admins are created by the super admin
          </Text>
        </VStack>
      </VStack>
    </Box>
  );
}

export default function UnifiedLoginPage() {
  return (
    <Suspense fallback={<Center><Spinner size="xl" color="brand.400" thickness="4px" /></Center>}>
      <LoginForm />
    </Suspense>
  );
}
