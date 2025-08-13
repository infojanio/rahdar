import React from 'react'
import { TouchableOpacity } from 'react-native'
import {
  Box,
  HStack,
  VStack,
  Text,
  Center,
  Image,
  Icon,
  useTheme,
  Divider,
} from 'native-base'
import { MaterialIcons } from '@expo/vector-icons'
import MarketPng from '@assets/rahdar.png'
import { useAuth } from '@hooks/useAuth'
import { Saldo } from './Saldo'
import { useCart } from '@hooks/useCart'

export function HomeHeader() {
  const { user, signOut } = useAuth()
  const { clearCart } = useCart()

  const { colors, sizes } = useTheme()

  //função para deslogar
  const handleLogout = async () => {
    try {
      await signOut() // 🔐 faz logout depois
    } catch (error) {
      console.error('Erro ao sair:', error)
    }
  }

  return (
    <Box
      bg={'green.300'}
      px={4}
      ml={1.5}
      mr={0.5}
      borderTopRadius={'3xl'}
      borderBottomWidth={1}
      borderBottomColor="gray.300"
      shadow={3}
    >
      {/* Primeira Linha - Saudação e Botão Sair */}
      <HStack justifyContent="space-between" alignItems="center" mb={2}>
        <VStack>
          <Text
            fontSize="md"
            color="gray.800"
            fontWeight="medium"
            opacity={0.9}
          >
            Olá,
          </Text>
          <Text
            fontSize="14"
            color="gray.800"
            fontWeight="normal"
            numberOfLines={1}
            maxW="180"
            textTransform="capitalize"
          >
            {user.name}
          </Text>
        </VStack>

        <TouchableOpacity onPress={handleLogout}>
          <HStack
            alignItems="center"
            px={2}
            py={1}
            borderRadius={'2xl'}
            borderColor={'gray.700'}
            borderWidth={'0.3'}
          >
            <Icon
              as={<MaterialIcons name="logout" />}
              size={5}
              color="black"
              mr={1}
              opacity={0.9}
            />
            <Text color="black" fontSize="sm" opacity={0.9}>
              Sair
            </Text>
          </HStack>
        </TouchableOpacity>
      </HStack>

      {/* Segunda Linha - Saldo e Logo */}
      <HStack justifyContent="space-between" alignItems="flex-end">
        <Box mt={1} flex={1}>
          <Saldo />
        </Box>

        <HStack>
          <Box borderRadius="2xl" p={2}>
            <Text
              color="yellow.50"
              fontSize="16"
              opacity={0.9}
              fontStyle={'italic'}
            ></Text>

            <Image
              alt="Logo"
              source={MarketPng}
              h={10}
              w={140}
              borderBottomWidth={'1.4'}
              borderColor={'yellow.100'}
              resizeMode="contain"
            />
          </Box>
        </HStack>
      </HStack>
    </Box>
  )
}
