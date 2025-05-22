import React, { useEffect, useState } from 'react'
import {
  VStack,
  Text,
  FlatList,
  useToast,
  Box,
  HStack,
  Heading,
  ScrollView,
} from 'native-base'
import { StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { MaterialIcons } from '@expo/vector-icons'
import { api } from '@services/api'
import { AppError } from '@utils/AppError'
import { ProductDTO } from '@dtos/ProductDTO'
import { ProductCard } from '@components/Product/ProductCard' // Note a importação correta
import { Loading } from '@components/Loading'
import { HomeScreen } from '@components/HomeScreen'
import { AppNavigatorRoutesProps } from '@routes/app.routes'

export function AllProducts() {
  const toast = useToast()
  const navigation = useNavigation<AppNavigatorRoutesProps>()

  const [products, setProducts] = useState<ProductDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)

  function handleOpenProductDetails(productId: string) {
    navigation.navigate('productDetails', { productId })
  }

  async function fetchAllProducts() {
    try {
      setIsLoading(true)

      const response = await api.get('/products/active')

      // Caso a API retorne os produtos diretamente no data, ajuste aqui
      const fetchedProducts: ProductDTO[] = response.data.products || response.data || []
      setProducts(fetchedProducts)
    } catch (error) {
      const isAppError = error instanceof AppError
      const title = isAppError ? error.message : 'Erro ao carregar produtos.'
      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAllProducts()
  }, [])

  return (
    <VStack flex={1} bg="white" safeArea>
      <HomeScreen title="Lista de Produtos" />

      <Box px={4} py={2} bg="primary.100" mx={4} my={2} borderRadius="md">
        <HStack alignItems="center" space={1}>
          <MaterialIcons name="local-offer" size={18} color="#00875F" />
          <Text color="#00875F" fontWeight="bold">
            Todos os produtos oferecem cashback!
          </Text>
        </HStack>
      </Box>

      {isLoading ? (
        <Loading />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProductCard
              product={item}  // Usando a prop `data` como no exemplo
              onPress={() => handleOpenProductDetails(item.id)}
            />
          )}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 16, paddingHorizontal: 16 }}
          ListEmptyComponent={
            <Text textAlign="center" mt={10} color="gray.500">
              Nenhum produto encontrado.
            </Text>
          }
        />
      )}
    </VStack>
  )
}

const styles = StyleSheet.create({
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
})
