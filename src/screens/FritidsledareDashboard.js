import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../../supabaseClient';

export default function FritidsledareDashboard() {
    const navigation = useNavigation();
    const [menuVisible, setMenuVisible] = useState(false);
    const [role, setRole] = useState(null);

    // Fetch user role from Supabase
    useEffect(() => {
        const fetchUserRole = async () => {
            try {
                const { data: user, error } = await supabase.auth.getUser();
                if (error) {
                    console.error('Error fetching user:', error.message);
                    Alert.alert('Error', 'Unable to fetch user data.');
                    return;
                }

                const { data, error: roleError } = await supabase
                    .from('users') // Assuming a `users` table exists
                    .select('role')
                    .eq('id', user?.user?.id) // Use the authenticated user's ID
                    .single();

                if (roleError) {
                    console.error('Error fetching role:', roleError.message);
                    Alert.alert('Error', 'Unable to fetch user role.');
                } else {
                    console.log('Fetched Role:', data.role); // Debugging
                    setRole(data.role);
                }
            } catch (err) {
                console.error('Unexpected Error:', err);
                Alert.alert('Error', 'Something went wrong while fetching user role.');
            }
        };

        fetchUserRole();
    }, []);

    const openMenu = () => setMenuVisible(true);
    const closeMenu = () => setMenuVisible(false);

    const handleMenuOption = (option) => {
        closeMenu();
        if (option === 'Logout') {
            navigation.navigate('Login');
        } else if (option === 'RoleSelection') {
            navigation.navigate('RoleSelection');
        } else if (option === 'AdminDashboard') {
            navigation.navigate('AdminDashboard');
        }
    };

    return (
        <View style={styles.container}>
            {/* Display fetched role for debugging */}
            {role && (
                <Text style={styles.debugText}>Current Role: {role}</Text>
            )}

            {/* Three-dotted Menu Button */}
            <TouchableOpacity style={styles.menuButton} onPress={openMenu}>
                <MaterialIcons name="more-vert" size={28} color="#FFC0CB" />
            </TouchableOpacity>

            {/* Custom Modal for Menu Options */}
            <Modal
                transparent={true}
                animationType="fade"
                visible={menuVisible}
                onRequestClose={closeMenu}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <TouchableOpacity
                            style={styles.modalOption}
                            onPress={() => handleMenuOption('Logout')}
                        >
                            <Text style={styles.modalOptionText}>Logout</Text>
                        </TouchableOpacity>
                        {(role === 'fritidspersonal' || role === 'fritidsledare') && (
                            <TouchableOpacity
                                style={styles.modalOption}
                                onPress={() => handleMenuOption('RoleSelection')}
                            >
                                <Text style={styles.modalOptionText}>Go to Role Selection</Text>
                            </TouchableOpacity>
                        )}
                        {role === 'admin' && (
                            <TouchableOpacity
                                style={styles.modalOption}
                                onPress={() => handleMenuOption('AdminDashboard')}
                            >
                                <Text style={styles.modalOptionText}>Go to Admin Dashboard</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={[styles.modalOption, styles.cancelOption]}
                            onPress={closeMenu}
                        >
                            <Text style={styles.cancelOptionText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Navigation Options */}
            <TouchableOpacity
                style={styles.optionButton}
                onPress={() => navigation.navigate('WhatsToday')}
                activeOpacity={0.8}
            >
                <Text style={styles.buttonText}>Activity Planner</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.optionButton}
                onPress={() => navigation.navigate('MyGroup')}
                activeOpacity={0.8}
            >
                <Text style={styles.buttonText}>Edit Groups</Text>
            </TouchableOpacity>

            {/* New Button for Tracking Colleagues' Groups */}
            <TouchableOpacity
                style={styles.optionButton}
                onPress={() => navigation.navigate('TrackColleaguesGroups')}
                activeOpacity={0.8}
            >
                <Text style={styles.buttonText}>All Groups</Text>
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
    debugText: {
        color: '#FFC0CB',
        fontSize: 16,
        marginBottom: 10,
    },
    menuButton: {
        position: 'absolute',
        top: 40,
        left: 16,
    },
    optionButton: {
        backgroundColor: '#FFC0CB', // Sticker-like pastel color
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 50, // Rounded edges for sticker shape
        marginVertical: 10,
        width: '80%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5, // For Android shadow
        borderWidth: 2,
        borderColor: '#FF69B4', // Contrasting border
    },
    buttonText: {
        color: '#4B0082',
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'Poppins_600SemiBold', // Choose a playful font if available
        textShadowColor: '#FFB6C1', // Subtle shadow for text
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: '#4B0082',
        width: '80%',
        borderRadius: 10,
        padding: 20,
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
});