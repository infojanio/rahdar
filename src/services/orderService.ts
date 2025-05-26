// src/services/orderService.ts
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

// ✅ Dados do saldo de cashback
export type CashbackBalanceResponse = {
  available: number
  pending: number
}

// ✅ Dados do extrato
export type CashbackTransaction = {
  id: string
  type: 'credit' | 'debit'
  amount: number
  description: string
  createdAt: string
}

// 🔸 Buscar o pedido atual (carrinho ou último pedido aberto)
async function getOrderFromBackend(): Promise<OrderResponse> {
  try {
    const response = await api.get('/order')

    const rawItems = response.data.orderItems

    const items: OrderItemResponse[] = rawItems.map((item: any) => {
      const product = item.product
      return {
        productId: item.productId,
        name: product?.name || 'Produto desconhecido',
        image: product?.image || '',
        price: product?.price || 0,
        quantity: item.quantity,
        cashbackPercentage: product?.cashbackPercentage || 0,
        storeId: product?.storeId || '',
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

    return { items, total, cashbackTotal }
  } catch (error) {
    console.error('Erro ao buscar pedido do backend:', error)
    throw error
  }
}

// 🔸 Buscar saldo de cashback
async function getCashbackBalance(): Promise<CashbackBalanceResponse> {
  try {
    const response = await api.get('/cashback/balance')
    return response.data
  } catch (error) {
    console.error('Erro ao buscar saldo de cashback:', error)
    throw error
  }
}

// 🔸 Buscar extrato de cashback
async function getCashbackTransactions(): Promise<CashbackTransaction[]> {
  try {
    const response = await api.get('/cashback/transactions')
    return response.data.transactions
  } catch (error) {
    console.error('Erro ao buscar extrato de cashback:', error)
    throw error
  }
}

async function getPendingCashback() {
  const response = await api.get('/orders/pending-cashback')
  return response.data.pendingCashback // ajuste conforme a sua API
}

// 🔸 Usar cashback (debitar saldo disponível)
async function useCashback(amount: number): Promise<void> {
  try {
    await api.post('/cashback/use', { amount })
  } catch (error) {
    console.error('Erro ao usar cashback:', error)
    throw error
  }
}

export const orderService = {
  getOrderFromBackend,
  getCashbackBalance,
  getCashbackTransactions,
  getPendingCashback,
  useCashback,
}