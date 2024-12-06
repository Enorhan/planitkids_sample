import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../../../supabaseClient';

export default function AdminDashboard({ navigation }) {
    const [menuVisible, setMenuVisible] = useState(false);

    const openMenu = () => setMenuVisible(true);
    const closeMenu = () => setMenuVisible(false);

    const handleMenuOption = async (option) => {
        closeMenu();
        if (option === 'Logout') {
            try {
                const { error } = await supabase.auth.signOut();
                if (error) {
                    console.error('Logout Error:', error.message);
                    Alert.alert('Error', 'Failed to log out. Please try again.');
                } else {
                    navigation.replace('Login'); // Redirect to login page
                }
            } catch (err) {
                console.error('Unexpected Error:', err);
                Alert.alert('Error', 'Something went wrong. Please try again.');
            }
        }
    };

    return (
        <View style={styles.container}>
            {/* Three-dotted Menu Button */}
            <TouchableOpacity style={styles.menuButton} onPress={openMenu}>
                <MaterialIcons name="more-vert" size={28} color="#FFC0CB" />
            </TouchableOpacity>

            {/* Modal for Menu Options */}
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
                        <TouchableOpacity
                            style={[styles.modalOption, styles.cancelOption]}
                            onPress={closeMenu}
                        >
                            <Text style={styles.cancelOptionText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Header */}
            <Text style={styles.headerText}>Admin Dashboard</Text>

            {/* Buttons for Admin Functionalities */}
            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('ViewDashboards')}
            >
                <Text style={styles.buttonText}>View Dashboards</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Add New Users (Coming Soon)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Assign Roles (Coming Soon)</Text>
            </TouchableOpacity>
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
    menuButton: {
        position: 'absolute',
        top: 40,
        left: 16,
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 30,
        textAlign: 'center',
    },
    button: {
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