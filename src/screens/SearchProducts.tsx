import React, { useEffect, useState, useCallback, useRef } from 'react'
import { Box, FlatList, HStack, Text, VStack, useToast } from 'native-base'
import { TextInput, StyleSheet } from 'react-native'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { MaterialIcons } from '@expo/vector-icons'
import { api } from '@services/api'
import { AppError } from '@utils/AppError'
import { ProductDTO } from '@dtos/ProductDTO'
import { ProductCard } from '@components/Product/ProductCard'
import { Loading } from '@components/Loading'
import { HomeScreen } from '@components/HomeScreen'
import { AppNavigatorRoutesProps } from '@routes/app.routes'
import debounce from 'lodash.debounce'

// 🔤 Função para remover acentos
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

  // 🔍 Foca no input ao abrir
  useFocusEffect(
    useCallback(() => {
      setTimeout(() => inputRef.current?.focus(), 100)
    }, []),
  )

  const handleOpenProductDetails = (productId: string) => {
    navigation.navigate('productDetails', { productId })
  }

  // 🔥 Carregar produtos ativos com paginação
  const fetchProducts = async (reset = false) => {
    try {
      const currentPage = reset ? 1 : page

      const response = await api.get('/products/active', {
        params: {
          page: currentPage,
          limit: 6,
        },
      })

      const fetchedProducts = response.data.products || []

      if (reset) {
        setProducts(fetchedProducts)
      } else {
        setProducts((prev) => [...prev, ...fetchedProducts])
      }

      setHasMore(fetchedProducts.length >= 6)
    } catch (error) {
      const title =
        error instanceof AppError ? error.message : 'Erro ao carregar produtos.'
      toast.show({ title, placement: 'top', bgColor: 'red.500' })
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }

  // 🔍 Busca produtos
  const searchProducts = useCallback(
    debounce(async (query: string) => {
      try {
        setIsSearching(true)
        setIsLoading(true)

        const response = await api.get('/products/search', {
          params: { query },
        })

        setProducts(response.data.products || [])
        setHasMore(false) // Busca não tem paginação
      } catch (error) {
        const title =
          error instanceof AppError ? error.message : 'Erro ao buscar produtos.'
        toast.show({ title, placement: 'top', bgColor: 'red.500' })
        setProducts([])
      } finally {
        setIsLoading(false)
        setIsLoadingMore(false)
      }
    }, 500),
    [],
  )

  // 🧠 Gerenciar mudança no input
  const handleSearchChange = (text: string) => {
    setSearchTerm(text)

    const formattedQuery = removeAccents(text.trim())

    if (formattedQuery === '') {
      // 🔄 Limpar busca → listar todos
      if (formattedQuery === '') {
        setIsSearching(false)
        setPage(1)
        fetchProducts(true)
      }
    } else {
      // 🔍 Fazer busca
      searchProducts(formattedQuery)
    }
  }

  // ⬇️ Scroll infinito → carrega mais
  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore || isSearching) return

    setIsLoadingMore(true)
    setPage((prev) => prev + 1)
  }

  // 🚀 Carrega produtos ao abrir
  useEffect(() => {
    fetchProducts(true)
  }, [])

  // 🔄 Carrega mais quando page muda (scroll infinito)
  useEffect(() => {
    if (page > 1 && !isSearching) {
      fetchProducts()
    }
  }, [page])

  return (
    <VStack flex={1} bg="white" safeArea>
      <HomeScreen title="Pesquisar" />

      <Box px={4} pt={4}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Buscar produtos..."
          placeholderTextColor="#777"
          value={searchTerm}
          onChangeText={handleSearchChange}
          returnKeyType="search"
          autoCorrect={false}
        />
      </Box>

      <Box px={4} py={2} bg="primary.100" mx={4} my={2} borderRadius="md">
        <HStack alignItems="center" space={1}>
          <MaterialIcons name="local-offer" size={18} color="#00875F" />
          <Text color="#00875F" fontWeight="bold">
            Todos os produtos oferecem cashback!
          </Text>
        </HStack>
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
              Digite o nome do produto que deseja encontrar!
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
