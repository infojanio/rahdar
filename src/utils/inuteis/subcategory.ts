export interface SubCategory {
  id: string
  title: string
  CategoryId: string
}

export const SubcategoryList: SubCategory[] = [
  {
    id: '1',
    title: 'Carnes Bovinas',
    CategoryId: '1',
  },
  {
    id: '2',
    title: 'Aves',
    CategoryId: '1',
  },
  {
    id: '3',
    title: 'Peixes',
    CategoryId: '1',
  },

  {
    id: '4',
    title: 'Linguiças',
    CategoryId: '1',
  },

  {
    id: '5',
    title: 'Água Mineral',
    CategoryId: '2',
  },
  {
    id: '6',
    title: 'Refrigerante',
    CategoryId: '2',
  },
  {
    id: '7',
    title: 'Cerveja',
    CategoryId: '2',
  },

  {
    id: '8',
    title: 'Bebidas quentes',
    CategoryId: '2',
  },
]
