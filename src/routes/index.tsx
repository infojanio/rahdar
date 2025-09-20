import React, { useEffect } from 'react'
import { Box, useTheme } from 'native-base'
import { NavigationContainer, DefaultTheme } from '@react-navigation/native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { useAuth } from '@hooks/useAuth'
import { AuthRoutes } from './auth.routes'
import { AppRoutes } from './app.routes'
import { Loading } from '@components/Loading'

export function Routes() {
  const { colors } = useTheme()
  const { user, isLoadingUserStorageData } = useAuth()

  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: colors.gray[100],
    },
  }

  useEffect(() => {
    console.log('Routes - user:', user)
    console.log('Routes - isLoadingUserStorageData:', isLoadingUserStorageData)
  }, [user, isLoadingUserStorageData])

  if (isLoadingUserStorageData) {
    return <Loading />
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer theme={theme}>
          {/* 
            pointerEvents="box-none" garante que esse Box não bloqueie toques para os filhos.
            Se quiser testar se algo está sendo interceptado, troque para 'auto' e adicione background color temporário.
          */}
          <Box flex={1} bg="green.50" pointerEvents="box-none">
            {user && user.id ? <AppRoutes /> : <AuthRoutes />}
          </Box>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
