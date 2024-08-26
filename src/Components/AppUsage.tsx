import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { usageStats } from '../../AppChecker';
import Usagecard from './Usagecard';
import auth from '@react-native-firebase/auth'

const AppUsage = ({ app }: any) => {
  const [usages, setUsages] = useState<any[]>([]);
  const [isClaimable, setIsClaimable] = useState(false);
  const user = auth().currentUser;

  useEffect(() => {
    usageStats(app.packageName).then((res) => {
      setUsages(res)
    });
  }, [app.packageName]);

  useEffect(() => {
    const isClaimable = usages.every(entry => entry.used)
    setIsClaimable(isClaimable)
  }, [usages])


  return (
    <View>

      <View style={styles.appContainer}>
        <Text style={styles.title}>{app.name}</Text>
        <TouchableOpacity onPress={() => { }}>
          {
            isClaimable ? <Text style={styles.pressButton}>Claim Reward</Text> : <Text style={styles.pressButton}>Not Claimable Yet</Text>
          }
        </TouchableOpacity>
      </View>
      {
        usages.map((usage, index) => (
          <Usagecard key={index} usage={usage} />
        ))
      }
    </View>
  );
};

export default AppUsage;

const styles = StyleSheet.create({
  container: {
    padding: 10,
    margin: 10,
    borderWidth: 1,
    borderColor: 'black',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },

  appContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  pressButton: {
    backgroundColor: 'green',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
    fontWeight: 'bold',
    color: 'white',

  },

});

// {"lastTimeUsed": "Sun Aug 11 22:28:28 GMT+06:00 2024", "packageName": "com.earnbyinstall", "totalTimeInForeground": 4300}
