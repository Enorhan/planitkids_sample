// src/screens/LoginScreen.js

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { supabase } from '../../supabaseClient'; // Import your Supabase client

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Email validation function
    const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

    const handleLogin = async () => {
        try {
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) {
                Alert.alert('Login Failed', authError.message);
                return;
            }

            console.log('Authenticated User:', authData.user);

            // Debugging step: Fetch user details and log the query result
            const { data: userDetails, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('id', authData.user.id)
                .single();

            console.log('Query Result:', { data: userDetails, error: userError });

            if (userError || !userDetails) {
                Alert.alert('Error', 'Unable to fetch user details.');
                return;
            }

            Alert.alert('Welcome', `Logged in as ${userDetails.email}`);
            navigation.navigate('RoleSelection', { user: userDetails });
        } catch (err) {
            Alert.alert('Unexpected Error', 'Something went wrong. Please try again.');
            console.error(err);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <Text style={styles.appName}>PlanIt Kids</Text>
            </View>
            <Text style={styles.title}>Login to Your Account</Text>
            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                placeholderTextColor="pink"
                autoCapitalize="none"
                keyboardType="email-address"
            />
            <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
                placeholderTextColor="pink"
            />
            <TouchableOpacity
                style={[styles.button, loading && { opacity: 0.6 }]}
                onPress={handleLogin}
                activeOpacity={0.8}
                disabled={loading}
            >
                <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
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
        padding: 20,
    },
    logoContainer: {
        backgroundColor: '#4B0082',
        borderRadius: 15,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginBottom: 20,
    },
    appName: {
        fontSize: 40,
        color: 'white',
        fontWeight: 'bold',
        fontFamily: 'Poppins_700Bold',
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: 'pink',
        marginBottom: 20,
        fontFamily: 'Poppins_600SemiBold',
    },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 8,
        padding: 15,
        color: 'white',
        width: '80%',
        marginVertical: 10,
    },
    button: {
        backgroundColor: '#4B0082',
        paddingVertical: 15,
        borderRadius: 10,
        marginTop: 20,
        width: '80%',
        alignItems: 'center',
    },
    buttonText: {
        color: 'pink',
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'Poppins_600SemiBold',
    },
});