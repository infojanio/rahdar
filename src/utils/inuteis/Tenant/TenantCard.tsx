import React from 'react'

import { TouchableOpacity, TouchableOpacityProps } from 'react-native'

import { Image, Text, Box, HStack, Icon, VStack, Center } from 'native-base'

import { TenantDTO } from '@dtos/TenantDTO'

export type Props = TouchableOpacityProps & {
  data: TenantDTO
}

export function TenantCard({ data, ...rest }: Props) {
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
          minH={'24'}
        >
          <VStack w={64} alignItems={'center'}>
            <Image
              w={64}
              h={32}
              source={{
                uri: data.image, //busca a URL da imagem
                //uri: `${api.defaults.baseURL}/images/thumb/${data.image}`, //busca o arquivo salvo no banco
              }}
              alt="Imagem"
              rounded="md"
              resizeMode="cover"
            />

            <Center>
              <Text
                textAlign={'center'}
                justifyContent={'center'}
                fontSize={18}
                fontWeight={'bold'}
                numberOfLines={2}
              >
                {data.name}
              </Text>
            </Center>

            {/*   
            <Center>
              <Icon
                as={<MaterialIcons name="navigate-next" />}
                size={6}
                ml={2}
                mr={2}
                _light={{
                  color: 'gray.500',
                }}
                _dark={{
                  color: 'gray.200',
                }}
              />
            </Center>
            */}
          </VStack>
        </Box>
      </TouchableOpacity>
    </VStack>
  )
}
