import React, { useEffect, useState } from 'react'
import {
  Box,
  Text,
  VStack,
  HStack,
  Image,
  Button,
  FlatList,
  Divider,
} from 'native-base'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Alert } from 'react-native'
import { api } from '@services/api'
import { useAuth } from '@hooks/useAuth'
import { formatCurrency } from '@utils/format'
import { AppNavigatorRoutesProps } from '@routes/app.routes'
import { StorageCartProps } from '@storage/storageCart'

interface CartItem {
  id: string
  product: {
    id: string
    name: string
    price: number
    image: string
    cashbackPercentage: number
    storeId: string
  }
  quantity: number
}

type CheckoutScreenRouteParams = {
  cart: StorageCartProps[]
}

export function Checkout() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const navigation = useNavigation<AppNavigatorRoutesProps>()
  const route = useRoute()
  const { user } = useAuth()
  const { cart } = route.params as CheckoutScreenRouteParams

  useEffect(() => {
    if (cart && Array.isArray(cart)) {
      const formatted = cart.map((item) => ({
        id: item.productId,
        quantity: Number(item.quantity),
        product: {
          id: item.productId,
          name: item.name,
          price: item.price,
          image: item.image,
          cashbackPercentage: item.cashbackPercentage ?? 0,
          storeId: item.storeId,
        },
      }))
      setCartItems(formatted)
    }
  }, [cart])

  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  )

  const cashbackTotal = cartItems.reduce((sum, item) => {
    const { cashbackPercentage, price } = item.product
    return sum + price * item.quantity * (cashbackPercentage / 100)
  }, 0)

  async function handleConfirmOrder() {
    if (cartItems.length === 0) return

    setLoading(true)
    try {
      const payload = {
        storeId: cartItems[0].product.storeId,
        items: cartItems.map((item) => ({
          productId: item.product.id,
          quantity: Number(item.quantity),
        })),
      }

      const res = await api.post('/orders', payload)
      Alert.alert(
        'Pedido confirmado!',
        `Cashback: ${formatCurrency(res.data.cashbackAmount)}`,
      )

      navigation.navigate('orderConfirmation', { orderId: res.data.orderId })
    } catch (err) {
      console.error('Erro ao confirmar pedido', err)
      Alert.alert('Erro', 'Não foi possível confirmar o pedido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box flex={1} bg="white" px={4} py={6}>
      <Text fontSize="xl" fontWeight="bold" mb={4}>
        Resumo do Pedido
      </Text>
      {cartItems.length === 0 ? (
        <Text color="gray.500">Seu carrinho está vazio.</Text>
      ) : (
        <FlatList
          data={cartItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <HStack space={4} alignItems="center" mb={4}>
              <Image
                source={{ uri: item.product.image }}
                alt={item.product.name}
                size="64px"
                borderRadius="md"
              />
              <VStack flex={1}>
                <Text fontWeight="semibold">{item.product.name}</Text>
                <Text color="gray.500">
                  {item.quantity}x {formatCurrency(item.product.price)}
                </Text>
              </VStack>
              <Text fontWeight="bold" textAlign="right">
                {formatCurrency(item.product.price * item.quantity)}
              </Text>
            </HStack>
          )}
        />
      )}

      <Divider my={4} />
      <VStack space={2}>
        <Text fontSize="lg">Total: {formatCurrency(total)}</Text>
        <Text color="green.600">
          Cashback estimado: {formatCurrency(cashbackTotal)}
        </Text>

        <Button
          mt={6}
          colorScheme="blue"
          isLoading={loading}
          onPress={handleConfirmOrder}
          isDisabled={loading || cartItems.length === 0}
          rounded="xl"
        >
          Confirmar Pedido
        </Button>
      </VStack>
    </Box>
  )
}
