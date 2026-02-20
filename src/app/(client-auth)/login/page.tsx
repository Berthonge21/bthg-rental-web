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
  Heading,
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
import type { DeactivationErrorResponse } from '@bthgrentalcar/sdk';
import { ApiError } from '@bthgrentalcar/sdk';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

/** Extract deactivation error data from an ApiError if present */
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

  const redirectTo = searchParams.get('redirect') || '/';

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
      toast({
        title: 'Welcome back!',
        status: 'success',
        duration: 3000,
      });
      router.push(redirectTo);
    } catch (error) {
      const deactivationError = getDeactivationError(error);

      if (deactivationError) {
        if (deactivationError.selfDeactivated) {
          setDeactivation({
            message:
              'Your account has been deactivated. You can reactivate it by clicking the button below.',
            canReactivate: true,
          });
        } else {
          setDeactivation({
            message:
              'Your account has been deactivated by an administrator. Please contact support for assistance.',
            canReactivate: false,
          });
        }
        return;
      }

      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'An error occurred',
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
        description: 'Welcome back! Your account has been successfully reactivated.',
        status: 'success',
        duration: 4000,
      });
      setDeactivation(null);
      router.push(redirectTo);
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
      maxW="420px"
      w="full"
      bg="white"
      borderRadius="2xl"
      p={8}
      boxShadow="2xl"
      overflow="hidden"
      position="relative"
    >
      {/* Top accent strip */}
      <Box
        h="4px"
        bg="brand.400"
        position="absolute"
        top={0}
        left={0}
        right={0}
      />

      <VStack spacing={6}>
        {/* Header */}
        <VStack spacing={1}>
          <Heading size="lg" color="navy.800">
            Welcome Back
          </Heading>
          <Text color="gray.500" fontSize="sm">
            Sign in to your BTHG account
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

        {/* Login Form */}
        <Box as="form" onSubmit={handleSubmit(onSubmit)} w="full">
          <Stack spacing={4}>
            <FormControl isInvalid={!!errors.email}>
              <FormLabel fontWeight="medium" fontSize="sm" color="navy.800">
                Email Address
              </FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none" h="full">
                  <Icon as={FiMail} color="gray.400" />
                </InputLeftElement>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  bg="white"
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="lg"
                  h={12}
                  pl={10}
                  _focus={{
                    borderColor: 'brand.400',
                    boxShadow: '0 0 0 1px var(--chakra-colors-brand-400)',
                  }}
                  _placeholder={{ color: 'gray.400' }}
                  {...register('email')}
                />
              </InputGroup>
              <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.password}>
              <FormLabel fontWeight="medium" fontSize="sm" color="navy.800">
                Password
              </FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none" h="full">
                  <Icon as={FiLock} color="gray.400" />
                </InputLeftElement>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  bg="white"
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="lg"
                  h={12}
                  pl={10}
                  _focus={{
                    borderColor: 'brand.400',
                    boxShadow: '0 0 0 1px var(--chakra-colors-brand-400)',
                  }}
                  _placeholder={{ color: 'gray.400' }}
                  {...register('password')}
                />
                <InputRightElement h="full" pr={1}>
                  <IconButton
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    icon={showPassword ? <FiEyeOff /> : <FiEye />}
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    color="gray.400"
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
              color="white"
              borderRadius="lg"
              h={12}
              fontWeight="semibold"
              isLoading={isLoading}
              _hover={{ bg: 'brand.500' }}
              _active={{ bg: 'brand.600' }}
            >
              Sign In
            </ProgressButton>
          </Stack>
        </Box>

        {/* Footer */}
        <Text textAlign="center" fontSize="sm" color="gray.500">
          Don&apos;t have an account?{' '}
          <Link as={NextLink} href="/register" color="brand.400" fontWeight="medium">
            Sign up
          </Link>
        </Text>
      </VStack>
    </Box>
  );
}

export default function ClientLoginPage() {
  return (
    <Suspense
      fallback={
        <Center>
          <Spinner size="xl" color="brand.400" thickness="4px" />
        </Center>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
