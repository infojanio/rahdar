import React, { useState } from 'react'
import { HStack, Text, IconButton, Icon, VStack } from 'native-base'
import { MaterialIcons } from '@expo/vector-icons'
import { useAuth } from '@hooks/useAuth'

export function Saldo() {
  const [showBalance, setShowBalance] = useState(true)
  const { user } = useAuth()

  //const saldo = 124.75 // Você pode pegar esse valor dinamicamente depois

  return (
    <VStack mt={2} px={1}>
      <Text fontSize="sm" color="white" mb={1}>
        Saldo disponível
      </Text>

      <HStack alignItems="center">
        <Text fontSize="22" fontWeight="bold" color="white">
          {showBalance
            ? `R$ ${(Number(user.balance) || 0).toFixed(2)}`
            : '••••••'}
        </Text>

        <IconButton
          icon={
            <Icon
              as={MaterialIcons}
              name={showBalance ? 'visibility-off' : 'visibility'}
              color="white"
              size={5}
            />
          }
          onPress={() => setShowBalance((prev) => !prev)}
          _pressed={{ bg: 'rgba(255,255,255,0.1)' }}
          ml={2}
          rounded="full"
        />
      </HStack>
    </VStack>
  )
}
