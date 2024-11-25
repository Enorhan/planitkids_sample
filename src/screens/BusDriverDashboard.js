import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { supabase } from '../../supabaseClient';

export default function BusDriverDashboard({ route, navigation }) {
    const [buses, setBuses] = useState([]);
    const [loading, setLoading] = useState(false);

    const { user } = route.params || {};
    const driverId = user?.id; // Use `user.id` passed from route.params
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
                .eq('driver_id', driverId); // Filter buses by driver ID

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

    useEffect(() => {
        fetchBuses();
    }, [driverId]);

    const handleBusAction = (bus) => {
        navigation.navigate('BusDetails', { bus });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome, Bus Driver!</Text>
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