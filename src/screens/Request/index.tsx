import { useState } from 'react'

import { HomeScreen } from '@components/HomeScreen'
import { Status } from '@components/Status'
import { Heading, VStack, SectionList, Text, Center } from 'native-base'

export function Request() {
  const [request, setRequest] = useState([
    {
      title: '24.02.2023',
      data: ['Pedido Realizado', 'Pedido em Separação', 'Pedido em Entrega'],
    },
    {
      title: '25.02.2023',
      data: ['Pedido Realizado', 'Pedido em Separação', 'Pedido em Entrega'],
    },
  ])

  return (
    <VStack bg={'gray.200'} flex="1">
      <HomeScreen title="Histórico de Pedidos" />

      <SectionList
        sections={request}
        keyExtractor={(item) => item}
        renderItem={({ item }) => <Status />}
        renderSectionHeader={({ section }) => (
          <Heading mt={2} mb={2} ml="2" fontSize="lg" color="red.700">
            {section.title}
          </Heading>
        )}
        px={2}
        contentContainerStyle={
          request.length === 0 && { flex: 1, justifyContent: 'center' }
        }
        ListEmptyComponent={() => (
          <Center flex="1">
            <Text color="red.600" fontSize="lg">
              Nenhum pedido registrado!
            </Text>
          </Center>
        )}
        showsVerticalScrollIndicator={false}
      />
    </VStack>
  )
}
