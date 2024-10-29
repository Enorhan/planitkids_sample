// src/screens/RoleSelectionScreen.js

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function RoleSelectionScreen({ navigation }) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Select Your Role</Text>
            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('FritidsledareDashboard')}
                activeOpacity={0.8}
            >
                <Text style={styles.buttonText}>Fritidsledare</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} activeOpacity={0.8}>
                <Text style={styles.buttonText}>Fritidspersonal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} activeOpacity={0.8}>
                <Text style={styles.buttonText}>Vikarie</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#2E004E',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    title: {
        fontSize: 24,
        color: 'pink',
        marginBottom: 40,
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: '#4B0082',
        paddingVertical: 15,
        borderRadius: 10,
        marginVertical: 10,
        width: '80%',
        alignItems: 'center',
    },
    buttonText: {
        color: 'pink',
        fontSize: 18,
        fontWeight: 'bold',
    },
});