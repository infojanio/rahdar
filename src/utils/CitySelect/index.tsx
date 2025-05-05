import React from 'react'

import { MaterialIcons } from '@expo/vector-icons'
import { Box, Text, Center, HStack, Icon } from 'native-base'
import { TouchableOpacity } from 'react-native'
import { AuthNavigatorRoutesProps } from '@routes/auth.routes'
import { useNavigation } from '@react-navigation/native'

export function CitySelect() {
  const navigation = useNavigation<AuthNavigatorRoutesProps>()

  return (
    <HStack bg={'gray.100'} borderRadius={'8'}>
      <TouchableOpacity onPress={() => navigation.navigate('cityselect')}>
        <HStack
          padding={'1.5'}
          alignItems={'center'}
          flexDirection={'row'}
          justifyContent={'space-between'}
        >
          <Text color={'gray.600'} ml={'4'} mr={'32'} fontSize={16}>
            Selecione a cidade
          </Text>

          <Box alignItems={'center'} p="1" mr={2} borderRadius={2}>
            <Icon
              as={<MaterialIcons name="keyboard-arrow-down" />}
              size={7}
              _light={{
                color: 'gray.400',
              }}
              _dark={{
                color: 'red.700',
              }}
            />
          </Box>
        </HStack>
      </TouchableOpacity>
    </HStack>
  )
}
