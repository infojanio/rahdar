// @dtos/ProductDTO.ts

export type ProductDTO = {
  id: string
  name: string
  description: string
  price: number
  quantity: number
  image: string
  cashbackPercentage: number
  store_id: string
  subcategory_id: string // Alterado para compatibilidade com seu backend
  status: boolean

  // Campos opcionais para frontend
  categoryId?: string // Adicionado para filtragem
  subcategoryName?: string
}

// Tipo para uso em telas onde subcategoryName é necessário (ex: Search)
export type ProductWithSubcategory = ProductDTO & {
  subcategoryName: string // <- obrigatório nesse contexto
}

// Tipo para resposta da API de produtos
export interface ProductsResponseDTO {
  data: ProductDTO[]
  // Adicione outros campos de paginação se necessário
}

// Tipo para filtros de produtos
export interface ProductFiltersDTO {
  categoryId?: string
  subcategoryId?: string
  searchTerm?: string
  sortBy?: 'highestCashback' | 'default'
}
