import { useCallback, useContext, useEffect, useState } from 'react'
import { Box, VStack, useToast, ScrollView } from 'native-base'

import { useFocusEffect, useNavigation } from '@react-navigation/native'

import { AppError } from '@utils/AppError'
import { api } from '@services/api'
import { useAuth } from '@hooks/useAuth'

import { ProductDTO } from '@dtos/ProductDTO'
import { AppNavigatorRoutesProps } from '@routes/app.routes'

import { HomeHeader } from '@components/HomeHeader'
import { Category } from '@components/Category'
import { Promotion } from '@components/Promotion'
import { Loading } from '@components/Loading'

import { ProductCashback } from './Product/ProductCashback'
import { ProductQuantity } from './Product/ProductQuantity'
import { InstagramReelsCarousel } from './InstagramReelsCarousel'
import { CashbackRegulationCard } from './CashbackRegulationCard'
import { CartContext } from '@contexts/CartContext'
import { Reel } from '@components/Reel'

export function Home() {
  const { fetchCart } = useContext(CartContext)

  const navigation = useNavigation<AppNavigatorRoutesProps>()
  const toast = useToast()

  const [products, setProducts] = useState<ProductDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const { userId } = useAuth()

  function handleOpenProductDetails(productId: string) {
    navigation.navigate('productDetails', { productId })
  }

  async function fetchProducts() {
    try {
      setIsLoading(true)

      const response = await api.get('/products')
      setProducts(response.data)
    } catch (error) {
      const isAppError = error instanceof AppError
      const title = isAppError
        ? error.message
        : 'Não foi possível carregar os produtos.'

      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchProducts()
    }, []),
  )

  // Efeito para carregar o carrinho inicial
  useEffect(() => {
    if (userId) {
      fetchCart()
    }
  }, [userId])

  return (
    <VStack flex={1} bg="gray.100">
      <Box>
        <HomeHeader />
      </Box>

      {isLoading ? (
        <Loading />
      ) : (
        <ScrollView flex={1} showsVerticalScrollIndicator={false}>
          <VStack flex={1} pt={1} bg="gray.100" pb={8}>
            <Category />
            <Promotion />

            {/* Aqui passamos produtos para os componentes */}
            <ProductCashback />
            <ProductQuantity />
            <Reel />
            <CashbackRegulationCard />
          </VStack>
        </ScrollView>
      )}
    </VStack>
  )
}
