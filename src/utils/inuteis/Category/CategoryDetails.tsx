import { HomeScreen } from '@components/HomeScreen'

import { ProductCategory } from './ProductCategory'

import { Platform } from 'react-native'
import { useEffect, useState } from 'react'
import { useNavigation, useRoute } from '@react-navigation/native'
import {
  Heading,
  Image,
  ScrollView,
  Text,
  VStack,
  useToast,
  HStack,
} from 'native-base'

import { useCart } from '../../hooks/useCart'

import { PRODUCTS } from '../../data/products'
import { Sizes } from '../../components/Sizes'

import { Input } from '../../components/Input'
import { Button } from '../../components/Button'

import { ProductCardProps } from '../../components/Product/ProductCard'

type RouteParamsProps = {
  productId: string
}

export function CategoryDetails() {
  const [size, setSize] = useState('35')
  const [quantity, setQuantity] = useState('1')
  const [product, setProduct] = useState<ProductCardProps>(
    {} as ProductCardProps,
  )

  const toast = useToast()
  const route = useRoute()
  const { navigate } = useNavigation()
  const { addProductCart } = useCart()

  const { productId } = route.params as RouteParamsProps

  async function handleAddProductToCart() {
    try {
      await addProductCart({
        id: product.id,
        name: product.name,
        image: product.thumb,
        quantity: Number(quantity),
        size: product.size,
      })

      toast.show({
        title: 'Produto adicionado no carrinho',
        placement: 'top',
        bgColor: 'green.500',
      })

      navigate('cart')
    } catch (error) {
      toast.show({
        title: 'Não foi possível adicionar o produto no carrinho',
        placement: 'top',
        bgColor: 'reed.500',
      })
    }
  }

  useEffect(() => {
    const selected = PRODUCTS.filter(
      (item) => item.id === productId,
    )[0] as ProductCardProps
    setProduct(selected)
  }, [productId])

  return (
    <VStack flex={1}>
      <HomeScreen title="Detalhes do produto" />

      <ScrollView>
        <Image
          key={String(new Date().getTime())}
          source={product.image}
          w={56}
          h={56}
          resizeMode={Platform.OS === 'android' ? 'contain' : 'cover'}
          alt="Imagem do produto"
          alignSelf="center"
        />

        <VStack p={6}>
          <HStack w="full" justifyContent="space-between" alignItems="center">
            <VStack flex={1}>
              <Heading
                color="gray.700"
                fontFamily="heading"
                fontSize="14"
                mb={2}
              >
                {product.name}
              </Heading>

              <Text color="gray.700" fontSize="md" fontFamily="heading">
                R$ {product.price}
              </Text>
            </VStack>

            <VStack alignItems="flex-end">
              <Text color="gray.700" fontSize="sm" textAlign="justify" pt={4}>
                Quantidade
              </Text>

              <Input
                onChangeText={setQuantity}
                keyboardType="numeric"
                textAlign="center"
                value={quantity}
                w={16}
              />
            </VStack>
          </HStack>

          <Text
            color="gray.700"
            fontSize="md"
            textAlign="justify"
            pt={2}
            mb={2}
          >
            {product.description}
          </Text>

          {/*  colocar condição: se if(categoria === sapato)

          <Sizes onSelect={setSize} selected={size} />
          
          */}
          <Button
            title="Adicionar no carrinho"
            onPress={handleAddProductToCart}
          />
        </VStack>
      </ScrollView>
    </VStack>
  )
}
