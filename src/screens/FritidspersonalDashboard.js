// src/screens/FritidspersonalDashboard.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

export default function FritidspersonalDashboard() {
    const navigation = useNavigation();
    const [menuVisible, setMenuVisible] = useState(false);

    // Open and close the menu
    const openMenu = () => setMenuVisible(true);
    const closeMenu = () => setMenuVisible(false);

    // Handle menu options
    const handleMenuOption = (option) => {
        closeMenu();
        if (option === "Logout") {
            navigation.navigate("Login");
        } else if (option === "RoleSelection") {
            navigation.navigate("RoleSelection");
        }
    };

    return (
        <View style={styles.container}>
            {/* Menu Button */}
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
                            onPress={() => handleMenuOption("Logout")}
                        >
                            <Text style={styles.modalOptionText}>Logout</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.modalOption}
                            onPress={() => handleMenuOption("RoleSelection")}
                        >
                            <Text style={styles.modalOptionText}>Go to Role Selection</Text>
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

            {/* Navigation Options */}
            <TouchableOpacity
                style={styles.optionButton}
                onPress={() => navigation.navigate('DailyActivities')}
                activeOpacity={0.8}
            >
                <Text style={styles.buttonText}>Today's Activities</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.optionButton}
                onPress={() => navigation.navigate('MyGroup')}
                activeOpacity={0.8}
            >
                <Text style={styles.buttonText}>Edit Groups</Text>
            </TouchableOpacity>

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
    menuButton: {
        position: 'absolute',
        top: 40,
        left: 16,
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