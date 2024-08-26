import React, { useEffect, useState } from "react";
import { TouchableOpacity, Image, Text, StyleSheet, View, ActivityIndicator } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import onGoogleButtonPress from "../utils/OneTapSignin";
import { useUserContext } from "../context/UserContext";
import auth from '@react-native-firebase/auth';
import { colors } from "../constants/colors";
import firestore from '@react-native-firebase/firestore';

const ProfileAvatar: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const [userInfo, setUserInfo] = useState<any>();
  const { user, setUser } = useUserContext();
  const [loading, setLoading] = useState(false);
  const [toggle, setToggle] = useState(false);
  const photoURL = user?.photoURL ?? "https://gravatar.com/avatar/9041e337a1b6f3c01d06e61186789799?s=200&d=mp&r=pg"; // Provide a default image URL here

  useEffect(() => {
    const subscriber = firestore().collection("users").doc(user?.uid).onSnapshot((doc) => {
      setUserInfo(doc.data());
    }
    );
    return subscriber;
  }, [toggle]);



  const onButtonPress = async () => {
    setLoading(true);
    try {
      const res = await onGoogleButtonPress();
    } catch (err) {
      setLoading(false)
      console.log("err", err);
    } finally {
      firestore().collection("users").doc(auth().currentUser?.uid).set({
        balance: 10,
        email: auth().currentUser?.email,
        name: auth().currentUser?.displayName,
        photoURL: auth().currentUser?.photoURL,
        uid: auth().currentUser?.uid
      }, { merge: true });


      setUser(auth().currentUser)
      setLoading(false)
    }
  };


  return (
    <>
      {user?.photoURL ? (
        <View style={styles.container}>
          <TouchableOpacity onPress={() => setToggle(!toggle)} ><Text style={styles.reward}>৳{userInfo?.balance}</Text></TouchableOpacity>
          <TouchableOpacity
            style={styles.container}
            onPress={() => navigation.navigate("Settings")}
          >
            <Image
              source={{ uri: photoURL }}
              style={{ width: 37, height: 37, borderRadius: 50 }}
            />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.container}
          onPress={() => onButtonPress()}
          disabled={loading}
        >
          <Text style={styles.text} >{loading ? "loading..." : "Sign In"}</Text>
        </TouchableOpacity>
      )}
    </>
  );
};

export default ProfileAvatar;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
    flexDirection: "row",

  },
  reward: {
    fontSize: 16,
    fontWeight: "bold",
    backgroundColor: colors.successColor, // Use reward background color from the color scheme
    color: colors.buttonTextColor, // Use reward text color from the color scheme
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 50,
    marginRight: 10,
  },
  text: {
    color: colors.textColor, // Use text color from the color scheme
  },
});