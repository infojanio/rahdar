import { ImageProps } from 'react-native'

export interface Promotion {
  id: string
  title: string
  image: ImageProps['source']
  description: string
}

const MeatImage = require('../assets/img/carne.png')
const IceImage = require('../assets/img/frios.png')
const HygieneImage = require('../assets/img/higiene.png')
const DrinkImage = require('../assets/img/bebida.png')

export const promotionList: Promotion[] = [
  {
    id: '1',
    title: 'Carnes e Peixes',
    image: MeatImage,
    description:
      'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
  },
  {
    id: '2',
    title: 'Frios e Laticínios',
    image: MeatImage,
    description:
      'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
  },
]
