import { View, TouchableOpacity, StyleSheet } from 'react-native'

import { MyLocationSvg } from '../../assets';

interface Props {
    mBottom: number,
    onPress: () => void;
}

export function MyLocation ({ mBottom, onPress }: Props) {
  return (
    <View style={styles(mBottom).view}>
        <TouchableOpacity onPress={onPress} style={styles().button}>
            <MyLocationSvg />
        </TouchableOpacity>
    </View>
  )
}

const styles = (mBottom?: number) => StyleSheet.create({
    view: {
        position: 'absolute',
        right: 10,
        bottom: mBottom ? mBottom + 490 : 0,
        marginTop: -120,
        marginLeft: -100,
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

