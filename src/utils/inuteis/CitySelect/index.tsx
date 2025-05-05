import { useEffect, useState } from 'react'
import { FlatList, HStack, VStack, useToast } from 'native-base'

import { api } from '@services/api'
import { AppError } from '@utils/AppError'

import { CityCard } from '@utils/CitySelect/CityCard'

import { useNavigation } from '@react-navigation/native'
import { AppNavigatorRoutesProps } from '@routes/app.routes'
import { CityDTO } from '@dtos/CityDTO'
import { Loading } from '@components/Loading'
import { HomeHeader } from '@components/HomeHeader'
import { HomeScreen } from '@components/HomeScreen'
import { TenantDTO } from '@dtos/TenantDTO'
import { AuthNavigatorRoutesProps } from '@routes/auth.routes'

export function CitySelect() {
  const [cities, setCities] = useState<CityDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const navigation = useNavigation<AuthNavigatorRoutesProps>()
  const toast = useToast()

  function handleOpenHome(cityId: string) {
    navigation.navigate('home', { cityId })
  }

  //listar as cities
  async function fetchCities() {
    try {
      setIsLoading(true)

      const response = await api.get('/cities')
      setCities(response.data)
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

  useEffect(() => {
    fetchCities()
  }, [])

  return (
    <VStack>
      <HomeScreen title="Cidades" />
      <VStack>
        {isLoading ? (
          <Loading />
        ) : (
          <VStack>
            <FlatList
              data={cities}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <CityCard data={item} onPress={() => handleOpenHome(item.id)} />
              )}
              showsHorizontalScrollIndicator={false}
              _contentContainerStyle={{ px: 2 }}
              mt={4}
              mb={24}
            />
          </VStack>
        )}
      </VStack>
    </VStack>
  )
}
