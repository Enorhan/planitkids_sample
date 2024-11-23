// src/screens/RoleSelectionScreen.js

import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function RoleSelectionScreen({ navigation, route }) {
    const { user } = route.params; // Receive user data from LoginScreen

    // Automatically redirect Vikarie users to Agenda
    useEffect(() => {
        if (user.role === 'vikarie') {
            navigation.replace('Agenda', { user });
        }
    }, [user, navigation]);

    const navigateToDashboard = (destination) => {
        navigation.navigate(destination, { user });
    };

    return (
        <View style={styles.container}>
            {user.role !== 'vikarie' && (
                <>
                    <Text style={styles.title}>Select Your Role</Text>
                    {user.role === 'fritidsledare' && (
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => navigateToDashboard('FritidsledareDashboard')}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.buttonText}>Fritidsledare</Text>
                        </TouchableOpacity>
                    )}
                    {(user.role === 'fritidsledare' || user.role === 'fritidspersonal') && (
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => navigateToDashboard('FritidspersonalDashboard')}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.buttonText}>Fritidspersonal</Text>
                        </TouchableOpacity>
                    )}
                    {(user.role === 'fritidsledare' || user.role === 'fritidspersonal') && (
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => navigateToDashboard('Agenda')}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.buttonText}>Vikarie</Text>
                        </TouchableOpacity>
                    )}
                </>
            )}
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