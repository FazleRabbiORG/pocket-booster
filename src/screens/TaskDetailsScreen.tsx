import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Linking } from 'react-native';
import { Link, useNavigation } from "@react-navigation/native";
import auth from "@react-native-firebase/auth";
import firestore from '@react-native-firebase/firestore';
import { UsageStatsModule } from "../../AppChecker";
import { colors } from '../constants/colors';

const TaskDetailsScreen = ({ route }) => {
    const { packageName, formattedDate, amount } = route.params;
    const user = auth().currentUser;
    const navigation = useNavigation();
    const [usageStats, setUsageStats] = useState([]);
    const [rewardClaimed, setRewardClaimed] = useState(false);
    const [canClaimReward, setCanClaimReward] = useState(false);
    const [loading, setLoading] = useState(false);

    const docRef = firestore().collection('apps').doc(packageName).collection('users').doc(user.uid);

    useEffect(() => {
        const fetchAppUsage = async () => {
            const usageStats = await UsageStatsModule.getAppUsageForUpcoming15Days(packageName, formattedDate);
            setUsageStats(usageStats);
            checkRewardEligibility(usageStats);
        };
        fetchAppUsage();
    }, [packageName, formattedDate]);

    useEffect(() => {
        const unsubscribe = docRef.onSnapshot((doc) => {
            if (doc.exists) {
                const data = doc.data();
                setRewardClaimed(data.rewardClaimed);
            }
        });
        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [docRef]);

    const formatTimeSpent = (seconds: number): string => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs}h ${mins}m ${secs}s`;
    };

    const formatDate = (date: string): string => {
        const d = new Date(date);
        return `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`;
    };

    const checkRewardEligibility = (usageStats) => {
        const minimumUsageTime = 5 * 60; // 5 minutes in seconds
        const eligible = usageStats.every(stat => stat.timeSpentInSeconds >= minimumUsageTime);
        setCanClaimReward(eligible && !rewardClaimed);
    };

    const claimReward = async () => {
        setLoading(true);
        if (canClaimReward) {
            // Update reward status in Firestore
            if (!rewardClaimed) {
                await docRef.update({
                    rewardClaimed: true,
                    usageStats: usageStats,
                });

                await firestore().collection('users').doc(user.uid).update({
                    balance: firestore.FieldValue.increment(Number(amount)),
                });

                setLoading(false);
                Alert.alert("Reward claimed", "You have successfully claimed the reward.");
            } else {
                Alert.alert("Reward already claimed", "You have already claimed the reward.");
                setLoading(false);
            }
        } else {
            //alart user 
            setLoading(false);
            Alert.alert("You are not eligible to claim the reward", "You need to use the app for at least 5 minutes each day for the next 15 days to be eligible to claim the reward.", [
                { text: "OK", onPress: () => console.log("OK Pressed") }
            ]);
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.usageContainer}>
            <Text style={styles.date}>{formatDate(item.date)}</Text>
            <Text style={styles.timeSpent}>{formatTimeSpent(item.timeSpentInSeconds)}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <View style={styles.userContainer}>
                    <Text style={styles.name}>{user?.displayName}</Text>
                    <Text style={styles.email}>{user?.email}</Text>
                </View>
                <View style={[styles.userContainer, { justifyContent: "flex-end", alignItems: 'flex-end' }]}>
                    <Text style={styles.email}>{packageName}</Text>
                    <TouchableOpacity onPress={() => {

                        Linking.openURL('https://play.google.com/store/apps/details?id=' + packageName);

                    }}>
                        <Text style={styles.btn}>Write a Review</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <FlatList
                data={usageStats}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
            />
            <TouchableOpacity
                style={[styles.button, canClaimReward ? styles.buttonEnabled : styles.buttonDisabled]}
                onPress={claimReward}
                disabled={!canClaimReward || loading || rewardClaimed}
            >
                {
                    loading ? <Text style={styles.buttonText}>Loading...</Text> : <Text style={styles.buttonText}>Claim the Reward {`(৳${amount})`} </Text>
                }
            </TouchableOpacity>
        </View>
    );
};

export default TaskDetailsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: colors.backgroundColor, // Use background color from the color scheme
    },
    userContainer: {
        marginBottom: 20,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textColor, // Use text color from the color scheme
    },
    email: {
        fontSize: 16,
        color: colors.secondaryTextColor, // Use secondary text color from the color scheme
    },
    usageContainer: {
        marginBottom: 10,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomColor: colors.borderColor, // Use border color from the color scheme
        borderBottomWidth: 1,
        paddingBottom: 5,
    },
    headerContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    date: {
        fontSize: 16,
        color: colors.textColor, // Use text color from the color scheme
    },
    timeSpent: {
        fontSize: 14,
        color: colors.secondaryTextColor, // Use secondary text color from the color scheme
    },
    button: {
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonEnabled: {
        backgroundColor: colors.buttonEnabledColor, // Use button enabled color from the color scheme
    },
    buttonDisabled: {
        backgroundColor: colors.buttonDisabledColor, // Use button disabled color from the color scheme
    },
    buttonText: {
        color: colors.buttonTextColor, // Use button text color from the color scheme
        fontSize: 16,
    },
    btn: {
        color: colors.accentColor,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

