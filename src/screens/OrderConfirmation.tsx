import React, { useEffect, useState } from 'react'
import {
  Box,
  Text,
  VStack,
  HStack,
  ScrollView,
  Image,
  Button,
  Spinner,
} from 'native-base'
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native'
import { api } from '@services/api'
import { formatCurrency } from '@utils/format'
import { AppNavigatorRoutesProps } from '@routes/app.routes'

type RootStackParamList = {
  OrderConfirmation: { orderId: string }
}

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

type OrderItem = {
  id: string
  quantity: number
  product: {
    id: string
    name: string
    price: number
    image: string
    cashbackPercentage: number
  }
}

type OrderData = {
  id: string
  totalAmount: number
  status: string
  validated_at: string | null
  createdAt: string
  items: OrderItem[] // Agora é sempre um array
}

export default function OrderConfirmationScreen() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const route = useRoute<RouteProp<RootStackParamList, 'OrderConfirmation'>>()
  const navigation = useNavigation<AppNavigatorRoutesProps>()
  const { orderId } = route.params

  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId) {
        console.error('ID do pedido não fornecido.')
        return
      }

      setLoading(true)

      try {
        const res = await api.get(`/orders/${orderId}`)
        console.log('Resposta da API:', res.data) // Log para debug

        if (res.data.orders && res.data.orders.length > 0) {
          const orderData = res.data.orders[0]
          setOrder({
            ...orderData,
            items: orderData.items || [],
          })
        } else {
          console.error('Pedido não encontrado na resposta.')
          setOrder(null)
        }
      } catch (err) {
        console.error('Erro ao buscar pedido:', err)
        setOrder(null)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId])

  if (loading) {
    return <Spinner color="blue.500" mt={4} />
  }

  if (!order) {
    return (
      <Box flex={1} alignItems="center" justifyContent="center">
        <Text fontSize="lg" color="gray.500">
          Pedido não encontrado.
        </Text>
      </Box>
    )
  }

  return (
    <ScrollView flex={1} bg="white" px={4} py={6}>
      <VStack space={4}>
        <Text fontSize="2xl" fontWeight="bold">
          Pedido Confirmado!
        </Text>
        <Text color="gray.500">ID do Pedido: {order.id}</Text>

        {order.items.length > 0 ? (
          order.items.map((item) => (
            <HStack key={item.id} space={4} alignItems="center">
              <Image
                source={{
                  uri: item.product?.image || 'https://via.placeholder.com/80',
                }}
                alt={item.product?.name || 'Produto'}
                size="80px"
                borderRadius="md"
              />

              <VStack flex={1}>
                <Text fontWeight="bold">{item.product?.name || 'Produto'}</Text>
                <Text color="gray.500">
                  {item.quantity}x {formatCurrency(item.product?.price || 0)}
                </Text>
              </VStack>
              <Text>
                {formatCurrency(item.quantity * (item.product?.price || 0))}
              </Text>
            </HStack>
          ))
        ) : (
          <Text color="red.500">Nenhum item encontrado neste pedido.</Text>
        )}

        <Box mt={4} borderTopWidth={1} borderColor="gray.200" pt={4}>
          <Text fontSize="lg" fontWeight="semibold">
            Total: {formatCurrency(order.totalAmount)}
          </Text>
          <Text fontSize="lg" color="green.600">
            Cashback esperado:{' '}
            {formatCurrency(
              order.items.reduce(
                (sum, item) =>
                  sum +
                  ((item.product?.price || 0) *
                    item.quantity *
                    (item.product?.cashbackPercentage || 0)) /
                    100,
                0,
              ),
            )}
          </Text>
        </Box>

        <Button
          mt={6}
          colorScheme="blue"
          onPress={() => navigation.navigate('orderHistory')}
        >
          Ver Histórico de Pedidos
        </Button>
      </VStack>
    </ScrollView>
  )
}
