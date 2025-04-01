import React from "react";
import { ActivityIndicator, Modal, View, Text, StyleSheet } from "react-native";

const LoadingOverlay: React.FC<{visible: boolean}> = ({visible}) => {
  return (
    <Modal
        transparent={true}
        visible={visible}
        animationType="fade"
    >
      <View style={styles.loadingModalContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Processing, please wait...</Text>
      </View>
    </Modal>
  )
};

const styles = StyleSheet.create({
    loadingModalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
      },
      loadingText: {
        color: 'white',
        marginTop: 15,
        fontSize: 16,
        fontWeight: '500',
    },
});

export default LoadingOverlay;