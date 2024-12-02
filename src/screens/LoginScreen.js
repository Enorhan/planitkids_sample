import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Linking } from 'react-native';
import { supabase } from '../../supabaseClient'; // Import your Supabase client

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password.');
            return;
        }

        setLoading(true);

        try {
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) {
                Alert.alert('Login Failed', authError.message);
                return;
            }

            // Fetch user details (including role)
            const { data: userDetails, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('id', authData.user.id)
                .single();

            if (userError || !userDetails) {
                Alert.alert('Error', 'Unable to fetch user details.');
                return;
            }

            // Navigate based on role
            if (userDetails.role === 'bus_driver') {
                navigation.replace('BusDriverDashboard', { user: userDetails });
            } else if (userDetails.role === 'vikarie') {
                navigation.replace('Agenda', { user: userDetails });
            } else {
                navigation.replace('RoleSelection', { user: userDetails });
            }
        } catch (err) {
            console.error('Unexpected Error:', err);
            Alert.alert('Unexpected Error', 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const openWebsite = async () => {
        const url = 'https://planitkidsapp.com';
        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                Alert.alert('Error', `Cannot open this URL: ${url}`);
            }
        } catch (err) {
            console.error('Failed to open website:', err);
            Alert.alert('Error', 'Something went wrong while opening the website.');
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
            {/* Add Website Button */}
            <TouchableOpacity style={styles.websiteButton} onPress={openWebsite} activeOpacity={0.8}>
                <Text style={styles.websiteButtonText}>Visit PlanIt Kids Website</Text>
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
    websiteButton: {
        marginTop: 15,
        backgroundColor: '#FFA500',
        paddingVertical: 15,
        borderRadius: 10,
        width: '80%',
        alignItems: 'center',
    },
    websiteButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});