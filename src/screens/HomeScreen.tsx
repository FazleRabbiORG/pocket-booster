import React, { useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import JoinGroupCard from '../Components/JoinGroupCard';
import AppListCard from '../Components/appListCard';
import { useUserContext } from '../context/UserContext';
import { UsageStatsModule } from '../../AppChecker';

const HomeScreen: React.FC = () => {
  const [applist, setAppList] = React.useState<
    FirebaseFirestoreTypes.DocumentData[]
  >([]);

  const user = useUserContext().user;

  useEffect(() => {
    if (user?.email) {
      checkPermission();
    }
  }, [user]);


  //check setting access permission

  const checkPermission = async () => {
    const isGranted = await UsageStatsModule.getIsPermissionGranted();
    if (!isGranted) {
      Alert.alert(
        "Permission Required",
        "Please allow usage access permission",
        [
          {
            text: "OK",
            onPress: () => {
              UsageStatsModule.openForPermissionUsage();
            },
          },
        ]
      );
    }
  }


  useEffect(() => {
    const subscriber = firestore()
      .collection('apps')
      .onSnapshot((querySnapshot) => {
        const apps: FirebaseFirestoreTypes.DocumentData[] = [];
        querySnapshot.forEach((documentSnapshot) => {
          apps.push(documentSnapshot.data());
        });
        setAppList(apps);
      });

    // Unsubscribe from events when no longer in use
    return () => subscriber();
  }, []);


  return (
    <View style={{ paddingHorizontal: 3 }} >
      {applist.map((app, index) => (
        <AppListCard app={app} key={index} />
      ))}
    </View>
  );
};

export default HomeScreen;


