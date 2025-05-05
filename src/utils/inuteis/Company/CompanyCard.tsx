import React from 'react'

import { TouchableOpacity, TouchableOpacityProps } from 'react-native'

import { Image, Text, Box, HStack, Icon, VStack, Center } from 'native-base'

import { CompanyDTO } from '@dtos/CompanyDTO'

export type Props = TouchableOpacityProps & {
  data: CompanyDTO
}

export function CompanyCard({ data, ...rest }: Props) {
  return (
    <VStack flex={1} mb={2}>
      <TouchableOpacity {...rest}>
        <HStack
          paddingTop={2}
          pb={2}
          backgroundColor="gray.100"
          alignItems="center"
          marginLeft={4}
          marginRight={2}
          borderRadius={'xl'}
          minH={'16'}
          maxH={'24'}
          width={'360'}
          maxW={'360'}
        >
          <Image
            w={16}
            h={16}
            source={{
              uri: data.logo, //busca a URL da imagem
              //uri: `${api.defaults.baseURL}/images/thumb/${data.image}`, //busca o arquivo salvo no banco
            }}
            alt="Imagem"
            rounded="md"
            mr={4}
            resizeMode="cover"
          />

          <Center>
            <Text justifyContent={'flex-start'} fontSize={14} numberOfLines={2}>
              {data.name}
            </Text>
          </Center>

          {
            <Box>
              <Text color={'green.500'}>Aberto</Text>
            </Box>
          }
        </HStack>
      </TouchableOpacity>
    </VStack>
  )
}
