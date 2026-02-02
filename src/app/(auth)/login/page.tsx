'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';
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
  Link,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  useToast,
  useColorModeValue,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuthStore } from '@/stores/auth.store';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const { login, loginAdmin, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);

  const cardBg = useColorModeValue('white', 'gray.800');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      if (tabIndex === 0) {
        await login(data.email, data.password);
        toast({
          title: 'Welcome back!',
          status: 'success',
          duration: 3000,
        });
        router.push('/dashboard');
      } else {
        await loginAdmin(data.email, data.password);
        // Get the user from the store after login
        const user = useAuthStore.getState().user;
        toast({
          title: user?.role === 'superAdmin' ? 'Welcome back, Super Admin!' : 'Welcome back, Admin!',
          status: 'success',
          duration: 3000,
        });
        // Redirect based on role
        if (user?.role === 'superAdmin') {
          router.push('/super-admin/dashboard');
        } else {
          router.push('/admin/dashboard');
        }
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
    <Box bg={cardBg} p={8} borderRadius="xl" boxShadow="lg">
      <Stack spacing={6}>
        <Box textAlign="center">
          <Heading size="lg" mb={2}>
            Welcome Back
          </Heading>
          <Text color="gray.500">Sign in to your account</Text>
        </Box>

        <Tabs
          index={tabIndex}
          onChange={setTabIndex}
          variant="soft-rounded"
          colorScheme="brand"
        >
          <TabList mb={4}>
            <Tab flex={1}>Client</Tab>
            <Tab flex={1}>Admin</Tab>
          </TabList>

          <TabPanels>
            <TabPanel p={0}>
              <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={4}>
                  <FormControl isInvalid={!!errors.email}>
                    <FormLabel>Email</FormLabel>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      {...register('email')}
                    />
                    <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!errors.password}>
                    <FormLabel>Password</FormLabel>
                    <InputGroup>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        {...register('password')}
                      />
                      <InputRightElement>
                        <IconButton
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          icon={showPassword ? <FiEyeOff /> : <FiEye />}
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowPassword(!showPassword)}
                        />
                      </InputRightElement>
                    </InputGroup>
                    <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="brand"
                    size="lg"
                    w="full"
                    isLoading={isLoading}
                  >
                    Sign In
                  </Button>
                </Stack>
              </form>
            </TabPanel>

            <TabPanel p={0}>
              <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={4}>
                  <FormControl isInvalid={!!errors.email}>
                    <FormLabel>Email</FormLabel>
                    <Input
                      type="email"
                      placeholder="Enter admin email"
                      {...register('email')}
                    />
                    <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!errors.password}>
                    <FormLabel>Password</FormLabel>
                    <InputGroup>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        {...register('password')}
                      />
                      <InputRightElement>
                        <IconButton
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          icon={showPassword ? <FiEyeOff /> : <FiEye />}
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowPassword(!showPassword)}
                        />
                      </InputRightElement>
                    </InputGroup>
                    <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="brand"
                    size="lg"
                    w="full"
                    isLoading={isLoading}
                  >
                    Admin Sign In
                  </Button>
                </Stack>
              </form>
            </TabPanel>
          </TabPanels>
        </Tabs>

        <Text textAlign="center" color="gray.500">
          Don&apos;t have an account?{' '}
          <Link as={NextLink} href="/register" color="brand.400" fontWeight="medium">
            Sign up
          </Link>
        </Text>
      </Stack>
    </Box>
  );
}
