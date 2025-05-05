import { Text, View, StatusBar } from 'react-native'
import { NativeBaseProvider } from 'native-base'

import {
  useFonts,
  Roboto_400Regular,
  Roboto_700Bold,
} from '@expo-google-fonts/roboto'

import { Loading } from '@components/Loading'
import { Routes } from './src/routes'
import { AuthContextProvider } from '@contexts/AuthContext'
import { CartProvider } from '@contexts/CartContext'

export default function App() {
  const [fontsLoaded] = useFonts({ Roboto_400Regular, Roboto_700Bold })

  return (
    <NativeBaseProvider>
      <CartProvider>
        <StatusBar barStyle="dark-content" translucent />

        <AuthContextProvider>
          {fontsLoaded ? <Routes /> : <Loading />}
        </AuthContextProvider>
      </CartProvider>
    </NativeBaseProvider>
  )
}
