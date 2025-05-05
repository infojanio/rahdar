import {
  ImageProps,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native'
import {
  Heading,
  HStack,
  Image,
  VStack,
  Text,
  Icon,
  Center,
  Box,
} from 'native-base'
import { Entypo } from '@expo/vector-icons'
import { AppNavigatorRoutesProps } from '@routes/app.routes'
import { useNavigation } from '@react-navigation/native'
import { Button } from '@components/Button'

export type CategoryCardProps = {
  id: string
  title: string
  image: ImageProps['source']
}

type Props = TouchableOpacityProps & {
  data: CategoryCardProps
}

export function ProductCategory({ data, ...rest }: Props) {
  return (
    <VStack flex="1" ml={1} bg="gray.50" rounded="md" mb="6" borderWidth={0.2}>
      <Center>
        <Image
          source={{
            uri:
              'https://appmercados.com.br/inc/timthumb.php?w=800&h=800&zc=2&src=%2Fuploads%2Fa7dfd128a12ae1a9986401df2cd1659a.png',
          }}
          alt="imagem de carnes"
          w={24}
          h={24}
          rounded="md"
          mt={4}
          mr={2}
          ml={2}
          resizeMode="center"
        />

        <HStack mb="1">
          <Text>R$</Text>
          <Heading ml={2} mr={2} mb={1} fontSize="16" color="red.700">
            39,90
          </Heading>
          <Box bg="red.500" rounded="md" pl="1" pr="1" mb={2}>
            <Text fontSize="12" color="gray.100" numberOfLines={1}>
              Kg
            </Text>
          </Box>
        </HStack>

        <Box h={10} w={24}>
          <Text fontSize="12" numberOfLines={2}>
            Carne Paleta Bovina Congelada
          </Text>
        </Box>
      </Center>
    </VStack>
  )
}
