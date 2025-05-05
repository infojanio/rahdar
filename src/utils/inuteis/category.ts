export interface Category {
  id: string
  name: string
  image: string
}

const MeatImage = require('../assets/img/carne.png')
const IceImage = require('../assets/img/frios.png')
const HygieneImage = require('../assets/img/higiene.png')
const DrinkImage = require('../assets/img/bebida.png')

export const categoryList: Category[] = [
  {
    id: '1',
    name: 'Carnes & Peixes',
    image: MeatImage,
  },
  {
    id: '2',
    name: 'Frios & Laticínios',
    image: IceImage,
  },
  {
    id: '3',
    name: 'Bebidas',
    image: DrinkImage,
  },

  {
    id: '4',
    name: 'Higiene & Perfumaria',
    image: HygieneImage,
  },

  {
    id: '5',
    name: 'Higiene & Perfumaria',
    image: HygieneImage,
  },

  {
    id: '6',
    name: 'Higiene & Perfumaria',
    image: HygieneImage,
  },

  {
    id: '7',
    name: 'Higiene & Perfumaria',
    image: HygieneImage,
  },

  {
    id: '8',
    name: 'Higiene & Perfumaria',
    image: HygieneImage,
  },
]
