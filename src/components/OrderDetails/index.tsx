import React from 'react'
import { View, Text } from 'react-native'

export default function OrderDetails({ order }: { order: any }) {
  return (
    <View style={{ marginVertical: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Pedido #{order.id}</Text>
      {order.items.map((item: any) => (
        <Text key={item.id}>
          {item.name} - {item.quantity}x - R$ {item.subtotal}
        </Text>
      ))}
      <Text>Subtotal: R$ {order.subtotal}</Text>
      <Text>Cashback gerado: R$ {order.cashback}</Text>
    </View>
  )
}
