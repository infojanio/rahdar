import React from 'react'
import {
  Avatar,
  Center,
  FlatList,
  Heading,
  HStack,
  Text,
  Spacer,
  VStack,
  ScrollView,
  Box,
  Stack,
  View,
  Image,
} from 'native-base'

const MeatImage = require('../assets/banner01.png')
const IceImage = require('../assets/banner02.png')
const HygieneImage = require('../assets/banner03.png')
const DrinkImage = require('../assets/acougue.png')

const images = [
  {
    id: 1,
    title: 'Carnes e peixes',
    image: MeatImage,
  },

  {
    id: 2,
    title: 'Carnes e peixes',
    image: IceImage,
  },

  {
    id: 3,
    title: 'Carnes e peixes',
    image: HygieneImage,
  },

  {
    id: 4,
    title: 'Carnes e peixes',
    image: DrinkImage,
  },
]

export function Catalog() {
  return (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={images}
      renderItem={({ item }) => (
        <Image
          alt="produtos"
          source={item.image}
          style={{
            width: 320,
            height: 180,
            borderWidth: 2,
            borderColor: '#f9d7d4',
            resizeMode: 'contain',
            margin: 8,
          }}
        />
      )}
    />
  )
}
