import {
  Box,
  FlatList,
  HStack,
  Image,
  Text,
  VStack,
  Button,
  Icon,
  Divider,
  ScrollView,
  Spinner,
  useToast,
} from 'native-base'
import { AntDesign } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { useEffect, useMemo, useState } from 'react'
import { HomeScreen } from '@components/HomeScreen'
import { AppNavigatorRoutesProps } from '@routes/app.routes'
import { api } from '@services/api'
import { Middleware } from 'react-native-svg'

type CartItem = {
  productId: string
  name: string
  image: string
  price: number
  quantity: number
  cashbackPercentage: number
}

export function Cart() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const toast = useToast()
  const navigation = useNavigation<AppNavigatorRoutesProps>()

  async function fetchCart() {
    try {
      setIsLoading(true)
      const response = await api.get('/cart')
      setCart(response.data.items || []) // <- garante que será array
    } catch (error) {
      toast.show({ description: 'Erro ao buscar carrinho.' })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleIncrease(id: string, currentQty: number) {
    await updateQuantity(id, currentQty + 1)
  }

  async function handleDecrease(id: string, currentQty: number) {
    if (currentQty > 1) {
      await updateQuantity(id, currentQty - 1)
    }
  }

  async function updateQuantity(productId: string, quantity: number) {
    try {
      await api.patch('/cart/items/quantity', { productId, quantity })
      fetchCart()
    } catch (error) {
      toast.show({ description: 'Erro ao atualizar quantidade.' })
    }
  }

  async function handleRemoveItem(productId: string) {
    try {
      await api.delete(`/cart/items/${productId}`)
      fetchCart()
    } catch {
      toast.show({ description: 'Erro ao remover item.' })
    }
  }

  async function handleCheckout() {
    navigation.navigate('checkout', { cart })
  }

  const subtotal = useMemo(() => {
    return (cart || []).reduce(
      (acc, item) => acc + item.quantity * item.price,
      0,
    )
  }, [cart])

  useEffect(() => {
    fetchCart()
  }, [])

  return (
    <VStack flex={1} bg="gray.100" p={2} mb={2}>
      <HomeScreen title="Carrinho" />

      {isLoading ? (
        <Spinner mt={10} />
      ) : cart.length === 0 ? (
        <Text textAlign="center" mt={10} color="gray.500">
          Seu carrinho está vazio.
        </Text>
      ) : (
        <>
          <ScrollView flex={1}>
            {cart.map((item) => (
              <HStack
                key={item.productId}
                bg="white"
                borderRadius="lg"
                p={3}
                mb={3}
                alignItems="center"
                justifyContent="space-between"
              >
                <HStack space={3} alignItems="center">
                  <Image
                    source={{ uri: item.image }}
                    alt={item.name}
                    size="sm"
                    borderRadius="md"
                    borderWidth={1}
                    borderColor="gray.300"
                  />
                  <VStack>
                    <Text bold>{item.name}</Text>
                    <Text color="gray.600">R$ {item.price.toFixed(2)}</Text>
                  </VStack>
                </HStack>

                <VStack alignItems="center">
                  <HStack alignItems="center" space={2}>
                    <Button
                      size="xs"
                      variant="outline"
                      onPress={() =>
                        handleDecrease(item.productId, item.quantity)
                      }
                    >
                      -
                    </Button>
                    <Text>{item.quantity}</Text>
                    <Button
                      size="xs"
                      variant="outline"
                      onPress={() =>
                        handleIncrease(item.productId, item.quantity)
                      }
                    >
                      +
                    </Button>
                  </HStack>
                  <Button
                    mt={2}
                    size="xs"
                    variant="ghost"
                    colorScheme="danger"
                    onPress={() => handleRemoveItem(item.productId)}
                    leftIcon={<Icon as={AntDesign} name="delete" size="xs" />}
                  >
                    Remover
                  </Button>
                </VStack>
              </HStack>
            ))}
          </ScrollView>

          <Divider my={4} />

          <HStack justifyContent="space-between" alignItems="center" mb={4}>
            <Text fontSize="lg" fontWeight="bold">
              Subtotal:
            </Text>
            <Text fontSize="lg" fontWeight="bold" color="green.600">
              R$ {subtotal.toFixed(2)}
            </Text>
          </HStack>

          <Button colorScheme="green" onPress={handleCheckout}>
            Finalizar compra
          </Button>
        </>
      )}
    </VStack>
  )
}
