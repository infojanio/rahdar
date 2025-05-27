import React, { useState } from 'react'
import { View, Text, TextInput, Button, Alert, Image, ScrollView } from 'react-native'
import { launchCamera } from 'react-native-image-picker'
import TextRecognition from 'react-native-text-recognition'
import { fetchOrderById, validateOrderWithReceipt } from '../services/orderService'
import OrderDetails from '../components/OrderDetails'

export default function OrderValidation() {
  const [orderCode, setOrderCode] = useState('')
  const [order, setOrder] = useState<any>(null)
  const [receiptImage, setReceiptImage] = useState<string | null>(null)
  const [manualReason, setManualReason] = useState('')

  const handleSearchOrder = async () => {
    try {
      const data = await fetchOrderById(orderCode)
      setOrder(data)
    } catch {
      Alert.alert('Erro', 'Pedido não encontrado')
    }
  }

  const handleScanReceipt = async () => {
    const result = await launchCamera({ mediaType: 'photo', quality: 0.8 })

    if (result.assets && result.assets.length > 0) {
      const image = result.assets[0]
      setReceiptImage(image.uri)

      const ocrResult = await TextRecognition.recognize(image.uri)
      const text = ocrResult.join(' ')

      const regex = /Pedido\s*#?\s*([a-zA-Z0-9]+)/i
      const match = text.match(regex)

      if (match) {
        const receiptOrder = match[1]
        if (receiptOrder === orderCode) {
          await validateOrderWithReceipt(orderCode, image.uri)
          Alert.alert('Sucesso', 'Pedido validado e cashback liberado.')
        } else {
          Alert.alert('Erro', 'Número do pedido no cupom não confere.')
        }
      } else {
        Alert.alert('Erro', 'Não foi possível identificar o número do pedido no cupom.')
      }
    }
  }

  const handleManualValidation = async () => {
    if (!manualReason.trim()) {
      Alert.alert('Erro', 'Informe o motivo da validação manual.')
      return
    }
    await validateOrderWithReceipt(orderCode, receiptImage, manualReason)
    Alert.alert('Validação Manual', 'Cashback validado manualmente.')
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Validação de Pedido</Text>

      <TextInput
        placeholder="Digite o número do pedido"
        value={orderCode}
        onChangeText={setOrderCode}
        style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
      />
      <Button title="Buscar Pedido" onPress={handleSearchOrder} />

      {order && (
        <>
          <OrderDetails order={order} />

          <Button title="Escanear Cupom Fiscal" onPress={handleScanReceipt} />

          {receiptImage && (
            <Image
              source={{ uri: receiptImage }}
              style={{ width: '100%', height: 200, marginVertical: 10 }}
              resizeMode="contain"
            />
          )}

          <Text style={{ marginTop: 20, fontWeight: 'bold' }}>Validação Manual</Text>
          <TextInput
            placeholder="Motivo (ex: cupom ilegível)"
            value={manualReason}
            onChangeText={setManualReason}
            style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
          />
          <Button title="Validar Manualmente" onPress={handleManualValidation} />
        </>
      )}
    </ScrollView>
  )
}
