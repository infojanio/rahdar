import { ImageProps } from 'react-native'

export interface Category {
  id: string
  title: string
  image: ImageProps['source']
}

const MeatImage = require('../assets/img/carne.png')
const IceImage = require('../assets/img/frios.png')
const HygieneImage = require('../assets/img/higiene.png')
const DrinkImage = require('../assets/img/bebida.png')

export const categoryList: Category[] = [
  {
    id: '1',
    title: 'Carnes & Peixes',
    image: MeatImage,
  },
  {
    id: '2',
    title: 'Frios & Laticínios',
    image: IceImage,
  },
  {
    id: '3',
    title: 'Higiene & Perfumaria',
    image: HygieneImage,
  },

  {
    id: '4',
    title: 'Bebidas',
    image: DrinkImage,
  },
]
