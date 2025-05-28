import React, { useState, useEffect } from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Image,
  Button,
  Spinner,
  useToast,
  Badge,
  Divider,
  ScrollView,
  Center,
} from 'native-base';
import { api } from '@services/api';
import { formatCurrency } from '@utils/format';
import { Input } from '@components/Input/index';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string | null;
  cashbackPercentage: number;
}

interface OrderItem {
  id: string;
  quantity: number;
  product: Product;
}

interface Order {
  id: string;
  createdAt: string;
  totalAmount: number;
  status: string;
  items: OrderItem[];
  cashbackAmount?: number;
}

const DEFAULT_PRODUCT_IMAGE = 'https://via.placeholder.com/80';

export function OrderValidation() {
  const [searchTerm, setSearchTerm] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const toast = useToast();

   // Busca o pedido pelo ID (primeiro bloco)
 const fetchOrderById = async () => {
  if (!searchTerm.trim()) return;

  try {
    setLoading(true);
    const response = await api.get(`/orders/${searchTerm.trim()}`);

    // Verifica se a resposta tem a estrutura esperada
    if (!response.data || !response.data.id) {
      throw new Error('Pedido não encontrado');
    }

    const formattedOrder: Order = {
      id: response.data.id,
      createdAt: response.data.createdAt,
      totalAmount: response.data.totalAmount,
      status: response.data.status,
      items: response.data.items?.map((item: any) => ({
        id: item.id,
        quantity: item.quantity,
        product: {
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          image: item.product.image || DEFAULT_PRODUCT_IMAGE,
          cashbackPercentage: item.product.cashbackPercentage || 0,
        },
      })) || [], // Fallback para array vazio
    };

    setOrder(formattedOrder);
  } catch (error: any) {
    console.error('Erro ao buscar pedido:', error);
    toast.show({
      title: 'Erro',
      description: error.response?.data?.error || 'Falha ao buscar pedido',
      bgColor: 'red.500',
    });
    setOrder(null);
  } finally {
    setLoading(false);
  }
};

  // Valida o pedido (aprova cashback)
  const validateOrder = async () => {
    if (!order) return;

    try {
      setValidating(true);
      await api.patch(`/orders/${order.id}/validate`, {
        status: 'VALIDATED',
      });

      toast.show({
        description: 'Cashback aprovado com sucesso!',
        bgColor: 'green.500',
        placement: 'top',
      });

      // Atualiza o status localmente
      setOrder({ ...order, status: 'VALIDATED' });
    } catch (error) {
      console.error('Erro ao validar pedido:', error);
      toast.show({
        description: 'Erro ao aprovar cashback',
        bgColor: 'red.500',
        placement: 'top',
      });
    } finally {
      setValidating(false);
    }
  };

  const calculateOrderCashback = (order: Order) => {
    if (order.cashbackAmount !== undefined) {
      return order.cashbackAmount;
    }
    return order.items.reduce((total, item) => {
      const price = item.product.price || 0;
      const percentage = item.product.cashbackPercentage || 0;
      return total + (price * item.quantity * percentage) / 100;
    }, 0);
  };

  return (
    <Box flex={1} bg="gray.50" p={4} safeArea>
      <Text fontSize="xl" fontWeight="bold" mb={4}>
        Validação de Cashback (ADMIN)
      </Text>

  <Box>  
  <Input
    flex={1}
    placeholder="Digite o ID do pedido (ex: ABCD1234)"
    value={searchTerm}
    onChangeText={setSearchTerm}
    bg="blueGray.100"
    height={12}
    borderRadius="lg"
    _focus={{ bg: 'white' }}
  />
  <Button
    onPress={fetchOrderById}
    isLoading={loading}
    height={12}
    borderRadius="lg"
  >
    Buscar
  </Button>

</Box>

      {/* Resultado do pedido */}
      {loading && <Spinner size="lg" mt={4} />}

      {order && (
        <Box bg="white" p={4} borderRadius="md" shadow={1}>
          <HStack justifyContent="space-between" mb={2}>
            <Text fontWeight="bold">Pedido #{order.id.substring(0, 8)}</Text>
            <Badge
              colorScheme={
                order.status === 'VALIDATED' ? 'success' : 'warning'
              }
            >
              {order.status === 'VALIDATED' ? 'Aprovado' : 'Pendente'}
            </Badge>
          </HStack>

          <Text color="gray.500" mb={3}>
            {new Date(order.createdAt).toLocaleDateString('pt-BR')}
          </Text>

          <ScrollView maxH="40%" mb={3}>
            {order.items.map((item) => (
              <Box key={`item-${item.id}`} mb={3}>
                <HStack space={3} alignItems="center">
                  <Image
                    source={{ uri: item.product.image || DEFAULT_PRODUCT_IMAGE }}
                    alt={item.product.name}
                    size="sm"
                    borderRadius="md"
                  />
                  <VStack flex={1}>
                    <Text fontWeight="medium">{item.product.name}</Text>
                    <HStack justifyContent="space-between">
                      <Text color="gray.500">
                        {item.quantity}x {formatCurrency(item.product.price)}
                      </Text>
                      <Text color="green.600">
                        {item.product.cashbackPercentage}% cashback
                      </Text>
                    </HStack>
                  </VStack>
                </HStack>
              </Box>
            ))}
          </ScrollView>

          <Divider my={2} />

          <VStack space={2} mb={4}>
            <HStack justifyContent="space-between">
              <Text fontWeight="bold">Total:</Text>
              <Text>{formatCurrency(order.totalAmount)}</Text>
            </HStack>
            <HStack justifyContent="space-between">
              <Text fontWeight="bold">Cashback:</Text>
              <Text color="green.600">
                {formatCurrency(calculateOrderCashback(order))}
              </Text>
            </HStack>
          </VStack>

          {/* Botão de validação (só aparece se o pedido estiver pendente) */}
          {order.status !== 'VALIDATED' && (
            <Button
              onPress={validateOrder}
              isLoading={validating}
              bg="green.600"
              _pressed={{ bg: 'green.700' }}
            >
              Validar Cashback
            </Button>
          )}
        </Box>
      )}

      {!order && !loading && (
        <Center flex={1}>
          <Text color="gray.500">Nenhum pedido encontrado.</Text>
        </Center>
      )}
    </Box>
  );
}