import { Alert, Button, Image, Keyboard, Linking, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import auth from '@react-native-firebase/auth';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useUserContext } from '../context/UserContext';
import firestore from '@react-native-firebase/firestore';
import { colors } from '../constants/colors';
import WithdrawalStat from '../Components/WithdrawalStat';
import JoinGroupCard from '../Components/JoinGroupCard';
const SettingsScreen = () => {
    const [bKashNumber, setBKashNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [openInput, setOpenInput] = useState(false);
    const navigation = useNavigation<NavigationProp<any>>();
    const user = useUserContext().user;
    const [userInfo, setUserInfo] = useState<any>();

    const handleSignOut = () => {
        auth()
            .signOut()
            .then(() => {
                // Navigate back or to a specific screen after signing out
                navigation.navigate('Home'); // Replace "Login" with your desired screen
            });
    };
    const handleAddPhoneNumber = async () => {
        if (!bKashNumber) {
            Alert.alert('Error', 'Please enter a bKash number.');
            return;
        }

        if (!user) {
            Alert.alert('Error', 'No user is currently logged in.');
            return;
        }
        setOpenInput(true);
        try {
            await firestore()
                .collection('users')
                .doc(user.uid)
                .set(
                    {
                        bKashNumber: bKashNumber,
                    },
                    { merge: true }
                );
            Alert.alert('Success', 'Phone number added successfully.');
            setOpenInput(false);
            //keyboard.dismiss();
            Keyboard.dismiss();
        } catch (error) {
            console.error('Error adding phone number: ', error);
            Alert.alert('Error', 'Failed to add phone number.');
        }
    };

    useEffect(() => {
        const subscriber = firestore()
            .collection('users')
            .doc(user?.uid)
            .onSnapshot((doc) => {
                setUserInfo(doc.data());
            });

        return subscriber;
    }, []);

    const userInfoItems = [
        { label: 'Balance', value: userInfo?.balance || 0 },
        { label: 'Total Withdrawn', value: userInfo?.totalWithdrawn || 0 },
    ];


    const handleWithdrawButton = async () => {
        console.log('Withdraw button pressed');
        if (!userInfo?.bKashNumber) {
            Alert.alert('Error', 'Please add a bKash number before withdrawing.');
            return;
        }
        if (userInfo?.balance < 100) {
            Alert.alert('Error', 'You need at least 100 Taka to withdraw.');
            return;
        }

        console.log('Withdrawing balance...', userInfo?.balance);

        try {
            await firestore().collection('users').doc(user?.uid).set(
                {
                    balance: 0,
                    totalWithdrawn: userInfo?.totalWithdrawn + userInfo?.balance,
                    withdrawRequests: firestore.FieldValue.arrayUnion({
                        amount: userInfo?.balance,
                        status: 'Pending',
                        timestamp: new Date(),
                    }),
                },
                { merge: true }
            );
            Alert.alert('Success', 'Withdrawal successful.');
        } catch (error) {
            console.error('Error withdrawing balance: ', error);
            Alert.alert('Error', 'Failed to withdraw balance.');
        }
    };


    return (
        <View style={styles.container}>
            <View style={styles.userContainer}>
                <Image source={{ uri: user?.photoURL }} style={styles.profileImage} />
                <Text style={styles.name}>{user?.displayName}</Text>
                <Text style={styles.email}>{user?.email}</Text>
            </View>
            <View style={styles.cardContainer}>
                <Text style={styles.name}>bKash Number</Text>
                {
                    userInfo?.bKashNumber ? <Text style={styles.email}>{userInfo?.bKashNumber}</Text> : <TouchableOpacity onPress={() => setOpenInput(!openInput)}>
                        <Text style={styles.addPhoneNumberText}>Add bKash Number</Text>
                    </TouchableOpacity>
                }
            </View>
            <View style={{ display: openInput ? 'flex' : 'none' }} >
                <TextInput
                    style={styles.input}
                    placeholder="Enter bKash Number"
                    keyboardType="phone-pad"
                    value={bKashNumber}
                    onChangeText={setBKashNumber}
                />
                <View style={{ marginBottom: 10 }}>
                    <Button title="Add" onPress={() => handleAddPhoneNumber()} />
                </View>
            </View>

            {userInfo && userInfoItems.map((item, index) => (
                <View key={index} style={styles.cardContainer}>
                    <Text style={styles.name}>{item.label}</Text>
                    <Text style={styles.email}>৳{item.value}</Text>
                </View>
            ))}


            <Button title="Withdraw" onPress={() => handleWithdrawButton()} />

            <JoinGroupCard />
            {/* withdrawRequests activities */}
            {
                userInfo?.withdrawRequests?.map((item: any, index: number) => (
                    <WithdrawalStat key={index} item={item} />
                ))
            }

            <Button title='Join Telegram' onPress={() => {
                Linking.openURL('https://t.me/pocketboosterapp');
            }} />

            {/* <Button title="Sign Out" onPress={handleSignOut} /> */}
        </View>
    );
};

export default SettingsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: colors.backgroundColor, // Use background color from the color scheme
    },
    userContainer: {
        marginVertical: 20,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    cardContainer: {
        marginVertical: 10,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomColor: colors.borderColor, // Use border color from the color scheme
        borderBottomWidth: 1,
        paddingBottom: 5,
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
    input: {
        padding: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: colors.borderColor, // Use border color from the color scheme
        marginBottom: 10,
        color: colors.textColor, // Use text color from the color scheme
    },
    addPhoneNumberText: {
        color: colors.linkColor, // Use link color from the color scheme
    },
});