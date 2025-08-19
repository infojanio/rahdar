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
      bg={'green.500'}
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
            color="white"
            fontWeight="medium"
            opacity={0.9}
          >
            Olá,
          </Text>
          <Text
            fontSize="14"
            color="white"
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
            borderRadius={'lg'}
            borderColor={'gray.100'}
            borderWidth={'0.3'}
          >
            <Icon
              as={<MaterialIcons name="logout" />}
              size={5}
              color="white"
              mr={1}
              opacity={0.9}
            />
            <Text color="white" fontSize="sm" opacity={0.9}>
              Sair
            </Text>
          </HStack>
        </TouchableOpacity>
      </HStack>

      <Box ml={-4} mr={-4} flex={1} borderBottomColor={'gray.100'} borderBottomWidth={2} ></Box>

      {/* Segunda Linha - Saldo e Logo */}
      <HStack justifyContent="space-between" alignItems="flex-end">
        <Center >
          <Saldo />
        </Center>

        <HStack>
          <Box borderRadius="3xl" >

            <Center mb={4} >
            <Image
              alt="Logo"
              source={MarketPng}
              h={8}
              w={130}           
              resizeMode="contain"
            />

            </Center>
          </Box>
        </HStack>
      </HStack>
    </Box>
  )
}
