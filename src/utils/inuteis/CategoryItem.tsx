import React from 'react'
import { Image, FlatList, Text, Box, View, HStack, Icon } from 'native-base'

import { MaterialIcons } from '@expo/vector-icons'

import { Category } from '@utils/inuteis/CategoryList'
import { TouchableOpacity } from 'react-native'

import { useNavigation } from '@react-navigation/native'
import { AppNavigatorRoutesProps } from '@routes/app.routes'

export function CategoryItem({ id, title, image }: Category) {
  //Criar nova conta, preciso fazer ajustes no routes/index.tsx , acertar a navegação auth
  function handleProduct() {
    const navigation = useNavigation<AppNavigatorRoutesProps>()

    navigation.navigate('productDetails')
  }

  return (
    <TouchableOpacity onPress={handleProduct}>
      <HStack
        backgroundColor="white"
        alignItems="center"
        marginLeft={2}
        marginRight={2}
        pb={2}
        borderRadius={'xl'}
      >
        <Image alt="produtos" ml={2} height={24} width={24} source={image} />
        <View flex={1} marginLeft={2}>
          <Text fontSize={16}>{title}</Text>
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
      </HStack>
    </TouchableOpacity>
  )
}
