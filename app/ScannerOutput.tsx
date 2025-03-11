import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';

export default function ScannerOutput() {
    const { 
        card_type, 
        id_number, 
        last_name, 
        first_name, 
        middle_name 
    } = useLocalSearchParams();

    return (
        <SafeAreaView style={styles.container}> 
            <View style={styles.content}>
                <Text style={styles.title}>Extracted Data:</Text>
                <Text>Card Type: {card_type || 'Not recognized'}</Text>
                <Text>ID Number: {id_number || 'Not recognized'}</Text>
                <Text>First Name: {first_name || 'Not recognized'}</Text>
                <Text>Middle Name: {last_name || 'Not recognized'}</Text>
                <Text>Last Name: {middle_name || 'Not recognized'}</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    image: {
        width: 350,
        height: 250,
        marginTop: 20,
    },
});
