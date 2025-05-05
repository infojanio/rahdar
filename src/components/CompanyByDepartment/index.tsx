import { useEffect, useState } from 'react'
import { FlatList, HStack, VStack, useToast } from 'native-base'

import { api } from '@services/api'
import { AppError } from '@utils/AppError'

import { CompanyCard } from './CompanyCard'

import { useNavigation, useRoute } from '@react-navigation/native'
import { AppNavigatorRoutesProps } from '@routes/app.routes'
import { TenantDTO } from '@dtos/TenantDTO'
import { Loading } from '@components/Loading'
import { CompanyDTO } from '@dtos/CompanyDTO'
import { HeaderList } from '@components/HeaderList'
import { HomeHeader } from '@components/HomeHeader'

type RouteParamsProps = {
  tenantId: string
  companyId: string
}

type Props = {
  tenant: string
  company: string
  data: CompanyDTO[]
}

export function CompanyByDepartment() {
  const [tenants, setTenants] = useState<TenantDTO[]>([])

  const [companies, setCompanies] = useState<CompanyDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const navigation = useNavigation<AppNavigatorRoutesProps>()
  const toast = useToast()

  const route = useRoute()
  const { tenantId } = route.params as RouteParamsProps
  console.log('department=>', tenantId)

  //listar os tipos de empresa
  async function fetchDepartments() {
    try {
      setIsLoading(true)
      const response = await api.get(`/tenants/${tenantId}`)
      // const response = await api.get('/companies')
      setCompanies(response.data)
    } catch (error) {
      const isAppError = error instanceof AppError
      const title = isAppError
        ? error.message
        : 'Não foi possível carregar as lojas cadastradas'

      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500',
      })
    } finally {
      setIsLoading(false)
    }
  }

  //listar as empresas por tipo(tenant)
  async function fetchCompanies() {
    try {
      setIsLoading(true)
      //const response = await api.get(`/categories/${categoryId}`)
      //const response = await api.get(`/companies`)
      const response = await api.get(`/companies/tenant/?tenant_id=${tenantId}`)

      setCompanies(response.data)
    } catch (error) {
      const isAppError = error instanceof AppError
      const title = isAppError
        ? error.message
        : 'Não foi possível carregar as lojas cadastradas'

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
    //  fetchDepartments()
    fetchCompanies()
  }, [tenantId])

  return (
    <HStack>
      {isLoading ? (
        <Loading />
      ) : (
        <VStack flex={1}>
          <HomeHeader />
          <FlatList
            data={companies}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <CompanyCard
                data={item}
                onPress={() => {
                  console.log('abriu')
                }}
              />
            )}
            //horizontal
            showsHorizontalScrollIndicator={false}
            _contentContainerStyle={{ px: 2 }}
            mt={4}
            mb={4}
          />
        </VStack>
      )}
    </HStack>
  )
}
