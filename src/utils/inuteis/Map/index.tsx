import React, { useState, useEffect, useRef, useMemo } from 'react'
import MapView, { Callout, LatLng, Marker, Region } from 'react-native-maps'
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  Platform,
  PermissionsAndroid,
  TouchableOpacity,
} from 'react-native'

import useSupercluster from 'use-supercluster'
import type { PointFeature } from 'supercluster'
import type { BBox, GeoJsonProperties} from 'geojson'

const { width, height } = Dimensions.get('screen')

//import Geolocation from '@react-native-community/geolocation'
import * as Location from 'expo-location'
import { SearchCard } from '@components/ButtonBack'
import { Icon } from 'native-base'
import { MaterialIcons } from '@expo/vector-icons'
import {MyLocation} from '@c@utils/Mylocation
import {MapTypeCard} from '@components/MapTypeCard'
import {MapType } from 'src/descart/MapType'
import {NewMarker } from '@components/NewMarker'

import database from '../../components/NewMarker/database'

interface PointProperties {
  cluster: boolean;
  category: string;
  id: number;
  color: string,
}

//Pede ao usuário permissão pra mostrar a localização
const getMyLocation = async (): Promise<Region | undefined> => {
  let { status } = await Location.requestForegroundPermissionsAsync()
  if (status !== 'granted') return

  const { latitude, longitude } = (
    await Location.getCurrentPositionAsync({})
  ).coords
  const region = {
    latitude,
    longitude,
    latitudeDelta: 0.035,
    longitudeDelta: 0.035,
  }
  return region
}

//
const regionToBoundingBox = (region: Region): BBox => {
  let lngD: number;
  if (region.longitudeDelta < 0) lngD = region.longitudeDelta + 360;
  else lngD = region.longitudeDelta;

  return [
    region.longitude - lngD, // westLng - min lng
    region.latitude - region.latitudeDelta, // southLat - min lat
    region.longitude + lngD, // eastLng - max lng
    region.latitude + region.latitudeDelta, // northLat - max lat
  ];
};




export function Map() {
  const [region, setRegion] = useState()
  //const [markers, setMarkers] = useState([])
    const [cardHeight, setCardHeight] = useState(0);
    const [showMarkerSetter, setShowMarkerSetter] = useState(false);
    const [markerCoordinates, setMarkerCoordinates] = useState<LatLng>({latitude: 0, longitude: 0})
 
    const [showCard, setShowCard] = useState<'search' | 'mapType'>('search');
    const [mapType, setMapType] = useState<'standard' | 'satellite' | 'terrain'>('standard');

    const mapRef = useRef<MapView>(null)

    const markers = database.markers

    const [bounds, setBounds] = useState<BBox>()
    const [zoom, setZoom] = useState(12);
  
    const onRegionChangeComplete = async (region: Region, _?: object) => {
      const mapBounds = regionToBoundingBox(region);
      setBounds(mapBounds);
      const camera = await mapRef.current?.getCamera();
      setZoom(camera?.zoom ?? 10);
    }


  const goToMyLocation = async () => {
    const region = await getMyLocation() //pega a localização do usuário
    region && mapRef.current?.animateToRegion(region, 1000) //dá um zoom até o local do usuário
  }

  //pega a altura da View
  const handleLayoutChange = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setCardHeight(height);
  }

  
  const handleNewMarker = async ()=>  {
    if(!showMarkerSetter) { //se o botão estiver Add
      const camera = await mapRef.current?.getCamera()
      camera?.center && setMarkerCoordinates(camera?.center) //retorna as coordenadas do centro da tela
    } else {
      database?.markers.push({
        id: database.markers.length + 1,
        color: 'green',
        coordinates: markerCoordinates
      })
    }
    setShowMarkerSetter(v => !v) //troca valor
  }


  const handleClusterPress = (cluster_id: number): void => {
    // Zoom to cluster
    const leaves = supercluster?.getLeaves(cluster_id);
    if (!leaves) return
    const coords = leaves?.map((l) => ({
      longitude: l.geometry.coordinates[0],
      latitude: l.geometry.coordinates[1],
    }))
    mapRef.current?.fitToCoordinates(coords, {
      edgePadding: {
        top: 200,
        right: 50,
        bottom: 250,
        left: 50,
      },
      animated: true,
    });
  };


  const points = useMemo<PointFeature<GeoJsonProperties & PointProperties>[]>(() => {
    return database?.markers.map((m) => ({
      type: 'Feature',
      properties: {
        cluster: false,
        category: 'markers',
        id: m.id,
        color: m.color
      },
      geometry: {
        type: 'Point',
        coordinates: [m.coordinates.longitude, m.coordinates.latitude],
      },
    }));
  }, [database?.markers.length]);

  //Usar super cluster para organizar marcadores
  const { clusters, supercluster } = useSupercluster({
    points,
    bounds,
    zoom,
    options: { radius: 75, maxZoom: 20 }
  });
  

  return (
    <View style={styles.container}>
      <MapView
          provider="google"
          style={styles.map}
          ref={mapRef}
          onMapReady={() => {goToMyLocation()}}
        onRegionChangeComplete={onRegionChangeComplete}
        zoomEnabled={true}
        minZoomLevel={5}
       onMapLoaded={() => {
         goToMyLocation()
        }}
        loadingEnabled={true}
     
        showsUserLocation
        showsMyLocationButton={false}
        mapType={mapType}
      >
                
       

        {showMarkerSetter &&
        <Marker 
        draggable
        coordinate={markerCoordinates} //permite mover o marcador
        onDragEnd={(e) => setMarkerCoordinates(e.nativeEvent.coordinate)}
        />
      }

      {/*  comentamos o marcador
      {database.markers.map(marker => (
        
        <Marker 
        title='Meu Local de entrega'        
        key={marker.id}
        coordinate={marker.coordinates}
        pinColor={marker.color}
        />
        ))}

      */  }

{clusters?.map((point) => {
            const [longitude, latitude] = point.geometry.coordinates;
            const coordinates = { latitude, longitude };
            const properties = point.properties;

            if (properties?.cluster) {
              const size = 25 + (properties.point_count * 75) / points.length
              return (
                <Marker
                  key={`cluster-${properties.cluster_id}`}
                  coordinate={coordinates}
                  onPress={() => handleClusterPress(properties.cluster_id)}>
                  <View style={[styles.cluster, { width: size, height: size }]}>
                    <Text style={styles.clusterCount}>{properties.point_count}</Text>
                  </View>

                  <Callout tooltip={true}>
                    <View style={{backgroundColor: "white", padding: 10}}>
                    <Text>Endereço:</Text>
                    <Text>Setor Aeroporto, rua 5, Qd. 6, Lt.1</Text>
                    </View>
                </Callout>
                </Marker>
              );
            }

            return (
              <Marker
                key={properties.id}
                coordinate={coordinates}
                pinColor={properties.color} />
            )
          })}


        </MapView >
        <MyLocation mBottom={cardHeight} onPress={goToMyLocation}/> 
        <MapType mBottom={cardHeight+40} onPress={()=> setShowCard('mapType')}/>
          
          <NewMarker           
          mBottom={cardHeight+100} 
          showMarkerSetter={showMarkerSetter} 
          onPress= {handleNewMarker}  
          />    

      {showCard === 'search' ? (
        <SearchCard handleLayoutChange={handleLayoutChange}/>
        
        ) : ( 
          <MapTypeCard 
          handleLayoutChange={handleLayoutChange}
          closeModal= {()=> setShowCard('search')}
          changeMapType= {(mapType)=> setMapType(mapType)}
          /> 
          )
          
          }   


           
          
          
        
    </View>
  )
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
   
    
  },
  map: {
    
    width: width,
    height: height,
  },

  logo: {
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingHorizontal: 15,
    elevation: 5,
    marginTop: -730,
    alignSelf: 'center',
    marginRight: 10,
    flexDirection: 'row',
  },
  logoText: {
    fontWeight: 'bold',
    fontSize: 22,
  },
  positonBox: {
    backgroundColor: '#fff',
    borderRadius: 20,
    opacity: 0.75,
    marginTop: -170,
    marginHorizontal: 60,
    padding: 50,
    shadowColor: '#000',
    elevation: 5,
  },
  positonBoxTitle: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  positonBoxLatLon: {flexDirection: 'row', justifyContent: 'space-between'},
  locationButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 150,
    marginTop: -25,
    width: 50,
    height: 50,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    elevation: 8,
  },

  cluster: {
    borderRadius: 100,
    backgroundColor: '#334155',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clusterCount: {
    color: '#FFF',
    fontWeight: 'bold',
  }


})

/* Pega a localização em projetos CLI  
function handleMyLocation() {
    Geolocation.getCurrentPosition((info) => {
      console.log('LAT', info.coords.latitude)
      console.log('LONG', info.coords.longitude)

      
      setRegion({
        latitude: info.coords.latitude,
        longitude: info.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      })

 */


      /*
  useEffect(() => {
    handleMyPermission()
  }, [])
  
  //pega a permissão em projetos EXPO
  function handleMyPermission() {
    ;(async () => {
      let { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        //setErrorMsg('Permission to access location was denied')
        return
      }
      
      let region = await Location.getCurrentPositionAsync({})
      
      setRegion(region)
      console.log(region)
    })()
  }
  
  //Mostra o ponto atual do usuário no mapa
  function PointActual() {
    const mapRef = useRef<MapView>(null)
  }


//cria um marcador no mapa
  function newMarker(e) {
    console.log(e.nativeEvent.coordinate.latitude)
    console.log(e.nativeEvent.coordinate.longitude)

    let dados = {
      key: markers.length, //cria chave aleatória, tamanho da lista
      coords: {
        latitude: e.nativeEvent.coordinate.latitude,
        longitude: e.nativeEvent.coordinate.longitude,
      },
      pinColor: '#FF0000',
    }

    //garante o deslocamento para o local onde foi criado o marcador
    setRegion({
      latitude: e.nativeEvent.coordinate.latitude,
      longitude: e.nativeEvent.coordinate.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    })

    //pega todos os marcadores e adiciona +1 na lista
   // setMarkers((oldArray) => [...oldArray, dados])
  }

  */
