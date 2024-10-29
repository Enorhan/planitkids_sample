// src/screens/MyGroup.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MyGroup() {
    return (
        <View style={styles.container}>
            <Text style={styles.titleText}>My Group</Text>
            <Text style={styles.contentText}>This is where you can manage and view your group information.</Text>
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
        color: '#FFC0CB',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    contentText: {
        color: '#FFC0CB',
        fontSize: 16,
        textAlign: 'center',
    },
});