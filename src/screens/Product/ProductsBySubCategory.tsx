import { useEffect, useState } from 'react'
import {
  Box,
  FlatList,
  HStack,
  ScrollView,
  Text,
  VStack,
  useToast,
} from 'native-base'
import { useNavigation, useRoute } from '@react-navigation/native'
import { api } from '@services/api'
import { AppError } from '@utils/AppError'

import { SubCategoryDTO } from '@dtos/SubCategoryDTO'
import { ProductDTO } from '@dtos/ProductDTO'

import { SubCategoryFilter } from '@components/Category/SubCategoryFilter'
import { ProductCard } from '@components/Product/ProductCard'
import { Loading } from '@components/Loading'
import { HomeScreen } from '@components/HomeScreen'
import { Category } from '@components/Category'
import { AppNavigatorRoutesProps } from '@routes/app.routes'

type RouteParams = {
  categoryId: string
}

export function ProductsBySubCategory() {
  const toast = useToast()
  const route = useRoute()
  const { categoryId } = route.params as RouteParams

  const [subCategories, setSubCategories] = useState<SubCategoryDTO[]>([])

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(
    null,
  )

  const [products, setProducts] = useState<ProductDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const navigation = useNavigation<AppNavigatorRoutesProps>()

  function handleOpenProductDetails(productId: string) {
    navigation.navigate('productDetails', { productId })
  }

  async function fetchSubCategories() {
    try {
      const response = await api.get(`/subcategories/category`, {
        params: { categoryId },
      })
      setSubCategories(response.data)
      if (response.data.length > 0) {
        setSelectedSubCategory(response.data[0].id)
      }
    } catch (error) {
      toast.show({
        title: 'Erro ao carregar subcategorias.',
        placement: 'top',
        bgColor: 'red.500',
      })
    }
  }

  async function fetchProductsBySubCategory(subcategoryId: string) {
    try {
      setIsLoading(true)
      const response = await api.get('/products/subcategory', {
        params: { subcategoryId },
      })
      setProducts(response.data)
    } catch (error) {
      const title =
        error instanceof AppError ? error.message : 'Erro ao buscar produtos.'
      toast.show({ title, placement: 'top', bgColor: 'red.500' })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSubCategories()
  }, [categoryId])

  useEffect(() => {
    if (selectedCategory) {
      fetchProductsBySubCategory(selectedCategory)
    }
  }, [selectedSubCategory])

  useEffect(() => {
    if (selectedSubCategory) {
      fetchProductsBySubCategory(selectedSubCategory)
    }
  }, [selectedSubCategory])

  return (
    <VStack flex={1} bg="white" safeArea>
      <HomeScreen
        title="Produtos"
        // onSearchChange={setSearch}
      />

      <Box px={4} pt={4}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <HStack space={3}>
            {subCategories.map((sub) => (
              <SubCategoryFilter
                key={sub.id}
                title={sub.name}
                isActive={sub.id === selectedSubCategory}
                onPress={() => setSelectedSubCategory(sub.id)}
              />
            ))}
          </HStack>
        </ScrollView>
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
            paddingHorizontal: 16,
          }}
          contentContainerStyle={{ paddingBottom: 16, paddingTop: 8 }}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() => handleOpenProductDetails(item.id)}
            />
          )}
          ListEmptyComponent={
            <Text textAlign="center" mt={10}>
              Nenhum produto encontrado para essa subcategoria.
            </Text>
          }
        />
      )}
    </VStack>
  )
}
