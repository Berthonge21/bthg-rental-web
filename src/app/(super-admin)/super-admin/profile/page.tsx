'use client';

import { useTranslation } from 'react-i18next';
import {
  Box,
  Heading,
  VStack,
  HStack,
  Avatar,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  SimpleGrid,
  useColorModeValue,
  useToast,
  Divider,
  IconButton,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/stores/auth.store';
import { api } from '@/lib/api';
import { useState, useRef, useEffect } from 'react';
import { FiCamera, FiX } from 'react-icons/fi';
import { readFileAsDataURL, validateImageFile } from '@/lib/imageUtils';
import { ProgressButton } from '@/components/ui/ProgressButton';

interface ProfileFormData {
  firstname: string;
  name: string;
  image?: string;
}

export default function ProfilePage() {
  const { t } = useTranslation();
  const toast = useToast();
  const { user, fetchUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | undefined>(user?.image);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cardBg = useColorModeValue('white', 'navy.700');
  const readOnlyBg = useColorModeValue('gray.50', 'navy.600');
  const subtleTextColor = useColorModeValue('gray.500', 'gray.400');

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    defaultValues: {
      firstname: user?.firstname || '',
      name: user?.name || '',
      image: user?.image || '',
    },
  });

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      reset({
        firstname: user.firstname || '',
        name: user.name || '',
        image: user.image || '',
      });
      setImagePreview(user.image);
    }
  }, [user, reset]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateImageFile(file);
    if (error) {
      toast({ title: 'Invalid file', description: error, status: 'error', duration: 4000 });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    try {
      const dataUrl = await readFileAsDataURL(file);
      setValue('image', dataUrl, { shouldDirty: true });
      setImagePreview(dataUrl);
    } catch {
      toast({ title: 'Failed to read file', status: 'error', duration: 3000 });
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveImage = () => {
    setImagePreview(undefined);
    setValue('image', '', { shouldDirty: true });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      await api.users.updateProfile(data);
      await fetchUser();
      toast({
        title: 'Profile updated',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Failed to update profile',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <Box mb={8}>
        <Box w="32px" h="2px" bg="brand.400" mb={3} borderRadius="full" />
        <Text fontSize="xs" fontWeight="bold" color="brand.400" textTransform="uppercase" letterSpacing="widest" mb={1}>
          Super Admin Panel
        </Text>
        <Text
          fontFamily="var(--font-display)"
          fontSize="3xl"
          fontWeight="black"
          letterSpacing="0.02em"
          textTransform="uppercase"
          color="gray.500"
        >
          {t('profile.title')}
        </Text>
        <Text fontSize="sm" color="gray.500" mt={1}>{t('profile.subtitle')}</Text>
      </Box>

      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
        {/* Profile Card */}
        <Box bg={cardBg} p={6} borderRadius="xl" boxShadow="sm" position="relative" overflow="hidden">
          <Box position="absolute" top={0} left={0} right={0} h="3px" bg="brand.400" borderTopRadius="xl" />
          <VStack spacing={4} pt={3}>
            <Box position="relative">
              <Avatar
                size="2xl"
                name={`${user?.firstname} ${user?.name}`}
                src={imagePreview}
                bg="brand.400"
              />
              <IconButton
                aria-label="Upload photo"
                icon={<FiCamera />}
                size="sm"
                colorScheme="brand"
                borderRadius="full"
                position="absolute"
                bottom={0}
                right={0}
                onClick={() => fileInputRef.current?.click()}
              />
              <input
                type="file"
                ref={fileInputRef}
                hidden
                accept="image/*"
                onChange={handleImageUpload}
              />
            </Box>
            {imagePreview && (
              <Button
                size="xs"
                variant="ghost"
                colorScheme="red"
                leftIcon={<FiX />}
                onClick={handleRemoveImage}
              >
                {t('profile.removePhoto')}
              </Button>
            )}
            <Text fontSize="xs" color={subtleTextColor} mt={1}>
              {t('profile.photoHint')}
            </Text>
            <VStack spacing={1}>
              <Text fontWeight="bold" fontSize="xl">
                {user?.firstname} {user?.name}
              </Text>
              <Text color={subtleTextColor}>{user?.email}</Text>
              <Text
                fontSize="sm"
                color="brand.500"
                fontWeight="medium"
                textTransform="capitalize"
              >
                {user?.role === 'superAdmin' ? 'Super Admin' : user?.role}
              </Text>
              {user?.agency && (
                <Text fontSize="sm" color={subtleTextColor}>
                  {user.agency.name}
                </Text>
              )}
            </VStack>
          </VStack>
        </Box>

        {/* Edit Form */}
        <Box
          bg={cardBg}
          p={6}
          borderRadius="xl"
          boxShadow="sm"
          gridColumn={{ lg: 'span 2' }}
        >
          <Heading size="md" mb={6} color="text.primary">
            {t('profile.editProfile')}
          </Heading>

          <form onSubmit={handleSubmit(onSubmit)}>
            <VStack spacing={6} align="stretch">
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel>{t('profile.firstName')}</FormLabel>
                  <Input {...register('firstname')} />
                </FormControl>

                <FormControl>
                  <FormLabel>{t('profile.lastName')}</FormLabel>
                  <Input {...register('name')} />
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <FormLabel>{t('profile.email')}</FormLabel>
                <Input value={user?.email || ''} isReadOnly bg={readOnlyBg} />
              </FormControl>

              <Divider />

              <HStack justify="flex-end">
                <ProgressButton
                  type="submit"
                  colorScheme="brand"
                  isLoading={isLoading}
                  isDisabled={!isDirty}
                >
                  {t('common.save')}
                </ProgressButton>
              </HStack>
            </VStack>
          </form>
        </Box>
      </SimpleGrid>
    </Box>
  );
}
