import { Center, Spinner, Image, Text } from 'native-base'

import SplashImg from '@assets/fundo.png'

export function Loading() {
  return (
    <Center flex={1} bg="gray.100">
      <Image
        size={70}
        source={SplashImg}
        defaultSource={SplashImg}
        alt="Pessoa comprando online"
        resizeMode="contain"
        position="relative"
      />
      <Text fontSize={14}>Carregando... </Text>

      <Spinner color="green.500" />
    </Center>
  )
}
