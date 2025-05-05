import { Center, Heading, HStack, Icon, Text, VStack, Image } from 'native-base'
import { TouchableOpacity, TouchableOpacityProps } from 'react-native'
import { Entypo } from '@expo/vector-icons'

type Props = TouchableOpacityProps & {}

export function Status({ ...rest }: Props) {
  return (
    <VStack>
      <TouchableOpacity {...rest}>
        <HStack
          bg="gray.50"
          alignItems="center"
          p={4}
          ml={2}
          mr={2}
          rounded="md"
          mb="2"
        >
          <Icon
            as={Entypo}
            name="controller-record"
            color="green.700"
            size="2xl"
          />
          <VStack flex={1} ml="2">
            <Heading fontSize="lg" color="green.700">
              Compra Realizada
            </Heading>

            <Text fontSize="14" color="gray.400" mt={1} numberOfLines={2}>
              Seu pedido está em confirmação!
            </Text>
          </VStack>

          {/*  <Entypo name='resize-full-screen' */}
        </HStack>
      </TouchableOpacity>
    </VStack>
  )
}
