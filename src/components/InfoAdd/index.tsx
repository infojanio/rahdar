import { StyleSheet, TouchableOpacity } from 'react-native'
import { View, Center, Image, Box, Text, VStack } from 'native-base'

import IndicatorPng from '../../assets/down.png'

interface Props {
  mBottom: number
  onPress: () => void
}

export function InfoAdd() {
  return (
    <View
      position={'absolute'}
      width={90}
      height={40}
      marginLeft={285}
      marginTop={495}
    >
      <VStack justifyContent={'center'} ml={2} mr={8} opacity={0.85}>
        <Image
          size={120}
          source={IndicatorPng}
          defaultSource={IndicatorPng}
          alt="Pessoa comprando online"
          resizeMode="contain"
          position="relative"
        />
      </VStack>
    </View>
  )
}
