import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import { supabase } from '../../supabaseClient';
import { MaterialIcons } from '@expo/vector-icons';

export default function RoleSelectionScreen({ navigation }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [menuVisible, setMenuVisible] = useState(false);

    // Fetch user data
    useEffect(() => {
        const fetchUserData = async () => {
            try {
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

                    // Redirect vikarie to Agenda directly
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

    // Handle menu actions
    const handleMenuOption = async (option) => {
        setMenuVisible(false);
        if (option === 'Logout') {
            try {
                const { error } = await supabase.auth.signOut();
                if (error) throw new Error(error.message);
                navigation.replace('Login');
            } catch (err) {
                console.error('Logout Error:', err.message);
                Alert.alert('Error', 'Failed to log out. Please try again.');
            }
        }
    };

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
            {/* Menu Button */}
            <TouchableOpacity style={styles.menuButton} onPress={() => setMenuVisible(true)}>
                <MaterialIcons name="more-vert" size={28} color="#FFC0CB" />
            </TouchableOpacity>

            {/* Custom Modal for Logout */}
            {menuVisible && (
                <Modal
                    transparent={true}
                    animationType="fade"
                    visible={menuVisible}
                    onRequestClose={() => setMenuVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            <TouchableOpacity
                                style={styles.modalOption}
                                onPress={() => handleMenuOption('Logout')}
                            >
                                <Text style={styles.modalOptionText}>Logout</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalOption, styles.cancelOption]}
                                onPress={() => setMenuVisible(false)}
                            >
                                <Text style={styles.cancelOptionText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            )}

            {user.role !== 'vikarie' && (
                <>
                    <Text style={styles.title}>Select Your Role</Text>
                    {(user.role === 'fritidsledare' || user.role === 'fritidspersonal') && (
                        <>
                            <TouchableOpacity
                                style={styles.button}
                                onPress={() => navigateToDashboard('FritidsledareDashboard')}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.buttonText}>Fritidsledare</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.button}
                                onPress={() => navigateToDashboard('FritidspersonalDashboard')}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.buttonText}>Fritidspersonal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.button}
                                onPress={() => navigateToDashboard('Agenda')}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.buttonText}>Vikarie</Text>
                            </TouchableOpacity>
                        </>
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
    menuButton: {
        position: 'absolute',
        top: 40,
        left: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: '#4B0082',
        padding: 20,
        borderRadius: 10,
        width: '80%',
    },
    modalOption: {
        backgroundColor: '#FFC0CB',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
    },
    modalOptionText: {
        color: '#4B0082',
        fontWeight: 'bold',
        fontSize: 16,
    },
    cancelOption: {
        backgroundColor: '#4B0082',
    },
    cancelOptionText: {
        color: '#FFC0CB',
        fontWeight: 'bold',
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