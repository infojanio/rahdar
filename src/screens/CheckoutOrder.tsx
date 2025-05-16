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
import { StorageOrderProps } from '@storage/storageCart'
import { useContext } from 'react'
import { CartContext } from '@contexts/CartContext'

interface OrderItem {
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

type CheckoutOrderScreenRouteParams = {
  order: StorageOrderProps[]
}

export function CheckoutOrder() {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(false)
  const navigation = useNavigation<AppNavigatorRoutesProps>()
  const route = useRoute()
  const { user } = useAuth()
  const { order } = route.params as CheckoutOrderScreenRouteParams
  

  useEffect(() => {
    if (order && Array.isArray(order)) {
      const formatted = order.map((item) => ({
        id: item.productId,
        quantity: Number(item.quantity),
        product: {
          id: item.productId,
          name: item.name,
          price: item.price,
          image: item.image,
          cashbackPercentage: item.cashbackPercentage ?? 0,
          storeId: item.storeId ?? '', // Garantindo que o storeId seja atribuído corretamente
        },
      }))
      setOrderItems(formatted)
    }
  }, [order])

  async function handleConfirmOrder() {
    //verifica se têm usuário logado
    if (!user?.id) {
      Alert.alert('Erro', 'Usuário não autenticado. Faça login novamente.')
      return
    }

    if (orderItems.length === 0) return

    setLoading(true)
    try {
      const storeIds = Array.from(
        new Set(orderItems.map((item) => item.product.storeId)),
      )

      if (storeIds.length > 1) {
        Alert.alert('Erro', 'Seu pedido contém itens de diferentes lojas.')
        setLoading(false)
        return
      }

      const storeId = storeIds[0]

      const payload = {
        user_id: user.id,
        store_id: storeId,
        items: orderItems.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
          subtotal: parseFloat((item.quantity * item.product.price).toFixed(2)),
        })),
      }

      console.log('📩 Enviando payload:', payload)

      const res = await api.post('/orders', payload)
      console.log('Pedido criado:', res.data)

      // Capturando o ID do pedido corretamente
      const orderId = res.data?.id || res.data?.orderId

      if (orderId) {
       // await clearCart()
        navigation.navigate('orderConfirmation', { orderId })
        console.log('✅ ID do pedido recebido:', orderId)
      } else {
        Alert.alert(
          'Erro',
          'O pedido foi criado, mas o ID não foi retornado corretamente.',
        )
      }

      // Calculando o cashback diretamente do carrinho
      const cashbackToReceive = parseFloat(
        orderItems
          .reduce(
            (sum, item) =>
              sum +
              (item.product.price *
                item.quantity *
                item.product.cashbackPercentage) /
                100,
            0,
          )
          .toFixed(2),
      )

      Alert.alert(
        'Pedido confirmado!',
        `Você receberá ${formatCurrency(cashbackToReceive)} de cashback.`,
      )

     // await clearCart() // Limpando o carrinho após o pedido
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
        data={orderItems}
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
            orderItems.reduce(
              (sum, item) => sum + item.product.price * item.quantity,
              0,
            ),
          )}
        </Text>

        <Text fontSize="18" color="green.600">
          Cashback esperado:{' '}
          {formatCurrency(
            orderItems.reduce(
              (sum, item) =>
                sum +
                (item.product.price *
                  item.quantity *
                  item.product.cashbackPercentage) /
                  100,
              0,
            ),
          )}
        </Text>

        <Button
          mt={6}
          colorScheme="blue"
          isLoading={loading}
          onPress={handleConfirmOrder}
          isDisabled={loading || orderItems.length === 0}
          rounded="xl"
        >
          Confirmar Pedido
        </Button>
      </VStack>
    </Box>
  )
}
