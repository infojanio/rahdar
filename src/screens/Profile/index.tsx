import { useState } from 'react'
import { TouchableOpacity } from 'react-native'
import { useToast } from 'native-base'

import { UserPhoto } from '@components/HomeHeader/UserPhoto'
import { HomeScreen } from '@components/HomeScreen'
import {
  Center,
  Heading,
  ScrollView,
  Skeleton,
  Text,
  VStack,
} from 'native-base'

import { Input } from '@components/Input'
import { Button } from '@components/Button'

import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system'

import { useAuth } from '@hooks/useAuth'
import { api } from '@services/api'

const PHOTO_SIZE = 32

export function Profile() {
  const [photoIsLoading, setPhotoIsLoading] = useState(false)
  const [userPhoto, setUserPhoto] = useState<string | undefined>(
    'https://avatars.githubusercontent.com/u/59238443?s=400&u=791297bd91ddab3559bfe062a70e87c1919935bf&v=4',
  )

  const toast = useToast()
  const { user } = useAuth()

  async function handleUserPhotoSelect() {
    setPhotoIsLoading(true)

    try {
      //acessa o album do fotos
      const photoSelected = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        aspect: [4, 4], //foto 4/4
        allowsEditing: true, //edição da foto, recorte
      })

      if (photoSelected.canceled) {
        return
      }

      //verifica se existe URI
      if (photoSelected.assets[0].uri) {
        const photoInfo = await FileSystem.getInfoAsync(
          photoSelected.assets[0].uri,
        )

        //verifica se a foto é maior que 5 MB
        if (photoInfo.size && photoInfo.size / 1024 / 1024 > 5) {
          return toast.show({
            title: 'Atenção, imagem maior que 5MB!',
            placement: 'top',
            bgColor: 'red.500',
          })
        }

        // setUserPhoto(photoSelected.assets[0].uri)
        const fileExtension = photoSelected.assets[0].uri?.split('.').pop() //retorna a extensão da imagem

        const photoFile = {
          name: `${user.name}.${fileExtension}`.toLowerCase(), //intepolar o nome ao arquivo com letras minúscula
          uri: photoSelected.assets[0].uri,
          type: `${photoSelected.assets[0].type}/${fileExtension}`,
        } as any
        // console.log(photoFile)

        const userPhotoUploadForm = new FormData()
        userPhotoUploadForm.append('avatar', photoFile) //avatar foi definido na rota do backend

        await api.patch('/users/avatar', userPhotoUploadForm, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })

        toast.show({
          title: 'Foto Atualizada!',
          placement: 'top',
          bgColor: 'green.500',
        })
      }

      //atualiza a foto
      setUserPhoto(photoSelected.assets[0].uri)
      toast.show({
        title: 'Foto atualizada com sucesso!',
        placement: 'top',
        bgColor: 'green.500',
      })
    } catch (error) {
      console.log(error)
    } finally {
      setPhotoIsLoading(false)
    }
  }

  return (
    <VStack>
      <HomeScreen title="Perfil" />
      <ScrollView contentContainerStyle={{ paddingBottom: 36 }}>
        <Center mt={2} px={10}>
          {photoIsLoading ? (
            <Skeleton
              w={PHOTO_SIZE}
              h={PHOTO_SIZE}
              rounded="full"
              startColor="gray.500"
              endColor="gray.400"
            />
          ) : (
            <TouchableOpacity onPress={handleUserPhotoSelect}>
              <UserPhoto
                source={{
                  uri: userPhoto,
                }}
                alt="Foto do usuário"
                size={PHOTO_SIZE}
              />
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={handleUserPhotoSelect}>
            <Text
              color="green.600"
              fontWeight="bold"
              fontSize="md"
              mt={2}
              mb={4}
            >
              Alterar foto
            </Text>
          </TouchableOpacity>

          <Input placeholder="Nome" />
          <Input placeholder="info.janio@gmail.com" isDisabled={true} />
        </Center>

        <VStack px={10} mt={4} mb={9}>
          <Heading color="gray.500" fontSize="md" mb={2}>
            Alterar senha
          </Heading>

          <Input placeholder="Senha atual" secureTextEntry />
          <Input placeholder="Nova senha" secureTextEntry />
          <Input placeholder="Confirme a nova senha" secureTextEntry />

          <Button title="Atualizar" mt={2} />
        </VStack>
      </ScrollView>
    </VStack>
  )
}
