import { useEffect, useState, useCallback, useRef } from 'react'
import { Box, FlatList, Text, VStack, useToast } from 'native-base'
import { TextInput, StyleSheet } from 'react-native'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { api } from '@services/api'
import { AppError } from '@utils/AppError'
import { ProductDTO } from '@dtos/ProductDTO'
import { ProductCard } from '@components/Product/ProductCard'
import { Loading } from '@components/Loading'
import { HomeScreen } from '@components/HomeScreen'
import { AppNavigatorRoutesProps } from '@routes/app.routes'
import debounce from 'lodash.debounce'

// Função para remover acentos
const removeAccents = (str: string) => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export function SearchProducts() {
  const toast = useToast()
  const navigation = useNavigation<AppNavigatorRoutesProps>()
  const inputRef = useRef<TextInput>(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [products, setProducts] = useState<ProductDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isSearching, setIsSearching] = useState(false)

  // Focar no input quando a tela for carregada
  useFocusEffect(
    useCallback(() => {
      setTimeout(() => inputRef.current?.focus(), 100)
    }, []),
  )

  const handleOpenProductDetails = (productId: string) => {
    navigation.navigate('productDetails', { productId })
  }

  // Carrega os produtos iniciais (paginação)
  const fetchProducts = async (reset = false) => {
    try {
      const currentPage = reset ? 1 : page
      const response = await api.get('/products/active', {
        params: {
          page: currentPage,
          limit: 10,
          // Envia o termo de busca normalizado (sem acentos)
          query: searchTerm ? removeAccents(searchTerm) : undefined,
        },
      })

      if (reset) {
        setProducts(response.data.products || [])
      } else {
        setProducts((prev) => [...prev, ...(response.data.products || [])])
      }

      setHasMore((response.data.products?.length || 0) >= 6)
    } catch (error) {
      const title =
        error instanceof AppError ? error.message : 'Erro ao carregar produtos.'
      toast.show({ title, placement: 'top', bgColor: 'red.500' })
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }

  // Busca produtos na API
  const searchProducts = useCallback(
    debounce(async (query: string) => {
      if (query.trim() === '') {
        setIsSearching(false)
        setPage(1)
        await fetchProducts(true)
        return
      }

      try {
        setIsSearching(true)
        setIsLoading(true)

        const response = await api.get('/products/search', {
          params: {
            query: removeAccents(query), // Envia sem acentos
          },
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
    }, 300),
    [],
  )

  // Carrega mais produtos quando chega no final
  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore || isSearching) return

    setIsLoadingMore(true)
    setPage((prev) => prev + 1)
  }

  // Efeito para carregar produtos iniciais
  useEffect(() => {
    fetchProducts(true)
  }, [])

  // Efeito para paginação
  useEffect(() => {
    if (page > 1 && !isSearching) {
      fetchProducts()
    }
  }, [page])

  // Efeito para busca
  useEffect(() => {
    searchProducts(searchTerm)
    return () => searchProducts.cancel()
  }, [searchTerm])

  return (
    <VStack flex={1} bg="white" safeArea>
      <HomeScreen title="Buscar Produtos" />

      <Box px={4} pt={4}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Buscar produtos..."
          placeholderTextColor="#777"
          value={searchTerm}
          onChangeText={setSearchTerm}
          returnKeyType="search"
          autoCorrect={false}
        />
      </Box>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.contentContainer}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => handleOpenProductDetails(item.id)}
          />
        )}
        onEndReached={!isSearching ? handleLoadMore : null}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={
          isLoading ? (
            <Loading />
          ) : (
            <Text textAlign="center" mt={10}>
              Nenhum produto encontrado
            </Text>
          )
        }
        ListFooterComponent={isLoadingMore ? <Loading /> : null}
      />
    </VStack>
  )
}

const styles = StyleSheet.create({
  input: {
    height: 50,
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 8,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  contentContainer: {
    paddingBottom: 16,
  },
})