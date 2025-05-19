// src/services/cartService.ts
import { api } from '@services/api'

export type OrderItemRequest = {
  productId: string
  quantity: number
}

export type OrderItemResponse = {
  productId: string
  name: string
  image: string
  price: number
  quantity: number
  cashbackPercentage: number
  storeId: string
}

export type OrderResponse = {
  items: OrderItemResponse[]
  total: number
  cashbackTotal: number
}

// Busca o carrinho completo do usuário
// src/services/cartService.ts
async function getOrderFromBackend(): Promise<OrderResponse> {
  try {
    const response = await api.get('/order')
    console.log('Resposta do backend:', response.data) // Log da resposta crua

    const rawItems = response.data.orderItems

    const items: OrderItemResponse[] = rawItems.map((item: any) => {
      console.log('Item processado:', item) // Verificando cada item
      const product = item.product
      return {
        productId: item.productId,
        name: product?.name || 'Produto desconhecido',
        image: product?.image || '',
        price: product?.price || 0,
        quantity: item.quantity,
        cashbackPercentage: product?.cashbackPercentage || 0,
        storeId: product.storeId || '15c26392-6a84-425c-b0ad-951463e27e67', // Aqui, o storeId é atribuído
      }
    })

    const total = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    )
    const cashbackTotal = items.reduce(
      (acc, item) =>
        acc + (item.price * item.quantity * item.cashbackPercentage) / 100,
      0,
    )

    console.log('Pedido processado:', { items, total, cashbackTotal })

    return { items, total, cashbackTotal }
  } catch (error) {
    console.error('Erro ao buscar pedido do backend:', error)
    throw error
  }
}

export const orderService = {
  getOrderFromBackend,
}
