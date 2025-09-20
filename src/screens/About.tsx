import React from 'react'
import { ScrollView, Linking } from 'react-native'
import { VStack, Text, IconButton, Icon, Center, Button } from 'native-base'
import { Feather } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { AuthNavigatorRoutesProps } from '@routes/auth.routes'

export function About() {
  const navigation = useNavigation<AuthNavigatorRoutesProps>()

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#fff' }}
      contentContainerStyle={{ padding: 16 }}
    >
      <VStack space={4}>
        {/* Botão voltar */}
        <IconButton
          borderRadius="full"
          variant="ghost"
          size="sm"
          alignSelf="flex-start"
          icon={<Icon as={Feather} name="chevron-left" size="8" />}
          onPress={() => navigation.goBack()}
        />

        <Center>
          <Text fontSize="2xl" fontWeight="bold" mb={2}>
            Sobre o App
          </Text>
          <Text fontSize="sm" color="gray.600">
            Versão 1.0.0
          </Text>
        </Center>

        <Text fontSize="md" color="gray.800" mt={4}>
          O aplicativo <Text bold>iaki</Text> foi desenvolvido para oferecer
          cashback em compras, promoções exclusivas e praticidade no dia a dia.
        </Text>

        <VStack space={3} mt={6}>
          <Button
            variant="outline"
            colorScheme="blue"
            onPress={() => navigation.navigate('privacy')}
          >
            📜 Política de Privacidade
          </Button>

          <Button
            variant="outline"
            colorScheme="blue"
            onPress={() => navigation.navigate('terms')}
          >
            📄 Termos de Uso
          </Button>

          <Button
            variant="outline"
            colorScheme="blue"
            onPress={() => Linking.openURL('mailto:contato@iaki.com.br')}
          >
            📧 Contatar Suporte
          </Button>
        </VStack>
      </VStack>
    </ScrollView>
  )
}
