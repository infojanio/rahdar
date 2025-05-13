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
  items: OrderItem[]
}

export default function OrderConfirmationScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'OrderConfirmation'>>()
  const navigation = useNavigation<AppNavigatorRoutesProps>()
  const { orderId } = route.params

  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId) return

      try {
        const res = await api.get(`/orders/${orderId}`)
        setOrder(res.data)
      } catch (err) {
        console.error('Erro ao buscar pedido:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId])

  const cashbackAmount =
    order?.items.reduce(
      (sum, item) =>
        sum +
        (item.product.price * item.quantity * item.product.cashbackPercentage) /
          100,
      0,
    ) || 0

  if (loading) {
    return <Spinner color="blue.500" mt={4} />
  }

  if (!order) {
    return <Text>Pedido não encontrado.</Text>
  }

  return (
    <ScrollView flex={1} bg="white" px={4} py={6}>
      <VStack space={4}>
        <Text fontSize="2xl" fontWeight="bold">
          Pedido Confirmado!
        </Text>
        <Text color="gray.500">ID do Pedido: {order.id}</Text>

        {order.items.map((item) => (
          <HStack key={item.id} space={4} alignItems="center">
            <Image
              source={{
                uri: item.product.image || 'https://via.placeholder.com/80',
              }}
              alt={item.product.name}
              size="80px"
              borderRadius="md"
            />
            <VStack flex={1}>
              <Text fontWeight="bold">{item.product.name}</Text>
              <Text color="gray.500">
                {item.quantity}x {formatCurrency(item.product.price)}
              </Text>
            </VStack>
            <Text>{formatCurrency(item.quantity * item.product.price)}</Text>
          </HStack>
        ))}

        <Box mt={4} borderTopWidth={1} borderColor="gray.200" pt={4}>
          <Text fontSize="lg" fontWeight="semibold">
            Total: {formatCurrency(order.totalAmount)}
          </Text>
          <Text mt={1} color="green.600">
            Cashback Recebido: {formatCurrency(cashbackAmount)}
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
