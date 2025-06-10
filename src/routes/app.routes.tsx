import { Platform } from 'react-native'
import { useTheme } from 'native-base'

import {
  createBottomTabNavigator,
  BottomTabNavigationProp,
} from '@react-navigation/bottom-tabs'

import HomeSvg from '@assets/home.svg'
import SearchSvg from '@assets/search.svg'
import CartSvg from '@assets/cart.svg'
import FavoriteSvg from '@assets/favorite.svg'
import RequestSvg from '@assets/request.svg'
import ProfileSvg from '@assets/profile.svg'

import { Home } from '@screens/Home'

import { Cart } from '@screens/Cart'
import { Checkout } from '@screens/Checkout'

import { Profile } from '@screens/Profile'
import { ProductList } from '@screens/Product/ProductList'
import { ProductDetails } from '@screens/ProductDetails'

import { ProductBySubCategory } from '@screens/Product/ProductBySubCategory'

import { Category } from '@components/Category'
import { ProductsBySubCategory } from '@screens/Product/ProductsBySubCategory'
import { OrderConfirmation } from '@screens/OrderConfirmation'
import { StorageCartProps } from '@storage/storageCart'
import { OrderHistory } from '@screens/OrderHistory'
import { SearchProducts } from '@screens/SearchProducts'
import { AllProductsQuantity } from '@screens/AllProductsQuantity'
import { AllProductsCashback } from '@screens/AllProductsCashback'
import { useAuth } from '@hooks/useAuth'
import { OrderValidation } from '@screens/OrderValidation'

type AppRoutes = {
  home: { userId: string }
  //homeScreen: { UserId: string } // undefined
  search: undefined
  cart: undefined
  request: undefined
  profile: undefined
  productList: undefined
  signUp: undefined

  searchProducts: { productId: string }
  checkout: { cart: StorageCartProps[] }
  orderConfirmation: {
    orderId: string
    cashbackEarned?: number
    cashbackUsed?: number
  } // Modificado para receber apenas o ID
  orderHistory: undefined //
  productDetails: { productId: string }
  productBySubCategory: { categoryId: string }
  productsBySubCategory: { categoryId: string }
  category: undefined
  allProductsQuantity: undefined
  allProductsCashback: undefined
  orderValidation: { orderId: string }
}

export type AppNavigatorRoutesProps = BottomTabNavigationProp<AppRoutes>

const { Navigator, Screen } = createBottomTabNavigator<AppRoutes>()

//rotas da aplicação
export function AppRoutes() {
  //definição do tamanho dos ícones
  const { sizes, colors } = useTheme()
  const iconSize = sizes[6]

  const { isAdmin } = useAuth()

  return (
    <Navigator
      initialRouteName="home"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.green[500],
        tabBarInactiveTintColor: colors.blueGray[800],
        tabBarStyle: {
          backgroundColor: colors.gray[100],
          borderTopWidth: 1,
          height: Platform.OS === 'android' ? 'auto' : 48,
          paddingBottom: sizes[6],
          paddingTop: sizes[4],
        },
      }}
    >
      <Screen
        name="home"
        component={Home}
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <HomeSvg fill={color} width={iconSize} height={iconSize} />
          ),
        }}
      />
      <Screen
        name="searchProducts"
        component={SearchProducts}
        options={{
          title: 'Pesquisar',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <SearchSvg fill={color} width={iconSize} height={iconSize} />
          ),
        }}
      />

      <Screen
        name="cart"
        component={Cart}
        options={{
          title: 'Carrinho',
          headerStyle: {
            backgroundColor: '#c6c9c1',
          },
          headerTintColor: '#272525',
          headerTitleStyle: {
            fontSize: 18,
          },

          tabBarIcon: ({ color }) => (
            <CartSvg fill={color} width={iconSize} height={iconSize} />
          ),
        }}
      />
      <Screen
        name="orderHistory"
        component={OrderHistory}
        options={{
          title: 'Pedidos',
          headerStyle: {
            backgroundColor: '#c6c9c1',
          },
          headerTintColor: '#272525',
          headerTitleStyle: {
            justifyContent: 'center',
            textAlign: 'center',
            fontSize: 18,
          },
          tabBarIcon: ({ color }) => (
            <RequestSvg fill={color} width={iconSize} height={iconSize} />
          ),
        }}
      />

      {/* 🔐 Rota protegida para Admin */}
      {isAdmin && (
        <Screen
          name="orderValidation"
          component={OrderValidation}
          options={{
            title: 'Carrinho',
            headerStyle: {
              backgroundColor: '#c6c9c1',
            },
            headerTintColor: '#272525',
            headerTitleStyle: {
              fontSize: 18,
            },

            tabBarIcon: ({ color }) => (
              <FavoriteSvg fill={color} width={iconSize} height={iconSize} />
            ),
          }}
        />
      )}

      <Screen
        name="profile"
        component={Profile}
        options={{
          title: 'Perfil',

          headerStyle: {
            backgroundColor: '#688633',
          },

          headerTintColor: '#272525',
          headerTitleStyle: {
            justifyContent: 'center',
            textAlign: 'center',
            fontSize: 18,
          },

          tabBarIcon: ({ color }) => (
            <ProfileSvg fill={color} width={iconSize} height={iconSize} />
          ),
        }}
      />

      <Screen
        name="orderConfirmation"
        component={OrderConfirmation}
        //initialParams={{ orderId: '' }} // Definindo um valor inicial para evitar erro
        options={{
          tabBarButton: () => null, // oculta da tab bar
        }}
      />

      <Screen
        name="checkout"
        component={Checkout}
        options={{
          tabBarButton: () => null, // oculta da tab bar
        }}
      />

      <Screen
        name="productList"
        component={ProductList}
        options={{
          tabBarButton: () => null,
        }} //não mostra ícone
      />

      <Screen
        name="productDetails"
        component={ProductDetails}
        options={{
          tabBarButton: () => null,
        }} //não mostra ícone
      />

      <Screen
        name="allProductsCashback"
        component={AllProductsCashback}
        options={{
          tabBarButton: () => null,
        }} //não mostra ícone
      />

      <Screen
        name="allProductsQuantity"
        component={AllProductsQuantity}
        options={{
          tabBarButton: () => null,
        }} //não mostra ícone
      />

      <Screen
        name="category"
        component={Category}
        options={{
          tabBarButton: () => null,
        }} //não mostra ícone
      />

      <Screen
        name="productsBySubCategory"
        component={ProductsBySubCategory}
        options={{
          tabBarButton: () => null,
        }} //não mostra ícone
      />

      <Screen
        name="productBySubCategory"
        component={ProductBySubCategory}
        options={{
          tabBarButton: () => null,
        }} //não mostra ícone
      />
    </Navigator>
  )
}
