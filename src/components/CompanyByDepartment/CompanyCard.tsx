import React from 'react'

import { TouchableOpacity, TouchableOpacityProps } from 'react-native'

import { Image, Text, Box, HStack, Icon, VStack, Center } from 'native-base'

import { CompanyDTO } from '@dtos/CompanyDTO'

export type Props = TouchableOpacityProps & {
  data: CompanyDTO
}

export function CompanyCard({ data, ...rest }: Props) {
  return (
    <HStack flex={1} mb={2}>
      <TouchableOpacity {...rest}>
        <HStack
          paddingTop={2}
          pb={2}
          backgroundColor="white"
          alignItems="center"
          marginLeft={4}
          marginRight={2}
          borderRadius={'md'}
          borderWidth={'0.2'}
          minH={'16'}
          maxH={'24'}
          width={'340'}
          maxW={'360'}
        >
          <HStack>
            <Box>
              <Image
                w={24}
                h={16}
                source={{
                  uri: data.logo, //busca a URL da imagem
                  //uri: `${api.defaults.baseURL}/images/thumb/${data.image}`, //busca o arquivo salvo no banco
                }}
                alt="Imagem"
                rounded="full"
                mr={2}
                ml={2}
                resizeMode="cover"
              />
            </Box>

            <Box maxWidth={32} minWidth={32}>
              <Text fontSize={14} numberOfLines={1}>
                {data.name}
              </Text>

              <Text fontSize={14} numberOfLines={1}>
                {data.phone}
              </Text>
            </Box>
          </HStack>

          <Box marginRight={2} marginLeft={2} paddingLeft={4}>
            <Text fontWeight={'bold'} fontSize={14} color={'green.500'}>
              Aberto
            </Text>
          </Box>
        </HStack>
      </TouchableOpacity>
    </HStack>
  )
}
