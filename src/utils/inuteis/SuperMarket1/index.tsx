import React from 'react'
import {
  View,
  Text,
  Image,
  HStack,
  VStack,
  ScrollView,
  Box,
  Center,
  Divider,
} from 'native-base'

import { useNavigation } from '@react-navigation/native'

import { StackNavigatorRoutesProps } from '@routes/stack.routes'
import { TouchableOpacity, TouchableOpacityProps } from 'react-native'

import MarketPng from '@assets/logoMercado/03.png'

type Props = TouchableOpacityProps & {
  title: string
  subTitle: string
  hour_week: string
  hour_weekend: string
}

export function Market({
  title,
  subTitle,
  hour_week,
  hour_weekend,
  ...rest
}: Props) {
  const navigation = useNavigation<StackNavigatorRoutesProps>()

  return (
    <TouchableOpacity onPress={() => navigation.navigate('home')}>
      <HStack
        justifyContent={'space-between'}
        bg={'gray.100'}
        h={120}
        w={350}
        mb={2}
        borderRadius={8}
      >
        <VStack>
          <Box h={110} w={175} ml={1} mt={2} alignItems={'center'}>
            <Text fontSize={15} fontWeight={'bold'}>
              {title}
            </Text>
            <Text fontSize={14} fontWeight={'bold'}>
              {subTitle}
            </Text>
            <Text>{hour_week} </Text>
            <Text>{hour_weekend} </Text>
          </Box>
        </VStack>
        <Center mt={2} mb={4} mr={4} alignItems={'center'} h={110} w={160}>
          <Image alt="Logo do mercado" source={MarketPng} h={70} w={170} />
        </Center>
      </HStack>
    </TouchableOpacity>
  )
}
