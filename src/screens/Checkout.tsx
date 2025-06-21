import React, { useEffect, useState, useContext } from 'react'

import { useFocusEffect } from '@react-navigation/native'
import { useCallback } from 'react'

import {
  Box,
  Text,
  VStack,
  HStack,
  Image,
  Button,
  FlatList,
  Divider,
  useToast,
  IconButton,
  ArrowBackIcon,
} from 'native-base'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Alert } from 'react-native'
import { api } from '@services/api'
import { useAuth } from '@hooks/useAuth'
import { formatCurrency } from '@utils/format'
import { AppNavigatorRoutesProps } from '@routes/app.routes'
import { StorageCartProps } from '@storage/storageCart'
import { CartContext } from '@contexts/CartContext'

interface CartItem {
  id: string
  product: {
    id: string
    name: string
    price: number
    image: string
    cashback_percentage: number
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
  const [applyingCashback, setApplyingCashback] = useState(false)
  const [useCashback, setUseCashback] = useState(false)
  const [cashbackBalance, setCashbackBalance] = useState(0)
  const [discountApplied, setDiscountApplied] = useState(0)
  const navigation = useNavigation<AppNavigatorRoutesProps>()
  const route = useRoute()
  const { user } = useAuth()
  const { cart } = route.params as CheckoutScreenRouteParams
  const { clearCart } = useContext(CartContext)
  const toast = useToast()

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  )

  const effectiveDiscount = Math.min(discountApplied, subtotal)
  const totalAmount = subtotal - effectiveDiscount

  const cashbackToReceive = parseFloat(
    cartItems
      .reduce(
        (sum, item) =>
          sum +
          (item.product.price *
            item.quantity *
            item.product.cashback_percentage) /
            100,
        0,
      )
      .toFixed(2),
  )

  useEffect(() => {
    // Resetar estado de desconto ao abrir
    setUseCashback(false)
    setDiscountApplied(0)
  }, [])

  useFocusEffect(
    useCallback(() => {
      const fetchCashbackBalance = async () => {
        try {
          const response = await api.get('/users/balance')
          setCashbackBalance(response.data.balance || 0)
        } catch (error) {
          console.error('Erro ao buscar saldo de cashback:', error)
        }
      }

      fetchCashbackBalance()
    }, []),
  )

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
          cashback_percentage: item.cashback_percentage ?? 0,
          storeId: item.storeId ?? '',
        },
      }))
      setCartItems(formatted)
    }
  }, [cart])

  useEffect(() => {
    const fetchCashbackBalance = async () => {
      if (!user?.id) return

      try {
        const response = await api.get('/users/balance')
        setCashbackBalance(response.data.balance || 0)
      } catch (error) {
        console.error('Erro ao buscar saldo de cashback:', error)
      }
    }

    fetchCashbackBalance()
  }, [user?.id])

  const handleApplyCashback = async () => {
    if (!user?.id) {
      Alert.alert('Erro', 'Usuário não autenticado. Faça login novamente.')
      return
    }

    if (cashbackBalance <= 0) {
      toast.show({
        title: 'Saldo insuficiente',
        description: 'Você não possui saldo de cashback disponível.',
      })
      return
    }

    setApplyingCashback(true)

    try {
      const maxDiscount = Math.min(cashbackBalance, totalAmount)
      setDiscountApplied(maxDiscount)
      setUseCashback(true)

      toast.show({
        title: 'Cashback aplicado!',
        description: `Desconto de ${formatCurrency(
          maxDiscount,
        )} aplicado ao pedido.`,
      })
    } catch (error) {
      console.error('Erro ao aplicar cashback:', error)
      toast.show({
        title: 'Erro',
        description: 'Não foi possível aplicar o cashback.',
      })
    } finally {
      setApplyingCashback(false)
    }
  }

  const handleRemoveCashback = () => {
    setDiscountApplied(0)
    setUseCashback(false)
    toast.show({
      title: 'Cashback removido',
      description: 'O desconto foi removido do seu pedido.',
    })
  }

  function handleGoBack() {
    navigation.goBack()
  }

  async function handleConfirmOrder() {
    if (!user?.id) {
      Alert.alert('Erro', 'Usuário não autenticado. Faça login novamente.')
      return
    }

    if (cartItems.length === 0) return

    setLoading(true)
    try {
      const storeIds = Array.from(
        new Set(cartItems.map((item) => item.product.storeId)),
      )

      if (storeIds.length > 1) {
        Alert.alert('Erro', 'Seu carrinho contém itens de diferentes lojas.')
        setLoading(false)
        return
      }

      const storeId = storeIds[0]

      if (effectiveDiscount > cashbackBalance) {
        Alert.alert('Erro', 'Saldo de cashback insuficiente')
        return
      }

      if (totalAmount < 0) {
        Alert.alert('Erro', 'Valor total inválido após desconto')
        return
      }

      const payload = {
        user_id: user.id,
        store_id: storeId,
        items: cartItems.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
          subtotal: parseFloat((item.quantity * item.product.price).toFixed(2)),
        })),
        discount_applied: effectiveDiscount,
        total_amount: totalAmount,
        use_cashback: useCashback,
      }

      const response = await api.post('/orders', payload)

      const updatedBalance = await api.get('/users/balance')
      setCashbackBalance(updatedBalance.data.balance)

      const orderId = response.data.order?.id
      if (!orderId) throw new Error('ID do pedido não retornado pelo servidor')

      await clearCart()
      navigation.navigate('orderConfirmation', {
        orderId,
        cashbackEarned: cashbackToReceive,
        cashbackUsed: useCashback ? discountApplied : 0,
      })
    } catch (err) {
      console.error('Erro ao confirmar pedido', err)
      Alert.alert(
        'Erro',
        err.response?.data?.message || 'Não foi possível confirmar o pedido',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box flex={1} bg="white" px={4} py={6}>
      <ArrowBackIcon onPress={() => handleGoBack()} />
      <Text fontSize="16" fontWeight="bold" mt={2} textAlign={'center'}>
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

      <VStack space={3} mb={4}>
        <Text fontSize="lg" fontWeight="bold">
          Seu saldo de cashback: {formatCurrency(cashbackBalance)}
        </Text>

        {useCashback ? (
          <VStack space={2}>
            <Text color="green.600">
              Desconto aplicado: {formatCurrency(discountApplied)}
            </Text>
            <Button
              size="sm"
              variant="outline"
              colorScheme="red"
              onPress={handleRemoveCashback}
              isLoading={applyingCashback}
            >
              Remover desconto
            </Button>
          </VStack>
        ) : (
          <Button
            size="sm"
            colorScheme="green"
            onPress={handleApplyCashback}
            isLoading={applyingCashback}
            isDisabled={cashbackBalance <= 0}
          >
            Usar cashback como desconto
          </Button>
        )}
      </VStack>

      <Divider my={4} />

      <VStack>
        <Box bg={'gray.100'}>
          <HStack justifyContent="space-between">
            <Text fontSize="md">Subtotal:</Text>
            <Text fontSize="md">{formatCurrency(subtotal)}</Text>
          </HStack>

          {useCashback && (
            <HStack justifyContent="space-between">
              <Text fontSize="md">Desconto (cashback):</Text>
              <Text fontSize="md" color="green.600">
                -{formatCurrency(effectiveDiscount)}
              </Text>
            </HStack>
          )}
        </Box>

        <HStack justifyContent="space-between" mt={2}>
          <Text fontSize="16" fontWeight="bold">
            Total:
          </Text>
          <Text fontSize="18" fontWeight="bold">
            {formatCurrency(totalAmount)}
          </Text>
        </HStack>

        <Text fontSize="md" color="green.600" mt={2}>
          {useCashback
            ? 'Compras usando Saldo: sem cashback.'
            : `Cashback esperado: ${formatCurrency(cashbackToReceive)}`}
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
