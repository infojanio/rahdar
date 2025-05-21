import React, { useRef, useState } from 'react'
import { ScrollView, KeyboardAvoidingView, Platform, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useForm, Controller } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'

import { VStack, Center, Text, Icon, IconButton, useToast } from 'native-base'
import { Feather, MaterialIcons } from '@expo/vector-icons'

import { Input } from '@components/Input'
import { Button } from '@components/Button'
import { StackNavigatorRoutesProps } from '@routes/stack.routes'
import { AppError } from '@utils/AppError'
import { useAuth } from '@hooks/useAuth'
import { api } from '@services/api'

type FormDataProps = {
  name: string
  email: string
  phone: string
  avatar: string
  role: string
  password: string
  password_confirm: string
  address: {
    street: string
    city: string
    state: string
    postalCode: string
  }
}

const signUpSchema = yup.object({
  name: yup.string().required('Informe o nome'),
  email: yup.string().required('Informe o e-mail').email('E-mail inválido'),
  phone: yup.string().required('Informe o telefone'),
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
  address: yup.object({
    street: yup.string().required('Informe a rua'),
    city: yup.string().required('Informe a cidade'),
    state: yup.string().required('Informe o estado'),
    postalCode: yup.string().required('Informe o CEP'),
  }),
})

export function SignUp() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const scrollViewRef = useRef<ScrollView>(null)

  const toast = useToast()
  const navigation = useNavigation<StackNavigatorRoutesProps>()
  const { signIn } = useAuth()

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

  async function handleSignUp(data: FormDataProps) {
    try {
      setIsLoading(true)

      await api.post('/users', {
        name: data.name,
        email: data.email,
        phone: data.phone,
        avatar: 'avatar.jpg',
        role: 'USER',
        password: data.password,
        address: {
          street: data.address.street,
          city: data.address.city,
          state: data.address.state,
          postalCode: data.address.postalCode,
        },
      })

      await signIn(data.email, data.password)
    } catch (error) {
      console.log('Não cadastrado:', error)
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
        <VStack
          flex={1}
          p={4} // Margens menores
          pb={12}
          space={2}
          bg="gray.50" // Cor de fundo na view
          borderRadius={8} // Bordas arredondadas
        >
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
              name="address.street"
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
                  errorMessage={errors.address?.street?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="address.city"
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
                  errorMessage={errors.address?.city?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="address.state"
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
                  errorMessage={errors.address?.state?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="address.postalCode"
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
                  errorMessage={errors.address?.postalCode?.message}
                />
              )}
            />
          </VStack>

          <Button
            title="Criar conta"
            mt={8}
            isLoading={isLoading}
            onPress={handleSubmit(handleSignUp)}
          />
        </VStack>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
