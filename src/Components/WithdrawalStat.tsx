import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { colors } from '../constants/colors';

const WithdrawalStat = ({ item }) => {

    const { amount, timestamp, status } = item;
    const date = timestamp ? new Date(timestamp) : null;
    return (
        <View style={styles.container}>
            <Text style={styles.amount} >{amount}</Text>
            <Text style={styles.timestamp}>
                {date ? date.toLocaleDateString() : 'N/A'}
            </Text>
            <Text style={styles.status}>{status}</Text>
        </View>
    )
}

export default WithdrawalStat

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 10,
        padding: 10,
        backgroundColor: colors.backgroundColor,
        borderColor: colors.borderColor,
        borderWidth: 1,
        borderRadius: 5
    },
    amount: {
        color: colors.textColor,
        fontSize: 16
    },
    timestamp: {
        color: colors.textColor,
        fontSize: 16
    },
    status: {
        color: colors.textColor,
        fontSize: 16
    }
})