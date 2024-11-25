import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { supabase } from '../../supabaseClient';

export default function ParentDashboard() {
    const [childStatus, setChildStatus] = useState(''); // Current status
    const [loading, setLoading] = useState(true);

    // Fetch child's current status
    const fetchChildStatus = async () => {
        setLoading(true);

        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('status')
                .eq('student_id', 'child-id') // Replace with actual child ID
                .order('created_at', { ascending: false }) // Get latest status
                .limit(1);

            if (error) throw error;

            if (data.length > 0) {
                setChildStatus(data[0].status);
            } else {
                setChildStatus(''); // Default if no status
            }
        } catch (err) {
            console.error('Error fetching child status:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChildStatus();
    }, []);

    // Map statuses to icons and labels
    const statuses = [
        { id: 'picked_up', label: 'Picked Up', icon: require('assets/picked_up.png') },
        { id: 'arrived', label: 'Arrived at School', icon: require('assets/arrived.png') },
        { id: 'departed', label: 'Bus Departed', icon: require('assets/departed.png') },
        { id: 'dropped_off', label: 'Dropped Off', icon: require('assets/dropped_off.png') },
    ];

    if (loading) return <Text>Loading...</Text>;

    return (
        <View style={styles.container}>
            {statuses.map((status) => (
                <View
                    key={status.id}
                    style={[
                        styles.statusBlock,
                        childStatus === status.id ? styles.activeStatus : styles.inactiveStatus,
                    ]}
                >
                    <Image source={status.icon} style={styles.icon} />
                    <Text style={styles.label}>{status.label}</Text>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F7F7',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    statusBlock: {
        width: 150,
        height: 150,
        margin: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        backgroundColor: '#DDD',
    },
    activeStatus: {
        backgroundColor: '#FFD700', // Highlight active status
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    inactiveStatus: {
        backgroundColor: '#CCC',
    },
    icon: {
        width: 80,
        height: 80,
        marginBottom: 10,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});