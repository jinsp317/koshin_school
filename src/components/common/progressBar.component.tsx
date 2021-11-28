import React from "react";
import { View, ActivityIndicator, StyleSheet, Platform } from "react-native";
import { themes } from "@src/core/themes";

const ProgressBar = () => (
  <View style={styles.progressBar}>
    <ActivityIndicator
      size="large"
      color={
        Platform.OS === "ios"
          ? "white"
          : themes["App Theme"]["color-primary-500"]
      }
    />
  </View>
);

const styles = StyleSheet.create({
  progressBar: {
    flex: 1,
    justifyContent: "center"
  }
});

export default ProgressBar;
