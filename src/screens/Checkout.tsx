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
          storeId: item.storeId, // Garantindo que o storeId seja atribuído corretamente
        },
      }))
      setCartItems(formatted)
    }
  }, [cart])

  async function handleConfirmOrder() {
    if (cartItems.length === 0) return

    setLoading(true)
    try {
      const storeId = cartItems[0]?.product.storeId

      if (!storeId) {
        Alert.alert('Erro', 'Store ID não encontrado. Verifique o carrinho.')
        setLoading(false)
        return
      }

      const payload = {
        user_id: user.id,
        store_id: storeId, // Agora garantido que o store_id é obtido corretamente
        items: cartItems.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
          subtotal: item.quantity * item.product.price,
        })),
      }

      console.log('📩 Enviando payload:', payload)

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

      <Divider my={4} />
      <VStack space={2}>
        <Text fontSize="24" fontWeight="bold">
          Total:{' '}
          {formatCurrency(
            cartItems.reduce(
              (sum, item) => sum + item.product.price * item.quantity,
              0,
            ),
          )}
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
