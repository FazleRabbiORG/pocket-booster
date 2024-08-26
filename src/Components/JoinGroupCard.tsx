import { Button, StyleSheet, Text, View } from "react-native";
import React from "react";
import { openChrome } from "../../AppChecker";
import { colors } from "../constants/colors";

const JoinGroupCard = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Join Group</Text>
      <Button
        title="Join"
        color={colors.primaryColor}
        onPress={() => {
          openChrome("https://groups.google.com/g/fazlerabbi");
        }}
      />
    </View>
  );
};

export default JoinGroupCard;

const styles = StyleSheet.create({
  container: {
    display: "flex",
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginVertical: 10,
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    flexDirection: "row",
    backgroundColor: colors.backgroundColor,
    borderColor: colors.borderColor,
    borderWidth: 1,
    borderRadius: 5,

  },
  text: {
    color: colors.textColor,
  },
});