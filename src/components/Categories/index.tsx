import { useEffect, useState } from 'react'
import {
  Box,
  FlatList,
  HStack,
  VStack,
  useToast,
  Text,
  Pressable,
  ScrollView,
  Spinner,
} from 'native-base'

import { useNavigation } from '@react-navigation/native'

import { AppError } from '@utils/AppError'
import { api } from '@services/api'
import { AppNavigatorRoutesProps } from '@routes/app.routes'

import { CategoryDTO } from '@dtos/CategoryDTO'
import { SubCategoryDTO } from '@dtos/SubCategoryDTO'
import { ProductDTO } from '@dtos/ProductDTO'

import { CategoryCard } from '@components/Category/CategoryCard'
import { ProductCard } from '@components/Product/ProductCard'

export function Categories() {
  const [categories, setCategories] = useState<CategoryDTO[]>([])
  const [subcategories, setSubcategories] = useState<SubCategoryDTO[]>([])
  const [products, setProducts] = useState<ProductDTO[]>([])

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  )
  const [isLoading, setIsLoading] = useState(true)

  const toast = useToast()
  const navigation = useNavigation<AppNavigatorRoutesProps>()

  async function fetchCategories() {
    try {
      const response = await api.get('/categories')
      setCategories(response.data)
    } catch (error) {
      toast.show({
        title: 'Erro ao carregar categorias',
        bgColor: 'red.500',
        placement: 'top',
      })
    }
  }

  async function fetchSubcategories(categoryId: string) {
    try {
      const response = await api.get(`/subcategories?category_id=${categoryId}`)
      setSubcategories(response.data)
    } catch (error) {
      toast.show({
        title: 'Erro ao carregar subcategorias',
        bgColor: 'red.500',
        placement: 'top',
      })
    }
  }

  async function fetchProductsBySubCategory(subcategoryId: string) {
    try {
      const response = await api.get(
        `/products?subcategory_id=${subcategoryId}`,
      )
      setProducts(response.data)
    } catch (error) {
      toast.show({
        title: 'Erro ao carregar produtos',
        bgColor: 'red.500',
        placement: 'top',
      })
    }
  }

  function handleSelectCategory(categoryId: string) {
    setSelectedCategoryId(categoryId)
    fetchSubcategories(categoryId)
    setProducts([]) // limpa produtos ao trocar categoria
  }

  useEffect(() => {
    setIsLoading(true)
    fetchCategories().finally(() => setIsLoading(false))
  }, [])

  return (
    <VStack flex={1} bg="gray.100" px={3} pt={3}>
      <Text fontSize="lg" fontWeight="bold" mb={2}>
        Categorias
      </Text>

      {isLoading ? (
        <Spinner mt={4} />
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable onPress={() => handleSelectCategory(item.id)}>
              <Box
                bg={selectedCategoryId === item.id ? 'blue.500' : 'white'}
                px={4}
                py={2}
                mr={2}
                rounded="xl"
                borderWidth={1}
                borderColor="gray.300"
              >
                <Text
                  color={selectedCategoryId === item.id ? 'white' : 'black'}
                >
                  {item.name}
                </Text>
              </Box>
            </Pressable>
          )}
        />
      )}

      {selectedCategoryId && (
        <>
          <Text fontSize="md" fontWeight="medium" mt={4}>
            Subcategorias
          </Text>
          <FlatList
            data={subcategories}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            mt={2}
            renderItem={({ item }) => (
              <Pressable onPress={() => fetchProductsBySubCategory(item.id)}>
                <Box
                  bg="gray.200"
                  px={4}
                  py={1.5}
                  mr={2}
                  rounded="full"
                  borderWidth={1}
                  borderColor="gray.300"
                >
                  <Text>{item.name}</Text>
                </Box>
              </Pressable>
            )}
          />
        </>
      )}

      {products.length > 0 && (
        <>
          <Text fontSize="md" fontWeight="medium" mt={5} mb={2}>
            Produtos com cashback
          </Text>
          <FlatList
            data={products}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                onPress={() =>
                  navigation.navigate('productDetails', { productId: item.id })
                }
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 50 }}
          />
        </>
      )}
    </VStack>
  )
}
