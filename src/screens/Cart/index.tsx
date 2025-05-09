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
import { useEffect, useMemo, useState, useContext } from 'react'
import { HomeScreen } from '@components/HomeScreen'
import { AppNavigatorRoutesProps } from '@routes/app.routes'
import { CartContext } from '@contexts/CartContext'
import { formatCurrency } from '@utils/format'

export function Cart() {
  const {
    cartItems,
    fetchCart,
    updateProductQuantity,
    removeProductCart,
  } = useContext(CartContext)

  const [isLoading, setIsLoading] = useState(true)
  const toast = useToast()
  const navigation = useNavigation<AppNavigatorRoutesProps>()

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        await fetchCart()
      } catch {
        toast.show({ description: 'Erro ao carregar carrinho.' })
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity * item.price, 0)
  }, [cartItems])

  async function handleIncrease(id: string, currentQty: number) {
    await updateProductQuantity(id, currentQty + 1)
  }

  async function handleDecrease(id: string, currentQty: number) {
    if (currentQty > 1) {
      await updateProductQuantity(id, currentQty - 1)
    }
  }

  async function handleRemoveItem(productId: string) {
    try {
      await removeProductCart(productId)
    } catch {
      toast.show({ description: 'Erro ao remover item.' })
    }
  }

  async function handleCheckout() {
    const cartWithStoreId = cartItems.map((item) => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      image: item.image,
      cashbackPercentage: item.cashbackPercentage,
      storeId: item.storeId, // Inclua o storeId aqui
      quantity: item.quantity,
    }))

    navigation.navigate('checkout', { cart: cartWithStoreId })
  }

  return (
    <VStack flex={1} bg="gray.100" p={2} mb={2}>
      <HomeScreen title="Carrinho" />

      {isLoading ? (
        <Spinner mt={10} />
      ) : cartItems.length === 0 ? (
        <Text textAlign="center" mt={10} color="gray.500">
          Seu carrinho está vazio.
        </Text>
      ) : (
        <>
          <ScrollView flex={1}>
            {cartItems.map((item) => (
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
                    <Text color="gray.500">
                      {item.quantity}x {formatCurrency(item.price)}
                    </Text>
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
