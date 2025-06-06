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
  Checkbox,
  useToast,
} from 'native-base'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Alert } from 'react-native'
import { api } from '@services/api'
import { useAuth } from '@hooks/useAuth'
import { formatCurrency } from '@utils/format'
import { AppNavigatorRoutesProps } from '@routes/app.routes'
import { StorageCartProps } from '@storage/storageCart'
import { useContext } from 'react'
import { CartContext } from '@contexts/CartContext'
import { HomeScreen } from '@components/HomeScreen'

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

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )

  const cashbackToReceive = parseFloat(
    cartItems
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
          storeId: item.storeId ?? '',
        },
      }))
      setCartItems(formatted)
    }
  }, [cart])

  useEffect(() => {
    // Buscar saldo de cashback do usuário
    const fetchCashbackBalance = async () => {
      if (!user?.id) return
      
      try {
        //const response = await api.get(`/cashbacks/balance/${user.id}`)
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
       // status: 'warning',
      })
      return
    }

    setApplyingCashback(true)
    
    try {
      // Calcula o valor máximo que pode ser aplicado (o menor entre saldo e total do pedido)
      const maxDiscount = Math.min(cashbackBalance, totalAmount)
      setDiscountApplied(maxDiscount)
      setUseCashback(true)
      
      toast.show({
        title: 'Cashback aplicado!',
        description: `Desconto de ${formatCurrency(maxDiscount)} aplicado ao pedido.`,
       // status: 'success',
      })
    } catch (error) {
      console.error('Erro ao aplicar cashback:', error)
      toast.show({
        title: 'Erro',
        description: 'Não foi possível aplicar o cashback.',
       // status: 'error',
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
     // status: 'info',
    })
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

      const payload = {
        user_id: user.id,
        store_id: storeId,
        items: cartItems.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
          subtotal: parseFloat((item.quantity * item.product.price).toFixed(2)),
        })),
        cashback_discount: useCashback ? discountApplied : 0,
      }

      console.log('📩 Enviando payload:', payload)

      const res = await api.post('/orders', payload)
      console.log('Pedido criado:', res.data)

      const orderId = res.data?.id || res.data?.orderId

      if (orderId) {
        await clearCart()
        navigation.navigate('orderConfirmation', { 
          orderId,
          cashbackEarned: cashbackToReceive,
          cashbackUsed: useCashback ? discountApplied : 0
        })
        console.log('✅ ID do pedido recebido:', orderId)
      } else {
        Alert.alert(
          'Erro',
          'O pedido foi criado, mas o ID não foi retornado corretamente.',
        )
      }
    } catch (err) {
      console.error('Erro ao confirmar pedido', err)
      Alert.alert('Erro', 'Não foi possível confirmar o pedido')
    } finally {
      setLoading(false)
    }
  }

  return (
    
    <Box flex={1} bg="white" px={4} py={6}>
      
      <HomeScreen title={' '} />
      
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
      
      {/* Seção de Cashback */}
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
      
      {/* Resumo financeiro */}
      <VStack space={2}>
        <HStack justifyContent="space-between">
          <Text fontSize="md">Subtotal:</Text>
          <Text fontSize="md">{formatCurrency(totalAmount)}</Text>
        </HStack>
        
        {useCashback && (
          <HStack justifyContent="space-between">
            <Text fontSize="md">Desconto (cashback):</Text>
            <Text fontSize="md" color="green.600">
              -{formatCurrency(discountApplied)}
            </Text>
          </HStack>
        )}
        
        <HStack justifyContent="space-between" mt={2}>
          <Text fontSize="20" fontWeight="bold">
            Total:
          </Text>
          <Text fontSize="20" fontWeight="bold">
            {formatCurrency(totalAmount - discountApplied)}
          </Text>
        </HStack>

        <Text fontSize="md" color="green.600" mt={2}>
          Cashback esperado: {formatCurrency(cashbackToReceive)}
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