import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { supabase } from '../../supabaseClient';

export default function BusDetails({ route }) {
    const { bus } = route.params; // Get the full bus object
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchStudents = async () => {
        setLoading(true);

        try {
            console.log('Fetching students for bus_id:', bus.id);

            const { data: studentData, error } = await supabase
                .from('students')
                .select('id, name') // Ensure 'id' is included for unique keys
                .eq('bus_id', bus.id);

            if (error) {
                console.error('Error fetching students:', error);
                Alert.alert('Error', 'Unable to fetch students for this bus.');
            } else if (!studentData || studentData.length === 0) {
                console.log(`No students found for bus_id: ${bus.id}`);
                setStudents([]);
            } else {
                console.log('Fetched Students:', studentData);
                setStudents(studentData);
            }
        } catch (err) {
            console.error('Unexpected Error:', err);
            Alert.alert('Unexpected Error', 'Something went wrong while fetching students.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, [bus.id]);

    const handleStudentAction = (student) => {
        console.log(`Action for ${student.name} on ${bus.name}`);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>{bus.name} - Students</Text>
            {loading ? (
                <Text style={styles.loadingText}>Loading students...</Text>
            ) : students.length === 0 ? (
                <Text style={styles.noDataText}>No students assigned to this bus.</Text>
            ) : (
                <FlatList
                    data={students}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.card}
                            onPress={() => handleStudentAction(item)}
                        >
                            <Text style={styles.studentName}>{item.name}</Text>
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
        padding: 20,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#FFC0CB',
        textAlign: 'center',
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
    listContainer: {
        paddingBottom: 20,
    },
    card: {
        backgroundColor: '#2E004E',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    studentName: {
        fontSize: 18,
        color: '#FFC0CB',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});