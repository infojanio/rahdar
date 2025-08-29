import { Platform, StatusBar } from 'react-native'
import { NativeBaseProvider } from 'native-base'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import {
  useFonts,
  Roboto_400Regular,
  Roboto_700Bold,
} from '@expo-google-fonts/roboto'

import { Loading } from '@components/Loading'
import { Routes } from './src/routes'
import { AuthContextProvider } from '@contexts/AuthContext'
import { CartProvider } from '@contexts/CartContext'
import { useEffect } from 'react'
import * as NavigationBar from 'expo-navigation-bar'

export default function App() {
  const [fontsLoaded] = useFonts({ Roboto_400Regular, Roboto_700Bold })

  useEffect(() => {
    const hideNavBar = async () => {
      if (Platform.OS === 'android') {
        // Deixa a barra oculta e só aparece ao deslizar a borda
        await NavigationBar.setVisibilityAsync('hidden')
        await NavigationBar.setBehaviorAsync('overlay-swipe')
        // opcional: cor transparente (quando surgir)
        await NavigationBar.setBackgroundColorAsync('transparent')
      }
    }
    hideNavBar()
  }, [])

  return (
    <SafeAreaProvider>
      <NativeBaseProvider>
        <CartProvider>
          {/* Se quiser resolver sem mexer nas telas, deixe translucente = false */}
          <StatusBar
            barStyle="dark-content"
            translucent={false}
            backgroundColor="#ffffff"
          />
          <AuthContextProvider>
            {fontsLoaded ? <Routes /> : <Loading />}
          </AuthContextProvider>
        </CartProvider>
      </NativeBaseProvider>
    </SafeAreaProvider>
  )
}
