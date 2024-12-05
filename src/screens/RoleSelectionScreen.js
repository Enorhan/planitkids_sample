import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { supabase } from '../../supabaseClient';

export default function RoleSelectionScreen({ navigation }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Get authenticated user
                const { data: authData, error: authError } = await supabase.auth.getUser();
                if (authError) {
                    console.error('Error fetching authenticated user:', authError.message);
                    Alert.alert('Error', 'Unable to fetch authenticated user.');
                    return;
                }

                const userId = authData?.user?.id;
                if (!userId) {
                    Alert.alert('Error', 'User is not authenticated. Please log in again.');
                    navigation.replace('Login');
                    return;
                }

                // Fetch user details from `users` table
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', userId)
                    .single();

                if (userError) {
                    console.error('Error fetching user data:', userError.message);
                    Alert.alert('Error', 'Unable to fetch user data.');
                } else {
                    setUser(userData);
                    if (userData.role === 'vikarie') {
                        navigation.replace('Agenda', { user: userData });
                    }
                }
            } catch (err) {
                console.error('Unexpected Error:', err);
                Alert.alert('Error', 'Something went wrong. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigation]);

    const navigateToDashboard = (destination) => {
        navigation.navigate(destination, { user });
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Loading...</Text>
            </View>
        );
    }

    if (!user) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>No user data found. Please log in again.</Text>
            </View>
        );
    }

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