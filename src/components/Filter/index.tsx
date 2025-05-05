import React from 'react'
import { Button, HStack, Stack, VStack } from 'native-base'

import SearchSvg from '@assets/search.svg'
import { View } from 'native-base'

import { AppNavigatorRoutesProps } from '@routes/app.routes'
import { useNavigation } from '@react-navigation/native'

export function Filter() {
  const navigation = useNavigation<AppNavigatorRoutesProps>()

  return (
    <Stack
      marginTop={2}
      marginLeft={2}
      marginRight={2}
      direction={{
        base: 'column',
        md: 'row',
      }}
      space={8}
    >
      <Button
        bg="gray.100"
        color="gray.700"
        variant="outline"
        borderColor="green.700"
        justifyContent="flex-start"
        size="lg"
        leftIcon={<SearchSvg height={20} width={20} />}
        onPress={() => {
          navigation.navigate('productBySubCategory')
        }}
        _text={{
          color: 'gray.500',
        }}
      >
        Pesquise um produto...
      </Button>
    </Stack>
  )
}
