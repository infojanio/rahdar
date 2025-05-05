import { View, TouchableOpacity, StyleSheet } from 'react-native'

import { MapTypeSvg } from '../../assets';

interface Props {
    mBottom: number,
    onPress: () => void;
}

export function MapType ({ mBottom, onPress }: Props)  {
  return (
    <View style={styles(mBottom).view}>
        <TouchableOpacity onPress={onPress} style={styles().button}>
            <MapTypeSvg />
        </TouchableOpacity>
    </View>
  )
}

const styles = (mBottom?: number) => StyleSheet.create({
    view: {
        position: "absolute",
       
      right: 10,
      bottom: mBottom ? mBottom + 670 : 0,
      marginTop: -120,
      marginLeft: -120,
      padding: 120,
      opacity: 0.85,
      elevation: 5,
        
    },
    button: {
        width: 40,
        height: 40,
        backgroundColor: "#f3f4f6",
        borderRadius: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    }
})

export default MapType;