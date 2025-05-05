// src/contexts/CartContext.tsx

import { createContext, ReactNode, useEffect, useState } from 'react'
import { cartService } from '@services/cartService'

type CartItem = {
  productId: string
  name: string
  image: string
  price: number
  quantity: number
  cashbackPercentage: number
}

type CartContextData = {
  cartItems: CartItem[]
  addProductCart: (
    item: Omit<CartItem, 'quantity'> & { quantity?: number },
  ) => Promise<void>
  removeProductCart: (productId: string) => Promise<void>
  updateProductQuantity: (productId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  fetchCart: () => Promise<void>
}

export const CartContext = createContext({} as CartContextData)

type CartProviderProps = {
  children: ReactNode
}

export function CartProvider({ children }: CartProviderProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  async function fetchCart() {
    const backendCart = await cartService.getCartFromBackend()
    setCartItems(backendCart.items) // Ajuste conforme estrutura do backend
  }

  async function addProductCart(
    item: Omit<CartItem, 'quantity'> & { quantity?: number },
  ) {
    const quantity = item.quantity ?? 1
    await cartService.addToCart(item.productId, quantity)
    await fetchCart()
  }

  async function removeProductCart(productId: string) {
    await cartService.removeFromCart(productId)
    await fetchCart()
  }

  async function updateProductQuantity(productId: string, quantity: number) {
    await cartService.updateCartItem(productId, quantity)
    await fetchCart()
  }

  async function clearCart() {
    await cartService.clearCart()
    setCartItems([])
  }

  useEffect(() => {
    fetchCart()
  }, [])

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addProductCart,
        removeProductCart,
        updateProductQuantity,
        clearCart,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
