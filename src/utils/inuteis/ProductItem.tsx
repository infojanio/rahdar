import React from 'react'
import { Image, FlatList, Text, Box, View, VStack, Icon } from 'native-base'

import { MaterialIcons } from '@expo/vector-icons'

import { Product } from '@utils/inuteis/ProductList1'

export function ProductItem({
  id,
  type,
  subcategory,
  name,
  price,
  image,
}: Product) {
  return (
    <VStack
      backgroundColor="white"
      alignItems="center"
      marginLeft={2}
      marginRight={2}
      pb={2}
      borderRadius={'xl'}
    >
      <Image alt="produtos" ml={2} height={24} width={24} source={image} />
      <View flex={1} marginLeft={2}>
        <Text fontSize={16}>{name}</Text>
      </View>

      <View flex={1} marginLeft={2}>
        <Text fontSize={16}>{price}</Text>
      </View>
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
    </VStack>
  )
}
