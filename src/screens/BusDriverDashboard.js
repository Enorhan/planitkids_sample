import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { supabase } from '../../supabaseClient';
import { Menu, MenuTrigger, MenuOptions, MenuOption } from 'react-native-popup-menu';

export default function BusDriverDashboard({ route, navigation }) {
    const [buses, setBuses] = useState([]);
    const [loading, setLoading] = useState(false);

    const { user } = route.params || {};
    const driverId = user?.id;
    const schoolId = user?.school_id;

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
            console.log('Fetching buses for Driver ID:', driverId);

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
                console.log('Fetched Buses Data:', busesData);
                setBuses(busesData);
            }
        } catch (err) {
            console.error('Unexpected Error:', err);
            Alert.alert('Unexpected Error', 'Something went wrong while fetching buses.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Logout Error:', error.message);
            Alert.alert('Error', 'Failed to log out. Please try again.');
        } else {
            navigation.replace('Login'); // Redirect to login page
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
            <View style={styles.header}>
                <Menu>
                    <MenuTrigger style={styles.menuTrigger}>
                        <Text style={styles.menuText}>⋮</Text>
                    </MenuTrigger>
                    <MenuOptions>
                        <MenuOption onSelect={handleLogout}>
                            <Text style={styles.menuOptionText}>Logout</Text>
                        </MenuOption>
                    </MenuOptions>
                </Menu>
            </View>
            <Text style={styles.title}>Welcome, {user?.first_name}!</Text>
            <Text style={styles.subHeader}>Select Your Bus:</Text>
            {loading ? (
                <Text style={styles.loadingText}>Loading buses...</Text>
            ) : buses.length === 0 ? (
                <Text style={styles.noDataText}>No buses assigned to you.</Text>
            ) : (
                <FlatList
                    contentContainerStyle={styles.scrollContainer}
                    data={buses}
                    keyExtractor={(item) => item.id}
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
        backgroundColor: '#4B0082',
    },
    header: {
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 1,
    },
    menuTrigger: {
        padding: 10,
    },
    menuText: {
        fontSize: 24,
        color: '#FFC0CB',
        fontWeight: 'bold',
    },
    menuOptionText: {
        fontSize: 16,
        color: '#000',
        padding: 10,
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
});