import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import { supabase } from '../../supabaseClient';
import { MaterialIcons } from '@expo/vector-icons';

export default function BusDriverDashboard({ route, navigation }) {
    const [buses, setBuses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);

    const { user } = route.params || {};
    const driverId = user?.id;

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

    const fetchBuses = async () => {
        if (!driverId) {
            console.error('Driver ID not found in route params.');
            Alert.alert('Error', 'Invalid user session. Please log in again.');
            setBuses([]);
            setLoading(false);
            return;
        }

        setLoading(true);

        try {
            const { data: busesData, error } = await supabase
                .from('buses')
                .select('id, name')
                .eq('driver_id', driverId);

            if (error) {
                console.error('Supabase Fetch Error:', error);
                Alert.alert('Error', 'Unable to fetch bus data. Please try again later.');
                setBuses([]);
            } else if (!busesData || busesData.length === 0) {
                console.log('No buses found for Driver ID:', driverId);
                setBuses([]);
            } else {
                setBuses(busesData);
            }
        } catch (err) {
            console.error('Unexpected Error:', err);
            Alert.alert('Unexpected Error', 'Something went wrong while fetching buses.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBuses();
    }, [driverId]);

    const handleBusAction = (bus) => {
        navigation.navigate('BusDetails', { bus });
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

            {/* Header and List */}
            <Text style={styles.title}>Welcome, {user?.first_name || 'Driver'}!</Text>
            <Text style={styles.subHeader}>Select Your Bus:</Text>
            {loading ? (
                <Text style={styles.loadingText}>Loading buses...</Text>
            ) : buses.length === 0 ? (
                <Text style={styles.noDataText}>No buses assigned to you.</Text>
            ) : (
                <FlatList
                    contentContainerStyle={styles.scrollContainer}
                    data={buses}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.activityCard}
                            onPress={() => handleBusAction(item)}
                        >
                            <Text style={styles.activityType}>{item.name}</Text>
                        </TouchableOpacity>
                    )}
                />
            )}
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
    title: {
        fontSize: 24,
        color: '#FFC0CB',
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 70,
        marginBottom: 20,
    },
    subHeader: {
        fontSize: 18,
        color: '#FFC0CB',
        textAlign: 'center',
        marginBottom: 20,
    },
    loadingText: {
        fontSize: 16,
        color: '#FFC0CB',
        textAlign: 'center',
        marginTop: 20,
    },
    noDataText: {
        fontSize: 16,
        color: '#FFC0CB',
        textAlign: 'center',
        marginTop: 20,
    },
    scrollContainer: {
        flexGrow: 1,
        alignItems: 'center',
        paddingVertical: 20,
    },
    activityCard: {
        backgroundColor: '#2E004E',
        borderRadius: 10,
        padding: 16,
        marginBottom: 20,
        width: '90%',
    },
    activityType: {
        color: '#FFC0CB',
        fontWeight: 'bold',
        fontSize: 18,
        textAlign: 'center',
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