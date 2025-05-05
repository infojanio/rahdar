import { useEffect, useState } from 'react'
import { Text, Center, FlatList, HStack, VStack, useToast } from 'native-base'

import { api } from '@services/api'
import { AppError } from '@utils/AppError'

import { CityCard } from '@utils/CitySelect/CityCard'

import { useNavigation, useRoute } from '@react-navigation/native'
import { AuthNavigatorRoutesProps } from '@routes/auth.routes'
import { CityDTO } from '@dtos/CityDTO'
import { Loading } from '@components/Loading'
import { HomeHeader } from '@components/HomeHeader'
import { HomeScreen } from '@components/HomeScreen'
import { TenantDTO } from '@dtos/TenantDTO'
import { TenantCard } from '@utils/inuteis/Tenant/TenantCard'

type RouteParamsProps = {
  cityId: string
}

type Props = {
  city: string
  data: TenantDTO[]
}

export function TenantsByCity() {
  const [tenants, setTenants] = useState<TenantDTO[]>([])
  const [cities, setCities] = useState<CityDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const navigation = useNavigation<AuthNavigatorRoutesProps>()
  const toast = useToast()

  function handleOpenCompanies(tenantId: string) {
    navigation.navigate('companiesByDepartment', { tenantId })
  }

  const route = useRoute()
  const { cityId } = route.params as RouteParamsProps
  console.log('ID cidade=>', cityId)

  //listar as citias
  async function fetchCities() {
    try {
      setIsLoading(true)
      const response = await api.get(`/cities/${cityId}`)
      // const response = await api.get('/companies')
      setTenants(response.data)
      console.log(response.data)
    } catch (error) {
      const isAppError = error instanceof AppError
      const title = isAppError
        ? error.message
        : 'Não foi possível carregar as cidades cadastradas'

      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500',
      })
    } finally {
      setIsLoading(false)
    }
  }

  //listar ramos de atividades por cidade
  async function fetchTenants() {
    try {
      setIsLoading(true)
      //const response = await api.get('/tenants')
      const response = await api.get(`/tenants/city/?city_id=${cityId}`)

      console.log(response.data)
      setTenants(response.data)
    } catch (error) {
      const isAppError = error instanceof AppError
      const title = isAppError
        ? error.message
        : 'Não foi possível carregar as empresas por ramo de atividade'
      console.log('Não foi possível carregar as empresas por ramo de atividade')

      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // fetchCities()
    fetchTenants()
  }, [cityId])

  const firstTenant = tenants.length > 0 ? tenants[0] : null

  return (
    <VStack>
      <HomeScreen title="Tipo do estabelecimento" />
      <VStack>
        {isLoading ? (
          <Loading />
        ) : (
          <VStack>
            {firstTenant ? (
              <FlatList
                data={tenants}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TenantCard
                    data={item}
                    onPress={() => handleOpenCompanies(item.id)}
                  />
                )}
                showsHorizontalScrollIndicator={false}
                _contentContainerStyle={{ px: 2 }}
                mt={4}
                mb={24}
              />
            ) : (
              <Center mt={6} mb={2}>
                <Text color={'red.600'} fontSize={14}>
                  Tente novamente, estabelecimento encontrado!
                </Text>
              </Center>
            )}
          </VStack>
        )}
      </VStack>
    </VStack>
  )
}
