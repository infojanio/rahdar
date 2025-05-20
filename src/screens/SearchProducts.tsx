import { useEffect, useState, useCallback } from 'react'
import {
  Box,
  FlatList,
  HStack,
  Text,
  VStack,
  useToast,
  Input,
} from 'native-base'
import { useNavigation } from '@react-navigation/native'
import { api } from '@services/api'
import { AppError } from '@utils/AppError'
import { ProductDTO } from '@dtos/ProductDTO'
import { ProductCard } from '@components/Product/ProductCard'
import { Loading } from '@components/Loading'
import { HomeScreen } from '@components/HomeScreen'
import { AppNavigatorRoutesProps } from '@routes/app.routes'
import debounce from 'lodash.debounce'

export function SearchProducts() {
  const toast = useToast()
  const navigation = useNavigation<AppNavigatorRoutesProps>()

  const [searchTerm, setSearchTerm] = useState('')
  const [products, setProducts] = useState<ProductDTO[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleOpenProductDetails = (productId: string) => {
    navigation.navigate('productDetails', { productId })
  }

  const fetchProductsByName = useCallback(
    debounce(async (query: string) => {
      if (!query.trim() || query.length < 3) {
        setProducts([])
        setHasSearched(false)
        return
      }

      try {
        setIsLoading(true)
        setHasSearched(true)
        
        const response = await api.get('/products/search', {
          params: { query }
        })
        
        setProducts(response.data.products || [])
      } catch (error) {
        const title =
          error instanceof AppError ? error.message : 'Erro ao buscar produtos.'
        toast.show({ title, placement: 'top', bgColor: 'red.500' })
        setProducts([])
      } finally {
        setIsLoading(false)
      }
    }, 500),
    []
  )

  useEffect(() => {
    fetchProductsByName(searchTerm)
    
    return () => {
      fetchProductsByName.cancel()
    }
  }, [searchTerm, fetchProductsByName])

  return (
    <VStack flex={1} bg="white" safeArea>
      <HomeScreen title="Buscar Produtos" />

      <Box px={4} pt={4}>
        <Input
          placeholder="Digite o nome do produto..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          variant="filled"
          borderRadius="lg"
          bg="gray.100"
          px={4}
          py={3}
          fontSize="md"
          _focus={{
            bg: "gray.200",
            borderColor: "primary.500"
          }}
          InputRightElement={
            <Box pr={3}>
              {isLoading && <Loading  />}
            </Box>
          }
        />
      </Box>

      {isLoading ? (
        <Loading />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{
            justifyContent: 'space-between',
            paddingHorizontal: 20,
          }}
          contentContainerStyle={{ paddingBottom: 16, paddingTop: 8 }}
          renderItem={({ item }) => (
            <ProductCard 
              product={item} 
              onPress={() => handleOpenProductDetails(item.id)} 
            />
          )}
          ListEmptyComponent={
            hasSearched ? (
              <Text textAlign="center" mt={10}>
                Nenhum produto encontrado com esse nome.
              </Text>
            ) : searchTerm.length > 0 && searchTerm.length < 3 ? (
              <Text textAlign="center" mt={10}>
                Digite pelo menos 3 caracteres para buscar.
              </Text>
            ) : null
          }
        />
      )}
    </VStack>
  )
}