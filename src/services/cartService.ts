// src/services/cartService.ts
import { api } from '@services/api'

export type CartItemRequest = {
  productId: string
  quantity: number
}

export type CartItemResponse = {
  productId: string
  name: string
  image: string
  price: number
  quantity: number
  cashbackPercentage: number
}

export type CartResponse = {
  items: CartItemResponse[]
  total: number
  cashbackTotal: number
}

// Busca o carrinho completo do usuário
async function getCartFromBackend(): Promise<CartResponse> {
  const response = await api.get('/cart')

  return response.data
}

// Adiciona um item ao carrinho
async function addToCart(
  productId: string,
  quantity: number,
): Promise<CartResponse> {
  const response = await api.post('/cart/items', { productId, quantity })
  return response.data
}

// Atualiza a quantidade de um item no carrinho
async function updateCartItem(
  productId: string,
  quantity: number,
): Promise<CartResponse> {
  const response = await api.patch('/cart/items/quantity', {
    productId,
    quantity,
  })
  return response.data
}

// Remove um item do carrinho
async function removeFromCart(productId: string): Promise<CartResponse> {
  const response = await api.delete(`/cart/items/${productId}`)
  return response.data
}

// Limpa todos os itens do carrinho
async function clearCart(): Promise<{ message: string }> {
  const response = await api.delete('/cart/clear')
  return response.data
}

// Finaliza o pedido (checkout)
async function checkoutCart(): Promise<{ success: boolean; orderId: string }> {
  const response = await api.post('/orders')
  return response.data
}

export const cartService = {
  getCartFromBackend,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  checkoutCart,
}
