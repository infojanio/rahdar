import React, { useEffect, useState } from 'react'
import {
  Box,
  Text,
  VStack,
  HStack,
  Image,
  Button,
  FlatList,
  Spinner,
  useToast,
  Select,
  CheckIcon,
} from 'native-base'
import { api } from '@services/api'
import QRCode from 'react-native-qrcode-svg'
import { formatCurrency } from '@utils/format'

interface Product {
  name?: string
  image?: string
  price?: number
}

interface OrderItem {
  id: string
  createdAt: string
  totalAmount: number
  cashbackAmount: number
  status: string
  qrCodeUrl?: string | null
  items?: Array<{
    product?: Product
    quantity?: number
  }>
}

const DEFAULT_PRODUCT_IMAGE = 'https://via.placeholder.com/50'

export function OrderHistory() {
  const [orders, setOrders] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string>('')
  const toast = useToast()

  useEffect(() => {
    fetchOrders()
  }, [status])

  async function fetchOrders() {
    setLoading(true)
    try {
      const res = await api.get(`/orders/history/`, {
        params: { status: status || undefined },
      })
      setOrders(res.data.orders)
    } catch (error) {
      console.error('Fetch orders error:', error)
      toast.show({
        description: 'Erro ao carregar pedidos. Verifique sua conexão.',
        bgColor: 'red.500',
        placement: 'top',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box flex={1} p={4} bg="white">
      <Text fontSize="xl" fontWeight="bold" mb={4}>
        Histórico de Pedidos
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

      {loading ? (
        <Spinner mt={4} />
      ) : orders.length === 0 ? (
        <Text color="gray.500" textAlign="center" mt={4}>
          Nenhum pedido encontrado.
        </Text>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <VStack
              borderWidth={1}
              borderColor="gray.200"
              p={3}
              mb={4}
              borderRadius="md"
            >
              <HStack justifyContent="space-between">
                <Text fontWeight="bold">Pedido: {item.id}</Text>
                <Text>{new Date(item.createdAt).toLocaleDateString()}</Text>
              </HStack>

              <Text>Total: {formatCurrency(item.totalAmount)}</Text>
              <Text>Cashback: {formatCurrency(item.cashbackAmount)}</Text>

              <HStack mt={3} space={3} alignItems="center">
                {item.qrCodeUrl ? (
                  <QRCode value={item.qrCodeUrl} size={100} />
                ) : (
                  <Text color="red.500">QR Code não disponível.</Text>
                )}
              </HStack>
            </VStack>
          )}
        />
      )}
    </Box>
  )
}
