// src/screens/FritidsledareDashboard.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function FritidsledareDashboard({ navigation }) {
    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.optionButton}
                onPress={() => navigation.navigate('WhatsToday')}
                activeOpacity={0.8}
            >
                <Text style={styles.buttonText}>What's Today</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.optionButton}
                onPress={() => navigation.navigate('MyGroup')}
                activeOpacity={0.8}
            >
                <Text style={styles.buttonText}>My Group</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#4B0082',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
    },
    optionButton: {
        backgroundColor: '#FFC0CB',
        padding: 15,
        marginVertical: 10,
        borderRadius: 8,
        width: '80%',
        alignItems: 'center',
    },
    buttonText: {
        color: '#4B0082',
        fontWeight: 'bold',
        fontSize: 16,
    }
});