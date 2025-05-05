import React from 'react'
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { useCart } from '../contexts/CartContext'
import { theme } from '../theme'

interface CartItemProps {
  item: {
    product: {
      id: string
      name: string
      price: number
      image?: string
      cashbackPercentage: number
    }
    quantity: number
  }
}

export const CartItem = ({ item }: CartItemProps) => {
  const { updateQuantity, removeItem } = useCart()
  const fadeAnim = React.useRef(new Animated.Value(1)).current

  const handleIncrease = () => {
    updateQuantity(item.product.id, item.quantity + 1)
  }

  const handleDecrease = () => {
    if (item.quantity > 1) {
      updateQuantity(item.product.id, item.quantity - 1)
    } else {
      // Animação ao remover item
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        removeItem(item.product.id)
      })
    }
  }

  const handleRemove = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      removeItem(item.product.id)
    })
  }

  const subtotal = item.product.price * item.quantity
  const cashback = (subtotal * item.product.cashbackPercentage) / 100

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Imagem do produto */}
      <View style={styles.imageContainer}>
        {item.product.image ? (
          <Image
            source={{ uri: item.product.image }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.image, styles.placeholderImage]}>
            <MaterialIcons
              name="shopping-bag"
              size={24}
              color={theme.colors.secondary}
            />
          </View>
        )}
      </View>

      {/* Detalhes do produto */}
      <View style={styles.details}>
        <Text style={styles.name} numberOfLines={2}>
          {item.product.name}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>R$ {item.product.price.toFixed(2)}</Text>
          <View style={styles.cashbackBadge}>
            <Text style={styles.cashbackText}>
              {item.product.cashbackPercentage}% cashback
            </Text>
          </View>
        </View>

        {/* Controles de quantidade */}
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={handleDecrease}
          >
            <MaterialIcons
              name="remove"
              size={20}
              color={theme.colors.primary}
            />
          </TouchableOpacity>

          <Text style={styles.quantityText}>{item.quantity}</Text>

          <TouchableOpacity
            style={styles.quantityButton}
            onPress={handleIncrease}
          >
            <MaterialIcons name="add" size={20} color={theme.colors.primary} />
          </TouchableOpacity>

          <View style={styles.spacer} />

          <Text style={styles.subtotal}>R$ {subtotal.toFixed(2)}</Text>
        </View>

        {/* Cashback calculado */}
        <Text style={styles.cashbackValue}>
          + R$ {cashback.toFixed(2)} de cashback
        </Text>
      </View>

      {/* Botão de remover */}
      <TouchableOpacity style={styles.removeButton} onPress={handleRemove}>
        <MaterialIcons name="close" size={20} color={theme.colors.danger} />
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    shadowColor: theme.colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    marginRight: theme.spacing.md,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.sm,
  },
  placeholderImage: {
    backgroundColor: theme.colors.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  details: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.dark,
    marginBottom: theme.spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginRight: theme.spacing.sm,
  },
  cashbackBadge: {
    backgroundColor: theme.colors.success + '20',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  cashbackText: {
    fontSize: 12,
    color: theme.colors.success,
    fontWeight: 'bold',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: theme.spacing.sm,
    minWidth: 20,
    textAlign: 'center',
  },
  spacer: {
    flex: 1,
  },
  subtotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.dark,
  },
  cashbackValue: {
    fontSize: 14,
    color: theme.colors.success,
    fontWeight: '600',
  },
  removeButton: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    padding: theme.spacing.xs,
  },
})
