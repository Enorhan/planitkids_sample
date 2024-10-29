// src/screens/HomeScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function HomeScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.titleText}>Home Screen</Text>
            <Text style={styles.contentText}>Welcome to the Home Screen!</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#4B0082',
        padding: 16,
    },
    titleText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFC0CB',
        marginBottom: 10,
    },
    contentText: {
        fontSize: 16,
        color: '#FFC0CB',
        textAlign: 'center',
    },
});