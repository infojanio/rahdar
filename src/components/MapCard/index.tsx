import { StyleSheet } from 'react-native'
import { HStack, Center, Text, Button } from 'native-base'

import LocationSvg from '@assets/location.svg'

import { useNavigation } from '@react-navigation/native'
import { StackNavigatorRoutesProps } from '@routes/stack.routes'

export function MapCard() {
  const navigation = useNavigation<StackNavigatorRoutesProps>()

  function handleGoBack() {
    navigation.goBack()
    console.log('voltei')
  }

  return (
    <HStack
      position={'absolute'}
      bg={'white'}
      width={'90%'}
      height={'12%'}
      marginLeft={4}
      marginTop={4}
      borderRadius={10}
      alignItems={'center'}
    >
      <LocationSvg height={40} width={40} />
      <Text justifyContent={'center'} fontSize={'13'}>
        Endereço: {'\n'}Setor Aeroporto, Rua 5, Qd. 6, Lt. 1{'\n'}Campos Belos
      </Text>
    </HStack>
  )
}
/*
export function MapCard ()  {
  return (
    <View style={styles.container}>
            <Text>
Campos Belos, Setor Aeroporto, Rua 5, Qd. 6, Lt. 1
            </Text>
    </View>
  )
}
const styles  = StyleSheet.create({
    container: {
position: "absolute",
width: "70%",
height: "10%",
marginLeft: 40,
marginTop: 20,
borderRadius: 20,
paddingHorizontal: 20,
alignItems: "center",
justifyContent: "center",
backgroundColor: "#fff"

        
    },
    text: {
        
        alignItems: "center",
        justifyContent: "center"
    }
})
*/
