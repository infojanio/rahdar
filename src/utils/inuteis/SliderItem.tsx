import React, { useState } from 'react'

import {
  FlatList,
  View,
  SafeAreaView,
  Dimensions,
  Image,
  StyleSheet,
} from 'react-native'

import { Box } from 'native-base'

const { width } = Dimensions.get('window')

const images = [
  {
    id: '1',
    url:
      'https://scontent.fbsb13-1.fna.fbcdn.net/v/t1.6435-9/120413733_111035747429199_8530458020619233612_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=e3f864&_nc_ohc=Hh4ol1KUYGEAX_tcrKn&_nc_ht=scontent.fbsb13-1.fna&oh=00_AfCBH5Gtcjw1_PDpl6Um1DSwS4IVqjsK162wrE8pnbclHg&oe=63C01CD3',
  },

  {
    id: '2',
    url:
      'https://promocaocupomdesconto.com/wp-content/uploads/2021/03/mercado.jpg',
  },

  {
    id: '3',
    url:
      'https://promocaocupomdesconto.com/wp-content/uploads/2021/03/mercado.jpg',
  },

  {
    id: '4',
    url:
      'https://promocaocupomdesconto.com/wp-content/uploads/2021/03/mercado.jpg',
  },
]

export function SliderItem() {
  //barra de itens
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={images}
        style={{ maxHeight: width }}
        pagingEnabled
        initialScrollIndex={1}
        horizontal
        onMomentumScrollEnd={(event) => {
          setActiveIndex(parseInt(event.nativeEvent.contentOffset.x / width))
        }}
        scrollEventThrottle={36}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(images) => String(images.id)}
        renderItem={({ item }) => (
          <Image source={{ uri: item.url }} style={styles.image} />
        )}
      />

      {images.length > 1 ? (
        <Box style={styles.dotsContainer}>
          {images.map((_, i) => (
            <View
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
  },

  image: {
    width,
    height: 140,
    marginLeft: 2,
    marginRight: 2,
    borderRadius: 12,
  },

  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 1,
  },
})
