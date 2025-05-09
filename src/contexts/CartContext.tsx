import { createContext, ReactNode, useEffect, useState } from 'react'
import { cartService } from '@services/cartService'

type CartItem = {
  productId: string
  name: string
  image: string
  price: number
  quantity: number
  store_id: string
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
    try {
      const backendCart = await cartService.getCartFromBackend()
      setCartItems(backendCart.items)
    } catch (error) {
      console.error('Erro ao carregar o carrinho:', error)
      setCartItems([]) // fallback para evitar estado indefinido
    }
  }

  async function addProductCart(
    item: Omit<CartItem, 'quantity'> & { quantity?: number },
  ) {
    try {
      const quantity = item.quantity ?? 1
      await cartService.addToCart(item.productId, quantity)
      await fetchCart()
    } catch (error) {
      console.error('Erro ao adicionar item ao carrinho:', error)
    }
  }

  async function removeProductCart(productId: string) {
    try {
      await cartService.removeFromCart(productId)
      await fetchCart()
    } catch (error) {
      console.error('Erro ao remover item do carrinho:', error)
    }
  }

  async function updateProductQuantity(productId: string, quantity: number) {
    try {
      await cartService.updateCartItem(productId, quantity)
      await fetchCart()
    } catch (error) {
      console.error('Erro ao atualizar quantidade do item:', error)
    }
  }

  async function clearCart() {
    try {
      await cartService.clearCart()
      setCartItems([])
    } catch (error) {
      console.error('Erro ao limpar carrinho:', error)
    }
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
