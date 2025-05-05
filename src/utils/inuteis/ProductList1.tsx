import { ImageProps } from 'react-native'

export interface Product {
  id: string
  type: number
  subcategory: string
  name: string
  price: number
  image: ImageProps['source']
}

const MeatImage = require('../assets/img/carne.png')
//const IceImage = require('../assets/img/frios.png')
//const HygieneImage = require('../assets/img/higiene.png')
//const DrinkImage = require('../assets/img/bebida.png')

export const productList: Product[] = [
  {
    id: '1',
    type: 1,
    subcategory: 'Carnes Bovinas',
    name: 'Picanha',
    price: 59.9,
    image: MeatImage,
  },

  {
    id: '2',
    type: 1,
    subcategory: 'Carnes Bovinas',
    name: 'Maminha',
    price: 39.9,
    image: MeatImage,
  },

  {
    id: '3',
    type: 1,
    subcategory: 'Carnes Bovinas',
    name: 'Contra Filé',
    price: 49.9,
    image: MeatImage,
  },

  {
    id: '4',
    type: 1,
    subcategory: 'Carnes Bovinas',
    name: 'Fraldinha',
    price: 49.9,
    image: MeatImage,
  },
  {
    id: '5',
    type: 1,
    subcategory: 'Carnes Bovinas',
    name: 'Paleta',
    price: 39.9,
    image: MeatImage,
  },
]
