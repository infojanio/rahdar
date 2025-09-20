import { Platform, StatusBar } from 'react-native'
import { NativeBaseProvider } from 'native-base'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import {
  useFonts,
  Roboto_400Regular,
  Roboto_700Bold,
} from '@expo-google-fonts/roboto'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import { Loading } from '@components/Loading'
import { Routes } from './src/routes'
import { AuthContextProvider } from '@contexts/AuthContext'
import { CartProvider } from '@contexts/CartContext'
import { useEffect } from 'react'
import * as NavigationBar from 'expo-navigation-bar'
import { checkAndApplyOtaNow, wireOtaOnAppState } from 'src/lib/updates'

export default function App() {
  const [fontsLoaded] = useFonts({ Roboto_400Regular, Roboto_700Bold })

  useEffect(() => {
    checkAndApplyOtaNow()
    const unwire = wireOtaOnAppState()
    return () => unwire()
  }, [])

  useEffect(() => {
    const hideNavBar = async () => {
      if (Platform.OS === 'android') {
        try {
          await NavigationBar.setVisibilityAsync('hidden')
          await NavigationBar.setBehaviorAsync('overlay-swipe')
          await NavigationBar.setBackgroundColorAsync('transparent')
        } catch (e) {
          console.log('NavigationBar error:', e)
        }
      }
    }
    hideNavBar()
  }, [])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NativeBaseProvider>
          <CartProvider>
            <StatusBar
              barStyle="dark-content"
              translucent
              backgroundColor="transparent"
            />
            <AuthContextProvider>
              {fontsLoaded ? <Routes /> : <Loading />}
            </AuthContextProvider>
          </CartProvider>
        </NativeBaseProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
