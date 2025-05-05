import React, { useEffect, useState } from 'react'

import { FlatList, View, Text, Image, Container, HStack } from 'native-base'

import { SeparatorItem } from '../../../components/SeparatorItem'
import {
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TextInput,
} from 'react-native'

import { token } from 'src/descart/key'

export function AllProduct() {
  const [users, setUsers] = useState([])
  const [originalUsers, setOriginalUsers] = useState([])

  const [loading, setLoading] = useState(false)
  const [lastID, setLastID] = useState(0)

  const per_page = 10

  //carrega usuários do github
  function getusers() {
    setLoading(true)

    fetch(`https://api.github.com/users?since=${lastID}&${per_page}`, {
      headers: { Authorization: 'Bearer' + token },
    }) //
      .then((response) => response.json())
      .then((usersRet) => {
        setOriginalUsers(lastID === 0 ? usersRet : users.concat(usersRet))
        setUsers(lastID === 0 ? usersRet : users.concat(usersRet))

        setLoading(false)
      })
  }

  useEffect(() => {
    getusers()
  }, [lastID])

  function renderUser(item: any) {
    return (
      <HStack>
        <Image
          alt="foto"
          source={{ uri: item?.avatar_url }}
          size={16}
          borderRadius="full"
        />
        <View>
          <Text>
            {item.login} - {item.id}
          </Text>
          <Text>{item.url}</Text>

          <View>
            <TouchableOpacity style={{ backgroundColor: '#66f' }}>
              <Text color={'gray.100'}>Comprar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </HStack>
    )
  }

  function search(s) {
    let array = JSON.parse(JSON.stringify(originalUsers))

    setUsers(array.filter((d) => d.login.includes(s)))
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text>Produtos</Text>
      <TextInput
        style={styles.input}
        placeholder={'Buscar produto'}
        onChangeText={(s) => search(s)}
        autoCapitalize="none"
      />
      <FlatList
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={SeparatorItem}
        data={users}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => renderUser(item)}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => setLastID(0)}
            tintColor={'#eeeeee'}
            colors={['#eee']}
          />
        }
        onEndReached={() => {
          var lastUser = users.pop()

          if (!loading) setLastID(lastUser?.id)
        }}
        onEndReachedThreshold={0.3}
        ListFooterComponent={() =>
          loading ? <ActivityIndicator /> : <View h={50} />
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },

  input: {
    borderColor: '#eee',
    borderWidth: 1,
    borderRadius: 4,
    height: 40,
    marginHorizontal: 20,
    paddingLeft: 10,
    marginTop: 10,
    marginBottom: 20,
  },
})
