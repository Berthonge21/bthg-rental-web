'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Alert, AlertDescription, AlertIcon, Avatar, Box, Button, Divider,
  FormControl, FormLabel, HStack, Heading, IconButton, Input,
  SimpleGrid, Text, VStack, useColorModeValue, useDisclosure, useToast,
} from '@chakra-ui/react';
import { FiCamera, FiX, FiAlertTriangle } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/stores/auth.store';
import { api } from '@/lib/api';
import { ProgressButton } from '@/components/ui/ProgressButton';
import { ConfirmDialog } from '@/components/ui';
import { readFileAsDataURL, validateImageFile } from '@/lib/imageUtils';
import { useTranslation } from 'react-i18next';

interface ProfileFormData {
  firstname: string;
  name: string;
  telephone: string;
  address: string;
  city: string;
  image?: string;
}

export default function ClientProfilePage() {
  const { t } = useTranslation();
  const toast = useToast();
  const router = useRouter();
  const { user, fetchUser, deactivateAccount } = useAuthStore();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | undefined>(user?.image);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const deactivateDialog = useDisclosure();

  const cardBg = useColorModeValue('white', '#080808');
  const cardBorder = useColorModeValue('gray.100', 'rgba(255,215,0,0.08)');
  const textMuted = useColorModeValue('text.muted', 'gray.400');
  const dangerBg = useColorModeValue('red.50', 'rgba(254, 178, 178, 0.06)');
  const dangerBorder = useColorModeValue('red.200', 'red.800');

  const { register, handleSubmit, reset, setValue, formState: { isDirty } } = useForm<ProfileFormData>({
    defaultValues: {
      firstname: user?.firstname ?? '',
      name: user?.name ?? '',
      telephone: user?.telephone ?? '',
      address: user?.address ?? '',
      city: user?.city ?? '',
      image: user?.image ?? '',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        firstname: user.firstname ?? '',
        name: user.name ?? '',
        telephone: user.telephone ?? '',
        address: user.address ?? '',
        city: user.city ?? '',
        image: user.image ?? '',
      });
      setImagePreview(user.image);
    }
  }, [user, reset]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const error = validateImageFile(file);
    if (error) {
      toast({ title: t('profile.invalidFile'), description: error, status: 'error', duration: 4000 });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    try {
      const dataUrl = await readFileAsDataURL(file);
      setValue('image', dataUrl, { shouldDirty: true });
      setImagePreview(dataUrl);
    } catch {
      toast({ title: t('profile.failedToReadFile'), status: 'error', duration: 3000 });
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveImage = () => {
    setImagePreview(undefined);
    setValue('image', '', { shouldDirty: true });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);
    try {
      await api.users.updateProfile(data);
      await fetchUser();
      toast({ title: t('profile.profileUpdated'), status: 'success', duration: 3000 });
    } catch (err) {
      toast({ title: t('profile.failedToUpdate'), description: err instanceof Error ? err.message : 'An error occurred', status: 'error', duration: 5000 });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivate = async () => {
    setIsDeactivating(true);
    try {
      await deactivateAccount();
      toast({ title: t('profile.accountDeactivated'), description: t('profile.accountDeactivatedDesc'), status: 'info', duration: 5000 });
      router.push('/auth/login');
    } catch (err) {
      toast({ title: t('profile.failedToDeactivate'), description: err instanceof Error ? err.message : 'An error occurred', status: 'error', duration: 5000 });
    } finally {
      setIsDeactivating(false);
      deactivateDialog.onClose();
    }
  };

  return (
    <Box>
      <Box mb={8}>
        <Box w="32px" h="2px" bg="brand.400" mb={3} borderRadius="full" />
        <Text
          fontFamily="var(--font-display)"
          fontSize="3xl"
          fontWeight="black"
          letterSpacing="0.02em"
          textTransform="uppercase"
          color="white"
        >
          {t('profile.title')}
        </Text>
        <Text fontSize="sm" color="gray.500" mt={1}>{t('profile.subtitle')}</Text>
      </Box>

      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
        {/* Avatar card */}
        <Box bg={cardBg} border="1px" borderColor={cardBorder} borderRadius="2xl" p={6} position="relative" overflow="hidden">
          {/* Subtle gold top accent */}
          <Box position="absolute" top={0} left={0} right={0} h="3px" bg="brand.400" borderTopRadius="2xl" />
          <VStack spacing={4} pt={3}>
            <Box position="relative">
              <Avatar size="2xl" name={`${user?.firstname} ${user?.name}`} src={imagePreview} bg="brand.400" />
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
              <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageUpload} />
            </Box>
            {imagePreview && (
              <Button size="xs" variant="ghost" colorScheme="red" leftIcon={<FiX />} onClick={handleRemoveImage}>
                {t('profile.removePhoto')}
              </Button>
            )}
            <Text fontSize="xs" color={textMuted}>{t('profile.updatePhotoHint')}</Text>
            <VStack spacing={1}>
              <Text fontWeight="bold" fontSize="xl">{user?.firstname} {user?.name}</Text>
              <Text color={textMuted} fontSize="sm">{user?.email}</Text>
            </VStack>
          </VStack>
        </Box>

        {/* Edit form */}
        <Box bg={cardBg} border="1px" borderColor={cardBorder} borderRadius="2xl" p={6} gridColumn={{ lg: 'span 2' }}>
          <Text fontFamily="var(--font-display)" fontSize="xl" fontWeight="black" letterSpacing="0.03em" textTransform="uppercase" color="white" mb={6}>
            {t('profile.editProfile')}
          </Text>
          <form onSubmit={handleSubmit(onSubmit)}>
            <VStack spacing={4} align="stretch">
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel fontSize="sm">{t('profile.firstName')}</FormLabel>
                  <Input {...register('firstname')} borderRadius="lg" borderColor="rgba(255,215,0,0.12)" _focus={{ borderColor: 'brand.400', boxShadow: '0 0 0 1px #FFD700' }} _hover={{ borderColor: 'rgba(255,215,0,0.25)' }} />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">{t('profile.lastName')}</FormLabel>
                  <Input {...register('name')} borderRadius="lg" borderColor="rgba(255,215,0,0.12)" _focus={{ borderColor: 'brand.400', boxShadow: '0 0 0 1px #FFD700' }} _hover={{ borderColor: 'rgba(255,215,0,0.25)' }} />
                </FormControl>
              </SimpleGrid>
              <FormControl>
                <FormLabel fontSize="sm">{t('profile.email')}</FormLabel>
                <Input value={user?.email ?? ''} isReadOnly bg={useColorModeValue('gray.50', 'navy.600')} borderRadius="lg" />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">{t('profile.phone')}</FormLabel>
                <Input {...register('telephone')} borderRadius="lg" type="tel" borderColor="rgba(255,215,0,0.12)" _focus={{ borderColor: 'brand.400', boxShadow: '0 0 0 1px #FFD700' }} _hover={{ borderColor: 'rgba(255,215,0,0.25)' }} />
              </FormControl>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel fontSize="sm">{t('profile.address')}</FormLabel>
                  <Input {...register('address')} borderRadius="lg" borderColor="rgba(255,215,0,0.12)" _focus={{ borderColor: 'brand.400', boxShadow: '0 0 0 1px #FFD700' }} _hover={{ borderColor: 'rgba(255,215,0,0.25)' }} />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">{t('profile.city')}</FormLabel>
                  <Input {...register('city')} borderRadius="lg" borderColor="rgba(255,215,0,0.12)" _focus={{ borderColor: 'brand.400', boxShadow: '0 0 0 1px #FFD700' }} _hover={{ borderColor: 'rgba(255,215,0,0.25)' }} />
                </FormControl>
              </SimpleGrid>
              <Divider />
              <HStack justify="flex-end">
                <ProgressButton type="submit" colorScheme="brand" isLoading={isSaving} isDisabled={!isDirty}>
                  {t('common.save')}
                </ProgressButton>
              </HStack>
            </VStack>
          </form>
        </Box>
      </SimpleGrid>

      {/* Danger Zone */}
      <Box mt={8} p={6} bg={dangerBg} borderRadius="2xl" border="1px solid" borderColor={dangerBorder}>
        <HStack spacing={3} mb={3}>
          <Box color="red.500"><FiAlertTriangle size={20} /></Box>
          <Heading size="md" color="red.500">{t('profile.dangerZone')}</Heading>
        </HStack>
        <Text color={textMuted} fontSize="sm" mb={4}>
          {t('profile.deactivateWarningClient')}
        </Text>
        <Button colorScheme="red" variant="outline" leftIcon={<FiAlertTriangle />} onClick={deactivateDialog.onOpen}>
          {t('profile.deactivateAccount')}
        </Button>
      </Box>

      <ConfirmDialog
        isOpen={deactivateDialog.isOpen}
        onClose={deactivateDialog.onClose}
        onConfirm={handleDeactivate}
        title={t('profile.deactivateTitle')}
        message={t('profile.deactivateConfirmMsg')}
        confirmText={t('profile.confirmDeactivate')}
        cancelText={t('common.cancel')}
        isLoading={isDeactivating}
        colorScheme="red"
      />
    </Box>
  );
}
