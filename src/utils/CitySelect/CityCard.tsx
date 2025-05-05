import React from 'react'

import { TouchableOpacity, TouchableOpacityProps } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { Image, Text, Box, HStack, Icon, VStack, Center } from 'native-base'

import { CityDTO } from '@dtos/CityDTO'

export type Props = TouchableOpacityProps & {
  data: CityDTO
}

export function CityCard({ data, ...rest }: Props) {
  return (
    <VStack flex={1} mb={2}>
      <TouchableOpacity {...rest}>
        <Box
          padding={2}
          backgroundColor="white"
          alignItems="center"
          marginLeft={2}
          marginRight={2}
          pb={2}
          borderRadius={'xl'}
          minH={'16'}
        >
          <HStack flex={1}>
            <Center>
              <Icon
                as={<MaterialIcons name="add-location-alt" />}
                size={8}
                mr={4}
                _light={{
                  color: 'red.500',
                }}
                _dark={{
                  color: 'gray.200',
                }}
              />
            </Center>

            <Center>
              <Text
                textAlign={'center'}
                justifyContent={'center'}
                fontSize={20}
                fontWeight={'bold'}
                numberOfLines={2}
              >
                {data.name}
                {'-'}
                {data.uf}
              </Text>
            </Center>

            {}
          </HStack>
        </Box>
      </TouchableOpacity>
    </VStack>
  )
}
