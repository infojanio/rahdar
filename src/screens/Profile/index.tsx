import { useEffect, useState, useCallback } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { userService } from '@services/userService'
import { orderService } from '@services/orderService'
import { useNavigation } from '@react-navigation/native'
import { HomeScreen } from '@components/HomeScreen'
import { SearchProducts } from '@screens/SearchProducts'
import { AppNavigatorRoutesProps } from '@routes/app.routes'

export function Profile() {
  const [balance, setBalance] = useState(0)
  const [pendingCashback, setPendingCashback] = useState(0)
  const [totalReceived, setTotalReceived] = useState(0)
  const [totalUsed, setTotalUsed] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const [statement, setStatement] = useState<
    Array<{
      id: string
      type: 'RECEIVE' | 'USE'
      amount: number
      created_at: string
    }>
  >([])

  const navigation = useNavigation<AppNavigatorRoutesProps>()

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)

      const [balanceData, pending, cashbackStatement] = await Promise.all([
        userService.getUserCashbackBalance(),
        orderService.getPendingCashback(),
        userService.getUserCashbackStatement(),
      ])

      setBalance(balanceData.balance)
      setTotalReceived(balanceData.totalReceived)
      setTotalUsed(balanceData.totalUsed)
      setPendingCashback(pending)
      setStatement(cashbackStatement)
    } catch (error) {
      console.log('Erro ao carregar dados do perfil:', error)
      Alert.alert('Erro', 'Não foi possível carregar seus dados.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      fetchData()
    }, [fetchData]),
  )

  const handleViewStatement = () => {
    navigation.navigate('orderHistory')
  }

  const handleUseCashback = () => {
    navigation.navigate('searchProducts' as never)
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    )
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <HomeScreen title="Cashback Acumulado" />

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Saldo de Cashback</Text>

        <View style={styles.balanceRow}>
          <View>
            <Text style={styles.label}>Disponível</Text>
            <Text style={styles.value}>R$ {balance.toFixed(2)}</Text>
          </View>
          <View>
            <Text style={styles.label}>Recebido</Text>
            <Text style={styles.valueReceived}>
              +{totalReceived.toFixed(2)}
            </Text>
          </View>
          <View>
            <Text style={styles.label}>Usado</Text>
            <Text style={styles.valueUsed}>-{totalUsed.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.button} onPress={handleViewStatement}>
            <Text style={styles.buttonText}>Ver Pedidos</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleUseCashback}>
            <Text style={styles.buttonText}>Usar Cashback</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>Resumo</Text>

        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Extrato de Cashback</Text>

          {statement.length === 0 ? (
            <Text style={styles.summaryLabel}>
              Nenhuma transação encontrada.
            </Text>
          ) : (
            <>
              {statement.map((item) => (
                <View key={item.id} style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>
                    {item.type === 'RECEIVE' ? 'Recebido' : 'Utilizado'} -{' '}
                    {new Date(item.created_at).toLocaleDateString('pt-BR')}
                  </Text>
                  <Text
                    style={[
                      styles.summaryValue,
                      {
                        color: item.type === 'RECEIVE' ? '#16A34A' : '#EF4444',
                      },
                    ]}
                  >
                    {item.type === 'RECEIVE' ? '+' : '-'} R${' '}
                    {item.amount.toFixed(2)}
                  </Text>
                </View>
              ))}
            </>
          )}
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 2,
    backgroundColor: '#F9FAFB',
    flexGrow: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#111827',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#111827',
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#16A34A',
  },
  valueReceived: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#16A34A',
  },
  valueUsed: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  valuePending: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  summary: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#111827',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
