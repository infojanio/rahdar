import { ReactNode, createContext, useEffect, useState } from 'react'
import { setSignOutCallback } from '@services/authHelpers'

import {
  storageAuthTokenSave,
  storageAuthTokenGet,
  storageAuthTokenRemove,
} from '@storage/storageAuthToken'
import {
  storageUserSave,
  storageUserGet,
  storageUserRemove,
} from '@storage/storageUser'

import { UserDTO } from '@dtos/UserDTO'
import { api } from '@services/api'
import { useAuth } from '@hooks/useAuth'

export type AuthContextDataProps = {
  user: UserDTO
  userId: string
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>

  isLoadingUserStorageData: boolean
}

type AuthContextProviderProps = {
  children: ReactNode
}

export const AuthContext = createContext<AuthContextDataProps>(
  {} as AuthContextDataProps,
)

export function AuthContextProvider({ children }: AuthContextProviderProps) {
  const [user, setUser] = useState<UserDTO>({} as UserDTO)
  const [isLoadingUserStorageData, setIsLoadingUserStorageData] = useState(true)

  const userId = user?.id ?? ''

  // Atualiza o token no cabeçalho e o estado do usuário
  async function userAndTokenUpdate(userData: UserDTO, token: string) {
    console.log('[AuthContext] Atualizando usuário e token...', {
      userData,
      token,
    })
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(userData)
  }

  // Salva as informações no armazenamento local
  async function storageUserAndTokenSave(
    userData: UserDTO,
    token: string,
    refreshToken: string,
  ) {
    try {
      console.log('[AuthContext] Salvando usuário e token...', {
        userData,
        token,
        refreshToken,
      })
      await storageUserSave(userData)
      await storageAuthTokenSave({ token, refreshToken })
    } catch (error) {
      console.error('[AuthContext] Erro ao salvar usuário e token:', error)
      throw error
    }
  }

  // Autenticação do usuário
  async function signIn(email: string, password: string) {
    try {
      console.log('[AuthContext] Fazendo login...')

      const { data } = await api.post('/sessions', { email, password })
      console.log('[AuthContext] Resposta da API:', data)

      if (data.user && data.accessToken && data.refreshToken) {
        await storageUserAndTokenSave(
          data.user,
          data.accessToken,
          data.refreshToken,
        )
        await userAndTokenUpdate(data.user, data.accessToken)
      } else {
        console.error('[AuthContext] Dados inválidos retornados da API!')
      }
    } catch (error) {
      console.error('[AuthContext] Erro ao fazer login:', error)
      throw error
    } finally {
      setIsLoadingUserStorageData(false)
    }
  }

  // Faz logout do usuário
  async function signOut() {
    try {
      console.log('[AuthContext] Fazendo logout...')
      setIsLoadingUserStorageData(true)

      setUser({} as UserDTO)
      await storageUserRemove()
      await storageAuthTokenRemove()
      delete api.defaults.headers.common['Authorization']

      console.log('[AuthContext] Logout realizado com sucesso!')
    } catch (error) {
      console.error('[AuthContext] Erro ao fazer logout:', error)
      throw error
    } finally {
      setIsLoadingUserStorageData(false)
    }
  }

  // Carrega os dados do usuário do armazenamento local
  async function loadUserData() {
    try {
      setIsLoadingUserStorageData(true)
      console.log('[AuthContext] Carregando dados do usuário...')

      const userLogged = await storageUserGet()
      const storedToken = await storageAuthTokenGet()

      console.log('[AuthContext] Dados do AsyncStorage:', {
        userLogged,
        storedToken,
      })

      if (storedToken?.token && userLogged?.id) {
        await userAndTokenUpdate(userLogged, storedToken.token)
      } else {
        console.warn('[AuthContext] Nenhum usuário logado encontrado!')
        setUser({} as UserDTO)
      }
    } catch (error) {
      console.error('[AuthContext] Erro ao carregar usuário:', error)
    } finally {
      setIsLoadingUserStorageData(false)
    }
  }

  useEffect(() => {
    setSignOutCallback(signOut)
    loadUserData()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        userId,
        signIn,
        signOut,
        isLoadingUserStorageData,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
