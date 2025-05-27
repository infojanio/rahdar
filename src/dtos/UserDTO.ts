export type UserDTO = {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  role: 'ADMIN' | 'USER' // <- Adiciona isso
}