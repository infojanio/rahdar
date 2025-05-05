import React from 'react'
import { Image, Text, Box, HStack, Icon, VStack } from 'native-base'

import { MaterialIcons } from '@expo/vector-icons'

import {
  ImageProps,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native'

import { useNavigation } from '@react-navigation/native'
import { AppNavigatorRoutesProps } from '@routes/app.routes'
import { Category } from '@utils/inuteis/CategoryList'
import { CategoryDTO } from '@dtos/CategoryDTO'

type Props = TouchableOpacityProps & {
  //id: string
  //title: string
  //image: ImageProps['source']
  data: CategoryDTO
}

export function GroupCategory({ data, ...rest }: Props) {
  const navigation = useNavigation<AppNavigatorRoutesProps>()

  function handleProductBySubCategory() {
    navigation.navigate('productBySubCategory')
  }

  return (
    <VStack mb={2}>
      <TouchableOpacity onPress={handleProductBySubCategory}>
        <HStack
          backgroundColor="white"
          alignItems="center"
          marginLeft={2}
          marginRight={2}
          pb={2}
          borderRadius={'xl'}
          minH={'16'}
        >
          <Image
            alt="produtos"
            alignItems={'center'}
            ml={2}
            height={16}
            width={24}
            source={data.image}
          />
          <Box flex={1} marginLeft={2}>
            <Text fontSize={16}>{data.name}</Text>
          </Box>
          <Icon
            as={<MaterialIcons name="navigate-next" />}
            size={6}
            ml={2}
            mr={4}
            _light={{
              color: 'gray.500',
            }}
            _dark={{
              color: 'gray.200',
            }}
          />
        </HStack>
      </TouchableOpacity>
    </VStack>
  )
}
