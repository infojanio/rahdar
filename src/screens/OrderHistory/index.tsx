import React, { useEffect, useState } from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Image,
  FlatList,
  Spinner,
  useToast,
  Select,
  CheckIcon,
  Badge,
  Divider,
  Button,
  ScrollView
} from 'native-base';
import { api } from '@services/api';
import { formatCurrency } from '@utils/format';

interface OrderItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    cashbackPercentage: number;
  };
}

interface Order {
  id: string;
  createdAt: string;
  totalAmount: number;
  status: string;
  items: OrderItem[];
  cashbackAmount?: number;
  qrCodeUrl?: string | null;
  storeId?: string;
}

const DEFAULT_PRODUCT_IMAGE = 'https://via.placeholder.com/50';

export function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const toast = useToast();

  useEffect(() => {
    fetchOrders();
  }, [status]);

  async function fetchOrders() {
    setLoading(true);
    try {
      const res = await api.get('/orders/history', {
        params: { status: status || undefined },
      });
      setOrders(res.data.orders || []);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      toast.show({
        description: 'Erro ao carregar histórico de pedidos',
        bgColor: 'red.500',
        placement: 'top',
      });
    } finally {
      setLoading(false);
    }
  }

  async function updateOrderStatus(orderId: string, newStatus: string) {
    try {
      await api.patch(`/orders/${orderId}/validate`, { status: newStatus });
      toast.show({
        description: 'Status do pedido atualizado com sucesso!',
        bgColor: 'green.500',
        placement: 'top',
      });
      fetchOrders(); // Atualiza a lista
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.show({
        description: 'Erro ao atualizar status do pedido',
        bgColor: 'red.500',
        placement: 'top',
      });
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'VALIDATED': return 'success';
      case 'EXPIRED': return 'error';
      default: return 'coolGray';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Pendente';
      case 'VALIDATED': return 'Validado';
      case 'EXPIRED': return 'Expirado';
      default: return status;
    }
  };

  const calculateCashback = (order: Order) => {
    return (
      order.cashbackAmount ||
      order.items.reduce((total, item) => {
        if (item.product) {
          const price = item.product.price ?? 0;
          const cashbackPercentage = item.product.cashbackPercentage ?? 0;
          return total + (price * item.quantity * cashbackPercentage) / 100;
        }
        return total;
      }, 0)
    );
  };

  if (selectedOrder) {
    return (
      <ScrollView flex={1} p={4} bg="gray.50">
        <Box bg="white" p={4} borderRadius="md" shadow={2} mb={4}>
          <HStack justifyContent="space-between" mb={2}>
            <Text fontWeight="bold">Pedido #{selectedOrder.id.substring(0, 8)}</Text>
            <Badge colorScheme={getStatusColor(selectedOrder.status)}>
              {getStatusText(selectedOrder.status)}
            </Badge>
          </HStack>
          
          <Text color="gray.500" mb={2}>
            Data: {new Date(selectedOrder.createdAt).toLocaleDateString('pt-BR')}
          </Text>

          <Text fontSize="lg" fontWeight="bold" mb={2}>
            Itens do Pedido
          </Text>

          <FlatList
  data={selectedOrder.items}
  keyExtractor={(item) => `${item.id}-${item.product?.id ?? 'no-product'}`}
  renderItem={({ item }) => (
    <HStack space={3} alignItems="center" py={2}>
      <Image
        source={{ uri: item.product?.image || DEFAULT_PRODUCT_IMAGE }}
        alt={item.product?.name ?? 'Produto não disponível'}
        size="xs"
        borderRadius="sm"
      />
      <VStack flex={1}>
        <Text fontWeight="medium">{item.product?.name ?? 'Produto não disponível'}</Text>
        <HStack justifyContent="space-between">
          <Text color="gray.500">
            {item.quantity}x {item.product ? formatCurrency(item.product.price) : 'R$ 0,00'}
          </Text>
          <Text color="green.600">
            Cashback: {item.product ? `${item.product.cashbackPercentage}%` : '0%'}
          </Text>
        </HStack>
      </VStack>
    </HStack>
  )}
  ItemSeparatorComponent={() => <Divider my={1} />}
/>

          <Divider my={3} />

          <VStack space={2}>
            <HStack justifyContent="space-between">
              <Text fontWeight="bold">Total:</Text>
              <Text>{formatCurrency(selectedOrder.totalAmount)}</Text>
            </HStack>
            
            <HStack justifyContent="space-between">
              <Text fontWeight="bold">Cashback:</Text>
              <Text color="green.600">{formatCurrency(calculateCashback(selectedOrder))}</Text>
            </HStack>
          </VStack>

          {selectedOrder.status === 'PENDING' && (
            <VStack mt={4} space={2}>
              <Text fontWeight="bold" mb={2}>Ações do Administrador:</Text>
              <Button
                colorScheme="green"
                onPress={() => updateOrderStatus(selectedOrder.id, 'VALIDATED')}
              >
                Validar Pedido
              </Button>
              <Button
                colorScheme="red"
                variant="outline"
                onPress={() => updateOrderStatus(selectedOrder.id, 'EXPIRED')}
              >
                Rejeitar Pedido
              </Button>
            </VStack>
          )}

          <Button
            mt={4}
            variant="ghost"
            colorScheme="blue"
            onPress={() => setSelectedOrder(null)}
          >
            Voltar para a lista
          </Button>
        </Box>
      </ScrollView>
    );
  }

  return (
    <Box flex={1} p={4} bg="gray.50">
      <Text fontSize="xl" fontWeight="bold" mb={4}>
        Histórico de Pedidos
      </Text>

      <Select
        selectedValue={status}
        minWidth="200"
        accessibilityLabel="Filtrar por status"
        placeholder="Filtrar por status"
        _selectedItem={{
          bg: 'teal.600',
          endIcon: <CheckIcon size={5} />,
        }}
        mb={4}
        onValueChange={(value) => setStatus(value)}
      >
        <Select.Item label="Todos" value="" />
        <Select.Item label="Pendente" value="PENDING" />
        <Select.Item label="Validado" value="VALIDATED" />
        <Select.Item label="Expirado" value="EXPIRED" />
      </Select>

      {loading ? (
        <Spinner size="lg" mt={4} />
      ) : orders.length === 0 ? (
        <Text color="gray.500" textAlign="center" mt={4}>
          Nenhum pedido encontrado.
        </Text>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Box
              bg="white"
              p={4}
              borderRadius="md"
              mb={4}
              shadow={1}
              onTouchEnd={() => setSelectedOrder(item)}
            >
              <HStack justifyContent="space-between" mb={2}>
                <Text fontWeight="bold">Pedido #{item.id.substring(0, 8)}</Text>
                <Badge colorScheme={getStatusColor(item.status)}>
                  {getStatusText(item.status)}
                </Badge>
              </HStack>
              
              <Text color="gray.500" mb={2}>
                {new Date(item.createdAt).toLocaleDateString('pt-BR')}
              </Text>
              
              <Text>Total: {formatCurrency(item.totalAmount)}</Text>
              <Text color="green.600">
                Cashback: {formatCurrency(calculateCashback(item))}
              </Text>
              
              <Text mt={2} color="blue.500" underline>
                {item.items.length} itens - Toque para detalhes
              </Text>
            </Box>
          )}
        />
      )}
    </Box>
  );
}