import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const Usagecard = ({ usage }: any) => {
    const splitString = usage.date.split(" ");
    const result = splitString.slice(0, 3).join(" ");

    const minutes = Math.floor(usage.timeSpentInSeconds / 60);
    const seconds = usage.timeSpentInSeconds % 60;

    return (
        <>
            {usage.used ? (
                <View style={styles.container} >
                    <Text>{result}</Text>
                    <Text>{minutes} minutes {seconds} seconds</Text>
                </View>
            ) : null
            }
        </>
    )
}

export default Usagecard

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 10,
        margin: 5,
        borderWidth: 1,
        borderColor: 'lightgrey',
        borderRadius: 10,
        backgroundColor: 'white'
    },
})