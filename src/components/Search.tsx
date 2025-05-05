import { useState, useEffect } from 'react'
import {
  VStack,
  FlatList,
  Heading,
  useToast,
  Text,
  Spinner,
  HStack,
} from 'native-base'
import { api } from '@services/api'
import { ProductWithSubcategory } from '@dtos/ProductDTO'
import { AppError } from '@utils/AppError'
import { ProductCard } from '@components/ProductCard'
import { Input } from '@components/Input'
import { TouchableOpacity } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { HomeScreen } from '@components/HomeScreen'

export function Search() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [products, setProducts] = useState<ProductWithSubcategory[]>([])
  const toast = useToast()

  async function fetchProducts() {
    try {
      setIsLoading(true)
      const response = await api.get('/products', {
        params: { name: searchTerm },
      })

      setProducts(response.data)
    } catch (error) {
      const isAppError = error instanceof AppError
      toast.show({
        title: isAppError ? error.message : 'Erro ao buscar produtos.',
        placement: 'top',
        bgColor: 'red.500',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [searchTerm])

  const groupedBySubcategory = products.reduce((acc, product) => {
    const key = product.subcategoryName
    if (!acc[key]) acc[key] = []
    acc[key].push(product)
    return acc
  }, {} as Record<string, ProductWithSubcategory[]>)

  return (
    <VStack flex={1} bg="white" px={4} pt={4}>
      <HStack mb={4} alignItems="center">
        <Input
          flex={1}
          placeholder="Buscar por nome"
          onChangeText={setSearchTerm}
          value={searchTerm}
          InputRightElement={
            <TouchableOpacity onPress={fetchProducts}>
              <MaterialIcons
                name="search"
                size={24}
                color="#9E9E9E"
                style={{ marginRight: 10 }}
              />
            </TouchableOpacity>
          }
        />
      </HStack>

      {isLoading ? (
        <Spinner size="lg" mt={8} />
      ) : (
        <FlatList
          data={Object.entries(groupedBySubcategory)}
          keyExtractor={([subcategory]) => subcategory}
          renderItem={({ item: [subcategory, items] }) => (
            <VStack mt={4}>
              <Heading fontSize="md" mb={2} color="gray.700">
                {subcategory}
              </Heading>
              <FlatList
                data={products}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <ProductCard data={item} onPress={() => ''} />
                )}
                horizontal
                showsHorizontalScrollIndicator={false}
              />
            </VStack>
          )}
          ListEmptyComponent={
            <Text textAlign="center" color="gray.500" mt={8}>
              Nenhum produto encontrado.
            </Text>
          }
        />
      )}
    </VStack>
  )
}
