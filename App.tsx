import React, { useEffect } from 'react';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import ProfileAvatar from './src/Components/ProfileAvatar';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import SettingsScreen from './src/screens/SettingsScreen';
import TaskDetailsScreen from './src/screens/TaskDetailsScreen';
import { Alert, StatusBar } from 'react-native';
import { UsageStatsModule } from './AppChecker';
import { UserProvider } from './src/context/UserContext';
const Stack = createNativeStackNavigator();
import { useColorScheme } from 'react-native';
import { colors } from './src/constants/colors';



const App = () => {



  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        "1044035308670-vb96a16arpsivbgbc0o41s5odqaa0b0u.apps.googleusercontent.com",
    });
  }, []);

  const scheme = useColorScheme();

  return (
    <UserProvider >
      <StatusBar backgroundColor={colors.backgroundColor} barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} />
      <NavigationContainer theme={scheme === 'dark' ? DarkTheme : DefaultTheme} >
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.backgroundColor,
            },
            headerTintColor: colors.textColor,
          }}

        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              headerShadowVisible: false,
              title: 'Pocket Booster',
              headerRight: () => (<ProfileAvatar />),
            }}

          />
          <Stack.Screen name="Settings" component={SettingsScreen} options={{
            title: 'Settings',
            headerShadowVisible: false,
          }} />
          <Stack.Screen name="TaskDetails" component={TaskDetailsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
};

export default App;

