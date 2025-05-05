import React, { useState } from 'react'

import { Dimensions, Pressable, SafeAreaView, StyleSheet } from 'react-native'

import { FlatList, Box, View, Image } from 'native-base'

import MeatImage from '../../assets/banner01.png'
import IceImage from '../../assets/banner02.png'
import HygieneImage from '../../assets/banner03.png'
//import DrinkImage from '../../assets/acougue.png'

//import { api } from '@services/api' // Ajuste conforme seu serviço de API
type PromoBanner = {
  id: string
  imageUrl: string
  link?: () => void
}
const promoBanners: PromoBanner[] = [
  {
    id: '1',
    imageUrl:
      'https://img.freepik.com/psd-gratuitas/3d-label-close-month-promocao-de-supermercado-logotipo-de-varejo-fecha-mes-no-brasil_314999-2757.jpg?uid=R41311648&ga=GA1.1.2037725260.1745967001&semt=ais_hybrid&w=740',
    //    image: MeatImage,
  },

  {
    id: '2',
    imageUrl:
      'https://img.freepik.com/psd-gratuitas/uma-etiqueta-3d-para-devolucao-do-dinheiro-e-exibida-em-um-fundo-transparente_314999-1676.jpg?uid=R41311648&ga=GA1.1.2037725260.1745967001&semt=ais_hybrid&w=740',
    // image: IceImage,
  },

  {
    id: '3',
    imageUrl:
      'https://img.freepik.com/vetores-gratis/modelo-de-banner-da-web-para-cashback_23-2148764894.jpg?uid=R41311648&ga=GA1.1.2037725260.1745967001&semt=ais_hybrid&w=740',
    //    image: HygieneImage,
  },
]

const { width } = Dimensions.get('window')

/*
type PromotionProps = {
  id: string
  imageUrl: string
}
*/

export function Promotion() {
  // const [promotions, setPromotions] = useState<PromotionProps[]>([])

  //barra de itens
  const [activeIndex, setActiveIndex] = useState<number>(0)

  /*
async function fetchPromotions() {
    try {
      const response = await api.get('/promotions') // Ajuste a rota conforme o backend
      setPromotions(response.data)
    } catch (error) {
      console.error('Erro ao buscar promoções:', error)
    }
  }

  useEffect(() => {
    fetchPromotions()
  }, [])
*/

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={promoBanners} /* data={promotions} */
        style={{ maxHeight: width }}
        pagingEnabled
        scrollEnabled
        initialScrollIndex={0}
        horizontal
        onMomentumScrollEnd={(event) => {
          setActiveIndex(event.nativeEvent.contentOffset.x / width)
        }}
        scrollEventThrottle={36}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(images) => String(images.id)}
        renderItem={({ item }) => (
          <Pressable
            onPress={item.link}
            style={{ marginLeft: 12, marginRight: 2 }}
          >
            <Image
              source={{ uri: item.imageUrl }}
              alt="Banner promocional"
              w={280}
              h={120}
              borderRadius="xl"
              resizeMode="cover"
            />
          </Pressable>
        )}
      />

      {promoBanners.length > 1 /*  {promotions.length > 1 ? ( */ ? (
        <Box flexDirection="row" justifyContent="center" marginTop={2}>
          {promoBanners.map((_, i /* {promotions.map((_, i) => ( */) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: i === activeIndex ? 'blue' : 'gray' },
              ]}
            />
          ))}
        </Box>
      ) : null}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 2,
    marginBottom: 4,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 2,
  },
})
