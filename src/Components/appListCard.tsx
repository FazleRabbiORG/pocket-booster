/* eslint-disable prettier/prettier */
import { Button, Linking, StyleSheet, Text, View, AppState, AppStateStatus, TouchableOpacity, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { appOpen, isAppInstalled, todayAppUsage, UsageStatsModule } from '../../AppChecker';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { firebase } from '@react-native-firebase/firestore';
import { getUniqueId } from 'react-native-device-info';
import { useUserContext } from '../context/UserContext';
import { colors } from '../constants/colors';

const AppListCard = ({ app }: any) => {
    const navigation = useNavigation();
    const user = useUserContext().user;
    const [isInstalled, setIsInstalled] = useState(false);
    const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
    const [todayUsage, setTodayUsage] = useState({ used: false, timeSpentInSeconds: 0 });
    const [appData, setAppData] = useState(app);
    const [uniqueId, setUniqueId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [appUsers, setAppUsers] = useState([]);
    const [usageToggle, setUsageToggle] = useState(false);
    const { packageName, startingDate, amount } = appData;
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    const formattedDate = startingDate && startingDate.toDate ? formatDate(startingDate.toDate()) : 'Invalid Date';
    //reload with state change
    useEffect(() => {
        getUniqueId().then((id) => {
            setUniqueId(id);
        });
        const checkAppInstalled = async () => {
            const result = await isAppInstalled(app.packageName);
            setIsInstalled(result);
        };
        checkAppInstalled();

        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (appState.match(/inactive|background/) && nextAppState === 'active') {
                checkAppInstalled();
            }
            setAppState(nextAppState);
        };
        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            subscription.remove();
        };
    }, [app.packageName, appState, isInstalled]);

    //collecting apps data to 'apps' collection
    useEffect(() => {
        const unsubscribe = firebase.firestore().collection('apps').doc(app.packageName)
            .onSnapshot((doc) => {
                if (doc.exists) {
                    setAppData(doc.data());
                }
            });
        return () => unsubscribe();
    }, [app.packageName]);


    useEffect(() => {
        const unsubscribe = firebase.firestore().collection('apps').doc(app.packageName).collection('users')
            .doc(user?.uid)
            .onSnapshot((doc) => {
                if (doc.exists) {
                    setAppUsers(doc.data());
                }
            });
        return () => unsubscribe();
    }, [app.packageName, user?.uid]);



    const openAnApp = async (packageName: string) => {
        appOpen(packageName).then(res => console.log(res));
    };
    //-----------------------------------get today app usage-----------------------------------
    useEffect(() => {
        if (appUsers?.deviceId && isInstalled) {
            UsageStatsModule.getTodayAppUsage(app.packageName).then((res: any) => {
                setTodayUsage(res);
            });
        }
    }, [app.packageName, usageToggle]);

    function convertSeconds(seconds: any) {
        const minutes = Math.floor(seconds / 60); // Get the full minutes
        const remainingSeconds = seconds % 60;   // Get the remaining seconds
        return `${minutes} m ${remainingSeconds} s`;
    }

    const joinApp = async () => {
        setIsLoading(true);
        const user = auth().currentUser;
        const uid = user?.uid;

        if (appData?.joined >= 20) {
            Alert.alert("Sorry!", 'আপনি এই অ্যাপের কাজে আর যোগদান করতে পারবেন না। অ্যাপটির সর্বোচ্চ যোগদানকৃত ব্যবহারকারী সীমা পূরণ হয়েছে। পরবর্তী অ্যাপটি দেখুন।');
            console.log('App has reached the maximum number of joined users');
            setIsLoading(false);
            return;
        }
        if (user && appData?.joined < 20) {
            const userDocRef = firebase.firestore().collection('apps').doc(app.packageName).collection('users').doc(uid);
            const userDoc = await userDocRef.get();
            if (userDoc.exists) {
                console.log('User has already joined');
                setIsLoading(false);
                return;
            }
            const joined = appData ? appData.joined + 1 : 1;
            await firebase.firestore().collection('apps').doc(app.packageName).update({
                joined,
            });
            await userDocRef.set({
                uid,
                deviceId: uniqueId,
            });
            console.log('User successfully joined');
            setIsLoading(false);
        } else {
            console.log('User is not authenticated or the app has reached the maximum number of joined users');
            setIsLoading(false);
        }
    };

    return (
        <View style={[styles.superContainer, appUsers?.deviceId && isInstalled ? { borderColor: colors.successColor, borderLeftWidth: 5 } : {}]}>
            <View style={styles.container}>
                <Text style={styles.appName}>{appData.name}</Text>
                <Text style={styles.amount}>৳{appData.amount}</Text>
                {
                    !appUsers?.deviceId ? <Text style={styles.text}>Joined: {appData.joined ? appData.joined : 0}</Text> : null
                }
                {
                    isInstalled && !appUsers?.deviceId ? <TouchableOpacity onPress={() => joinApp()} >
                        <Text style={styles.joinButton}>{isLoading ? "Loading..." : "Join"}</Text>
                    </TouchableOpacity> : null
                }
                {
                    user?.uid && isInstalled && appUsers?.deviceId ? <Text style={styles.joinedText}>in Progress..</Text> : null
                }

                <Button title={isInstalled ? "open" : "Install"} color={colors.primaryColor} onPress={() => {
                    !isInstalled ? Linking.openURL(`https://play.google.com/store/apps/details?id=${app.packageName}`) : openAnApp(app.packageName);
                }} />

            </View>
            {
                appUsers?.deviceId ? <View style={[styles.container, { marginTop: 10 }]}>
                    {//usage stats---------------------
                        appUsers.deviceId && isInstalled ?
                            <TouchableOpacity onPress={() => setUsageToggle(!usageToggle)}>
                                <Text style={styles.text}>Today Usage: {convertSeconds(todayUsage.timeSpentInSeconds)}</Text>
                            </TouchableOpacity>
                            : null!
                    }
                    {
                        user && isInstalled ? <TouchableOpacity onPress={() => navigation.navigate('TaskDetails', { packageName, formattedDate, amount })}>
                            <Text style={styles.details}>Details </Text>
                        </TouchableOpacity> : null
                    }

                    {
                        appUsers?.deviceId && isInstalled ? <Text style={styles.text}>Joined: {appData.joined ? appData.joined : 0}</Text> : null
                    }

                </View> : null
            }
        </View>
    );
};

export default AppListCard;

const styles = StyleSheet.create({
    superContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        marginVertical: 10,
        width: '100%',
        padding: 10,
        backgroundColor: colors.backgroundColor,
        borderColor: colors.borderColor,
        borderWidth: 1,
        borderRadius: 10,
    },
    container: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
    },
    text: {
        color: colors.textColor,
    },
    joinButton: {
        padding: 10,
        backgroundColor: colors.accentColor,
        color: colors.surfaceColor,
        borderRadius: 5,
    },
    joinedText: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        color: colors.successColor,
        borderRadius: 50,
        fontWeight: 'bold',
        fontSize: 12,
    },
    appName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.textColor,
    },
    amount: {
        fontSize: 12,
        fontWeight: 'bold',
        backgroundColor: colors.successColor,
        color: colors.buttonTextColor,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 50,
    },
    details: {
        backgroundColor: colors.primaryColor,
        color: colors.buttonTextColor,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 50,

    },
});