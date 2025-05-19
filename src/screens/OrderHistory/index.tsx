import React, { useEffect, useState } from 'react'
import {
  Box,
  Text,
  VStack,
  HStack,
  Image,
  FlatList,
  Spinner,
  useToast,
  Badge,
  Divider,
  ScrollView,
  CheckIcon,
  Select,
} from 'native-base'
import { api } from '@services/api'
import { formatCurrency } from '@utils/format'

interface Product {
  id: string
  name: string
  price: number
  image: string | null
  cashbackPercentage: number
}

interface OrderItem {
  id: string
  quantity: number
  product: Product
}

interface Order {
  id: string
  createdAt: string
  totalAmount: number
  status: string
  //status: 'PENDING' | 'VALIDATED' | 'EXPIRED'
  items: OrderItem[]
  cashbackAmount?: number
  qrCodeUrl?: string | null
}

const DEFAULT_PRODUCT_IMAGE = 'https://via.placeholder.com/80'

export function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<string>('')
  const toast = useToast()

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        const response = await api.get(`/orders/history/`, {
          params: { status: status || undefined },
        })
        const validatedOrders = (response.data.orders || []).map(
          (order: any) => ({
            id: order.id || '',
            createdAt: order.createdAt || new Date().toISOString(),
            totalAmount: order.totalAmount || 0,
            status: ['PENDING', 'VALIDATED', 'EXPIRED'].includes(order.status)
              ? order.status
              : 'PENDING',
            items: (order.items || []).map((item: any) => ({
              id: item.id || Math.random().toString(36).substr(2, 9), // Fallback único
              quantity: item.quantity || 0,
              product: {
                id:
                  item.product?.id ||
                  item.productId?.id ||
                  Math.random().toString(36).substr(2, 9),
                name:
                  item.product?.name ||
                  item.productId?.name ||
                  'Produto desconhecido',
                price: item.product?.price || item.productId?.price || 0,
                image:
                  item.product?.image ||
                  item.productId?.image ||
                  DEFAULT_PRODUCT_IMAGE,
                cashbackPercentage:
                  item.product?.cashbackPercentage ||
                  item.productId?.cashbackPercentage ||
                  0,
              },
            })),
            cashbackAmount: order.cashbackAmount || undefined,
            qrCodeUrl: order.qrCodeUrl || null,
          }),
        )

        setOrders(validatedOrders)
      } catch (error) {
        console.error('Erro ao buscar pedidos:', error)
        toast.show({
          description: 'Erro ao carregar histórico de pedidos',
          bgColor: 'red.500',
          placement: 'top',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [status])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'warning'
      case 'VALIDATED':
        return 'success'
      case 'EXPIRED':
        return 'error'
      default:
        return 'coolGray'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pendente'
      case 'VALIDATED':
        return 'Aprovado'
      case 'EXPIRED':
        return 'Recusado'
      default:
        return status
    }
  }

  const calculateOrderCashback = (order: Order) => {
    if (order.cashbackAmount !== undefined) {
      return order.cashbackAmount
    }
    return order.items.reduce((total, item) => {
      const price = item.product?.price || 0
      const percentage = item.product?.cashbackPercentage || 0
      return total + (price * item.quantity * percentage) / 100
    }, 0)
  }

  if (loading) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center">
        <Spinner size="lg" />
      </Box>
    )
  }

  return (
    <Box>
      <Box ml={4} mr={4} mt={2} mb={2}>
        <Text fontSize="xl" fontWeight="bold" mb={4}>
          Meus Pedidos
        </Text>
        <Select
          selectedValue={status}
          minWidth="200"
          accessibilityLabel="Filtrar por status"
          placeholder="Filtrar por status"
          _selectedItem={{ bg: 'teal.600', endIcon: <CheckIcon size={5} /> }}
          onValueChange={(value) => setStatus(value)}
        >
          <Select.Item label="Todos" value="" />
          <Select.Item label="Pendente" value="PENDING" />
          <Select.Item label="Validado" value="VALIDATED" />
          <Select.Item label="Expirado" value="EXPIRED" />
        </Select>
      </Box>
      <ScrollView bg="gray.50" p={4}>
        {orders.length === 0 ? (
          <Box bg="white" p={4} borderRadius="md" alignItems="center">
            <Text color="gray.500">Nenhum pedido encontrado</Text>
          </Box>
        ) : (
          <VStack space={4}>
            {orders.map((order) => (
              <Box
                key={`order-${order.id}`}
                bg="white"
                p={4}
                borderRadius="md"
                shadow={1}
              >
                {/* Cabeçalho do Pedido */}
                <HStack justifyContent="space-between" mb={2}>
                  <Text fontWeight="bold">
                    Pedido #{order.id.substring(0, 8)}
                  </Text>
                  <Badge colorScheme={getStatusColor(order.status)}>
                    {getStatusText(order.status)}
                  </Badge>
                </HStack>

                <Text color="gray.500" mb={3}>
                  {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                </Text>

                {/* Lista de Itens */}
                <VStack space={3} mb={3}>
                  {order.items.map((item) => {
                    const product = item.product || {}
                    const uniqueKey = `item-${order.id}-${item.id}-${product.id}`
                    return (
                      <HStack key={uniqueKey} space={3} alignItems="center">
                        <Image
                          source={{
                            uri: product.image || DEFAULT_PRODUCT_IMAGE,
                          }}
                          alt={product.name}
                          size="sm"
                          borderRadius="md"
                          fallbackElement={
                            <Box
                              bg="gray.200"
                              size="sm"
                              borderRadius="md"
                              justifyContent="center"
                              alignItems="center"
                            >
                              <Text color="gray.500">Sem imagem</Text>
                            </Box>
                          }
                        />
                        <VStack flex={1}>
                          <Text fontWeight="medium">{product.name}</Text>
                          <HStack justifyContent="space-between">
                            <Text color="gray.500">
                              {item.quantity}x {formatCurrency(product.price)}
                            </Text>
                            <Text color="green.600">
                              {product.cashbackPercentage}% cashback
                            </Text>
                          </HStack>
                        </VStack>
                      </HStack>
                    )
                  })}
                </VStack>

                <Divider my={2} />

                {/* Resumo Financeiro */}
                <VStack space={2}>
                  <HStack justifyContent="space-between">
                    <Text fontWeight="bold">Subtotal:</Text>
                    <Text fontSize={'16'}>
                      {formatCurrency(order.totalAmount)}
                    </Text>
                  </HStack>

                  <HStack justifyContent="space-between">
                    <Text fontWeight="bold" fontSize={'16'}>
                      Cashback:
                    </Text>
                    <Text color="green.600" fontWeight={'bold'} fontSize={'16'}>
                      {formatCurrency(calculateOrderCashback(order))}
                    </Text>
                  </HStack>
                </VStack>
              </Box>
            ))}
          </VStack>
        )}
      </ScrollView>
    </Box>
  )
}
