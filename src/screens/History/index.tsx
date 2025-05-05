import { HistoryRequest } from '@components/HistoryRequest'
import { HomeScreen } from '@components/HomeScreen'
import { VStack } from 'native-base'

export function History() {
  return (
    <VStack flex="1">
      <HomeScreen title="Histórico de Pedidos" />
      <HistoryRequest />
    </VStack>
  )
}
