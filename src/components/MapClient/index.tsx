import React, { useEffect, useRef, useState } from 'react'

import { View } from 'native-base'
import MapView, { Callout, LatLng, Marker, Region } from 'react-native-maps'
import { Dimensions, StyleSheet, Text } from 'react-native'

import * as Location from 'expo-location'

const { width, height } = Dimensions.get('screen')

import { MapGoogleType } from '@components/MapGoogleType'
import { MapCard } from '@components/MapCard'
import { NewMarker } from '@components/NewMarker'
import { ButtonBack } from '@components/ButtonBack'
import { MapTypeCard } from '@components/MapTypeCard'
import { LocationActual } from '@components/LocationActual'
import { InfoAdd } from '@components/InfoAdd'
import database from '@components/NewMarker/database'

import PhotoPng from '@assets/UserLocal.png'
import MapType from 'src/descart/MapType'

export function MapClient() {
  const [showMarkerSetter, setShowMarkerSetter] = useState(false)
  const [showAddress, setShowAddress] = useState(false)

  const [markerCoordinates, setMarkerCoordinates] = useState<LatLng>({
    latitude: 0,
    longitude: 0,
  })

  const [cardHeight, setCardHeight] = useState(0)
  const [showCard, setShowCard] = useState<'back' | 'mapType'>('back')

  //const [showAddress, setShowAddress] = useState<'init' | 'mapAddress'>('init')

  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'terrain'>(
    'standard',
  )

  const markers = database.markers
  const mapRef = useRef<MapView>(null)

  /*
  useEffect(() => {
    setTimeout(()=> {
      handleNewMarker()
      }, 5000)    
  }, [])
  */

  //Pede ao usuário permissão pra mostrar a localização atual
  const getMyLocation = async (): Promise<Region | undefined> => {
    let { status } = await Location.requestForegroundPermissionsAsync()

    if (status !== 'granted') return

    const { latitude, longitude } = (
      await Location.getCurrentPositionAsync({})
    ).coords
    const region = {
      latitude,
      longitude,
      latitudeDelta: 0.025,
      longitudeDelta: 0.025,
    }
    console.log(
      'Minha localização: ' + region?.latitude + ' e ' + region?.longitude,
    )
    return region
  }

  //direcionar o zoom para essa localização
  const goToMyLocation = async () => {
    const region = await getMyLocation() //pega a localização do usuário
    region && mapRef.current?.animateToRegion(region, 1000) //dá um zoom até o local do usuário

    //console.log("Vou para o ponto: "+region?.latitude +" e "+ region?.longitude)
    return region
  }

  //adiciona marcador no local
  const handleNewMarker = async () => {
    if (!showMarkerSetter) {
      //se o botão adicionar não estiver habilitado
      const camera = await mapRef.current?.getCamera()
      camera?.center && setMarkerCoordinates(camera?.center) //centraliza a tela
    } else {
      //salvar marcador
      markers.push({
        id: markers.length + 1,
        color: 'green',
        coordinates: markerCoordinates,
      })
    }
    setShowMarkerSetter((v) => !v) //
    console.log('Incluí novo NewMarker')

    setShowAddress((v) => !v) //  console.log("Incluí a caixa de endereço")
  }

  //pega a altura da View
  const handleLayoutChange = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout
    setCardHeight(height)
  }

  return (
    <View flex={1}>
      <MapView
        style={styles.map}
        ref={mapRef}
        onMapReady={() => {
          goToMyLocation()
          console.log('carreguei o MapView')
        }}
        loadingEnabled
        showsUserLocation
        showsMyLocationButton={false}
        mapType={mapType}
        zoomEnabled={true}
        minZoomLevel={5}
      >
        {showMarkerSetter && (
          <Marker
            draggable
            coordinate={markerCoordinates}
            onDragEnd={(e) => setMarkerCoordinates(e.nativeEvent.coordinate)}
            isPreselected={true}
            title={'Local de entrega'}
          />
        )}

        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={marker.coordinates}
            pinColor={marker.color}
            image={PhotoPng}
          >
            <Callout>
              <Text>Local de entrega</Text>
            </Callout>
          </Marker>
        ))}
      </MapView>

      <LocationActual mBottom={cardHeight} onPress={goToMyLocation} />

      <MapGoogleType
        mBottom={cardHeight}
        onPress={() => setShowCard('mapType')}
      />

      <NewMarker
        mBottom={cardHeight}
        showMarkerSetter={showMarkerSetter}
        onPress={handleNewMarker}
      />

      {showCard === 'back' ? (
        <ButtonBack handleLayoutChange={handleLayoutChange} />
      ) : (
        <MapTypeCard
          handleLayoutChange={handleLayoutChange}
          closeModal={() => setShowCard('back')}
          changeMapType={(mapType) => setMapType(mapType)}
        />
      )}

      {showAddress === false ? (
        <InfoAdd handleLayoutChange={handleLayoutChange} />
      ) : (
        <MapCard handleLayoutChange={handleLayoutChange} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  map: {
    width: width,
    height: height,
  },
})
