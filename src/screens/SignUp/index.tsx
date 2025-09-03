import React, { useRef, useState } from 'react'
import {
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useForm, Controller } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import * as ImagePicker from 'expo-image-picker'

import { VStack, Center, Text, Icon, IconButton, useToast } from 'native-base'
import { Feather, MaterialIcons } from '@expo/vector-icons'

import { Input } from '@components/Input'
import { Button } from '@components/Button'

import { AppError } from '@utils/AppError'
import { useAuth } from '@hooks/useAuth'
import { api } from '@services/api'
import { AppNavigatorRoutesProps } from '@routes/app.routes'
import isValidCPF from '@utils/isValidCPF'

// ---------- CONFIG CLOUDINARY (AJUSTE) ----------
const CLOUDINARY_CLOUD_NAME = 'dwqr47iii' // seu cloud name
const CLOUDINARY_UPLOAD_PRESET = 'avatars' // unsigned preset
const CLOUDINARY_FOLDER = 'avatars' // pasta opcional
// -----------------------------------------------

type FormDataProps = {
  name: string
  email: string
  phone: string
  cpf: string
  avatar: string
  role: string
  password: string
  password_confirm: string

  street: string
  city: string
  state: string
  postalCode: string
}

const signUpSchema = yup.object({
  name: yup.string().required('Informe o nome'),
  email: yup.string().required('Informe o e-mail').email('E-mail inválido'),
  phone: yup.string().required('Informe o telefone'),
  cpf: yup
    .string()
    .required('CPF é obrigatório')
    .test('cpf-valido', 'CPF inválido', (value) => isValidCPF(value || '')),
  avatar: yup.string().default('avatar.jpg'),
  role: yup.string().default('USER'),
  password: yup
    .string()
    .required('Informe a senha')
    .min(6, 'A senha deve conter no mínimo 6 dígitos'),
  password_confirm: yup
    .string()
    .oneOf([yup.ref('password')], 'A senha digitada não confere!')
    .required('Confirme a senha'),

  street: yup.string().required('Informe a rua'),
  city: yup.string().required('Informe a cidade'),
  state: yup.string().required('Informe o estado'),
  postalCode: yup.string().required('Informe o CEP'),
})

// -------- Helpers de upload (web + nativo) --------
function inferFileMeta(asset: ImagePicker.ImagePickerAsset) {
  const filename =
    asset.fileName || asset.uri.split('/').pop() || `avatar-${Date.now()}.jpg`

  let mime = asset.mimeType
  if (!mime) {
    const ext = (filename.split('.').pop() || '').toLowerCase()
    mime =
      ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg'
  }
  return { filename, mime }
}

async function uploadAvatarToCloudinary(asset: ImagePicker.ImagePickerAsset) {
  const { filename, mime } = inferFileMeta(asset)
  const form = new FormData()
  form.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
  if (CLOUDINARY_FOLDER) form.append('folder', CLOUDINARY_FOLDER)

  if (Platform.OS === 'web') {
    const resp = await fetch(asset.uri)
    const blob = await resp.blob()
    // limite opcional de 5MB
    const MAX = 5 * 1024 * 1024
    if (blob.size > MAX) throw new Error('Imagem acima de 5MB.')
    const file = new File([blob], filename, { type: mime })
    form.append('file', file)
  } else {
    // @ts-ignore (shape de arquivo do RN)
    form.append('file', { uri: asset.uri, name: filename, type: mime })
  }

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: form },
  )

  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`Falha no upload do avatar. ${res.status} - ${txt}`)
  }

  const data = await res.json()
  return data.secure_url as string
}
// --------------------------------------------------

export function SignUp() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)

  const scrollViewRef = useRef<ScrollView>(null)
  const toast = useToast()

  const { signIn } = useAuth()
  const { userId } = useAuth()
  const navigation = useNavigation<AppNavigatorRoutesProps>()

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormDataProps>({
    resolver: yupResolver(signUpSchema),
  })

  function handleGoBack() {
    navigation.goBack()
  }

  function handleGoLocalization(userId: string) {
    navigation.navigate('localization', { userId })
  }

  async function handlePickAvatar() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      toast.show({
        title: 'Permissão necessária para acessar suas fotos.',
        placement: 'top',
        bgColor: 'red.500',
      })
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], // só imagens
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    })
    if (result.canceled) return

    const asset = result.assets?.[0]
    if (!asset?.uri) return

    try {
      setAvatarUploading(true)
      const url = await uploadAvatarToCloudinary(asset)
      setAvatarUrl(url)
      toast.show({
        title: 'Foto enviada!',
        placement: 'top',
        bgColor: 'emerald.600',
      })
    } catch (e) {
      console.log('Upload avatar error:', e)
      toast.show({
        title: e?.message || 'Não foi possível enviar sua foto.',
        placement: 'top',
        bgColor: 'red.500',
      })
    } finally {
      setAvatarUploading(false)
    }
  }

  async function handleSignUp(data: FormDataProps) {
    try {
      setIsLoading(true)

      await api.post('/users', {
        name: data.name,
        email: data.email,
        phone: data.phone,
        cpf: data.cpf,
        avatar: avatarUrl ?? 'avatar.jpg', // << usa a URL do Cloudinary (ou default)
        role: 'USER',
        password: data.password,
        street: data.street,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
      })

      const user = await signIn(data.email, data.password)

      try {
        const locationResponse = await api.get(`/users/${user.id}/location`)
        const { latitude, longitude } = locationResponse.data

        if (latitude && longitude) {
          navigation.navigate('home', { userId })
        } else {
          navigation.navigate('localization', { userId: user.id })
        }
      } catch {
        navigation.navigate('localization', { userId: user.id })
      }
    } catch (error) {
      console.log('Erro ao cadastrar usuário:', error)
      setIsLoading(false)

      const isAppError = error instanceof AppError
      const title = isAppError
        ? error.message
        : 'Não foi possível criar a conta. Tente novamente mais tarde!'

      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500',
      })
    }
  }

  function scrollToEnd() {
    scrollViewRef.current?.scrollToEnd({ animated: true })
  }

  // REFERÊNCIAS para focar nos campos
  const emailRef = useRef<any>(null)
  const phoneRef = useRef<any>(null)
  const cpfRef = useRef<any>(null)
  const passwordRef = useRef<any>(null)
  const passwordConfirmRef = useRef<any>(null)
  const streetRef = useRef<any>(null)
  const cityRef = useRef<any>(null)
  const stateRef = useRef<any>(null)
  const postalCodeRef = useRef<any>(null)

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ref={scrollViewRef}
      >
        <VStack flex={1} p={4} pb={12} space={2} bg="gray.50" borderRadius={8}>
          <IconButton
            borderRadius="full"
            variant="ghost"
            size="sm"
            icon={<Icon as={Feather} name="chevron-left" size="8" />}
            onPress={handleGoBack}
            alignSelf="flex-start"
          />

          <Center>
            <Text fontSize="2xl" fontWeight="bold">
              Criar conta
            </Text>
            <Text fontSize="sm" color="gray.500" mt={1}>
              Preencha seus dados para continuar
            </Text>
          </Center>

          {/* Avatar (preview + escolher) */}
          <Center mt={4} mb={2}>
            <TouchableOpacity onPress={handlePickAvatar} activeOpacity={0.8}>
              <View
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: 999,
                  backgroundColor: '#E5E7EB',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  borderWidth: 2,
                  borderColor: '#fff',
                  shadowColor: '#000',
                  shadowOpacity: 0.08,
                  shadowRadius: 8,
                }}
              >
                {avatarUploading ? (
                  <ActivityIndicator />
                ) : avatarUrl ? (
                  <Image
                    source={{ uri: avatarUrl }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                ) : (
                  <Icon
                    as={MaterialIcons}
                    name="person"
                    size={12}
                    color="gray.400"
                  />
                )}
              </View>
            </TouchableOpacity>
            <Text mt={2} color="gray.600" fontSize="xs">
              Toque para escolher uma foto
            </Text>
          </Center>

          <VStack space={5}>
            <Text fontSize="md" color="gray.600" fontWeight="semibold">
              Dados pessoais
            </Text>

            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder="Nome completo"
                  autoCapitalize="words"
                  returnKeyType="next"
                  onSubmitEditing={() => emailRef.current?.focus()}
                  leftIcon={<MaterialIcons name="person" size={24} />}
                  onChangeText={onChange}
                  value={value}
                  errorMessage={errors.name?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <Input
                  ref={emailRef}
                  placeholder="E-mail"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="next"
                  onSubmitEditing={() => phoneRef.current?.focus()}
                  leftIcon={
                    <MaterialIcons name="email" size={20} color="#71717a" />
                  }
                  onChangeText={onChange}
                  value={value}
                  errorMessage={errors.email?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, value } }) => (
                <Input
                  ref={phoneRef}
                  placeholder="Telefone"
                  keyboardType="phone-pad"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  leftIcon={<MaterialIcons name="phone" size={20} />}
                  onChangeText={onChange}
                  value={value}
                  errorMessage={errors.phone?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="cpf"
              render={({ field: { onChange, value } }) => (
                <Input
                  ref={cpfRef}
                  placeholder="CPF"
                  keyboardType="numeric"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  leftIcon={<MaterialIcons name="document-scanner" size={20} />}
                  onChangeText={onChange}
                  value={value}
                  errorMessage={errors.cpf?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <Input
                  ref={passwordRef}
                  placeholder="Senha"
                  secureTextEntry={!showPassword}
                  returnKeyType="next"
                  onSubmitEditing={() => passwordConfirmRef.current?.focus()}
                  leftIcon={<MaterialIcons name="lock" size={20} />}
                  rightIcon={
                    <IconButton
                      icon={
                        <Icon
                          as={MaterialIcons}
                          name={showPassword ? 'visibility-off' : 'visibility'}
                          size={5}
                        />
                      }
                      onPress={() => setShowPassword(!showPassword)}
                      variant="ghost"
                    />
                  }
                  onChangeText={onChange}
                  value={value}
                  errorMessage={errors.password?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password_confirm"
              render={({ field: { onChange, value } }) => (
                <Input
                  ref={passwordConfirmRef}
                  placeholder="Confirme a senha"
                  secureTextEntry={!showConfirmPassword}
                  returnKeyType="next"
                  onSubmitEditing={() => streetRef.current?.focus()}
                  leftIcon={<MaterialIcons name="lock-outline" size={20} />}
                  rightIcon={
                    <IconButton
                      icon={
                        <Icon
                          as={MaterialIcons}
                          name={
                            showConfirmPassword
                              ? 'visibility-off'
                              : 'visibility'
                          }
                          size={5}
                        />
                      }
                      onPress={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      variant="ghost"
                    />
                  }
                  onChangeText={onChange}
                  value={value}
                  errorMessage={errors.password_confirm?.message}
                />
              )}
            />

            <Text fontSize="md" color="gray.600" fontWeight="semibold" mt={4}>
              Endereço
            </Text>

            <Controller
              control={control}
              name="street"
              render={({ field: { onChange, value } }) => (
                <Input
                  ref={streetRef}
                  placeholder="Rua"
                  returnKeyType="next"
                  onSubmitEditing={() => cityRef.current?.focus()}
                  leftIcon={<MaterialIcons name="location-on" size={20} />}
                  onFocus={scrollToEnd}
                  onChangeText={onChange}
                  value={value}
                  errorMessage={errors.street?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="city"
              render={({ field: { onChange, value } }) => (
                <Input
                  ref={cityRef}
                  placeholder="Cidade"
                  returnKeyType="next"
                  onSubmitEditing={() => stateRef.current?.focus()}
                  leftIcon={<MaterialIcons name="location-city" size={20} />}
                  onFocus={scrollToEnd}
                  onChangeText={onChange}
                  value={value}
                  errorMessage={errors.city?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="state"
              render={({ field: { onChange, value } }) => (
                <Input
                  ref={stateRef}
                  placeholder="Estado"
                  returnKeyType="next"
                  onSubmitEditing={() => postalCodeRef.current?.focus()}
                  leftIcon={<MaterialIcons name="map" size={20} />}
                  onFocus={scrollToEnd}
                  onChangeText={onChange}
                  value={value}
                  errorMessage={errors.state?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="postalCode"
              render={({ field: { onChange, value } }) => (
                <Input
                  ref={postalCodeRef}
                  placeholder="CEP"
                  keyboardType="numeric"
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit(handleSignUp)}
                  leftIcon={
                    <MaterialIcons name="local-post-office" size={20} />
                  }
                  onFocus={scrollToEnd}
                  onChangeText={onChange}
                  value={value}
                  errorMessage={errors.postalCode?.message}
                />
              )}
            />
          </VStack>

          <Button
            title={avatarUploading ? 'Enviando foto...' : 'Próximo'}
            mt={8}
            isLoading={isLoading}
            onPress={handleSubmit(handleSignUp)}
            isDisabled={avatarUploading || isLoading}
          />
        </VStack>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
