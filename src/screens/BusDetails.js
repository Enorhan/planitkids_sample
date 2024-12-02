import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Modal, Pressable } from 'react-native';
import { supabase } from '../../supabaseClient';
import { Ionicons } from '@expo/vector-icons';

export default function BusDetails({ route, navigation }) {
    const { bus } = route.params;
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    const fetchStudents = async () => {
        setLoading(true);

        try {
            const { data: studentData, error } = await supabase
                .from('students')
                .select('id, name') // Keep the original fetching logic
                .eq('bus_id', bus.id);

            if (error) {
                console.error('Error fetching students:', error);
                Alert.alert('Error', 'Unable to fetch students for this bus.');
            } else {
                setStudents(studentData || []);
            }
        } catch (err) {
            console.error('Unexpected Error:', err);
            Alert.alert('Unexpected Error', 'Something went wrong while fetching students.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents(); // Fetch data when the component mounts
    }, [bus.id]);

    const sendNotification = async (studentId, status) => {
        const messageMap = {
            picked_up: 'Your child has been picked up.',
            arrived: 'Your child has arrived at school.',
            departed: 'The school bus has departed.',
            dropped_off: 'Your child has been dropped off at home.',
        };

        try {
            const { data, error } = await supabase
                .from('notifications')
                .insert({
                    student_id: studentId,
                    status,
                    message: messageMap[status],
                });

            if (error) {
                console.error('Error sending notification:', error);
                Alert.alert('Error', 'Failed to send notification.');
            } else {
                Alert.alert('Success', `Notification sent: ${messageMap[status]}`);
                fetchStudents(); // Refresh the list to show updated data
            }
        } catch (err) {
            console.error('Unexpected Error:', err);
            Alert.alert('Error', 'Something went wrong while sending the notification.');
        }
    };

    const handleQuickAction = async (student, action) => {
        await sendNotification(student.id, action);
    };

    const openActionModal = (student) => {
        setSelectedStudent(student);
        setModalVisible(true);
    };

    const handleModalAction = async (action) => {
        if (selectedStudent) {
            await sendNotification(selectedStudent.id, action);
        }
        setModalVisible(false);
    };

    return (
        <View style={styles.container}>
            {/* Custom Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color="#FFC0CB" />
                <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>

            <Text style={styles.header}>{bus.name} - Students</Text>
            {loading ? (
                <Text style={styles.loadingText}>Loading students...</Text>
            ) : students.length === 0 ? (
                <Text style={styles.noDataText}>No students assigned to this bus.</Text>
            ) : (
                <FlatList
                    data={students}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <Text style={styles.studentName}>{item.name}</Text>
                            <View style={styles.actionButtons}>
                                <TouchableOpacity
                                    style={styles.quickActionButton}
                                    onPress={() => handleQuickAction(item, 'picked_up')}
                                >
                                    <Text style={styles.actionButtonText}>Picked Up</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.moreOptionsButton}
                                    onPress={() => openActionModal(item)}
                                >
                                    <Text style={styles.actionButtonText}>More</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            )}

            {/* Modal for More Actions */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Action for {selectedStudent?.name}</Text>
                        {['picked_up', 'arrived', 'departed', 'dropped_off'].map((action) => (
                            <TouchableOpacity
                                key={action}
                                style={styles.modalActionButton}
                                onPress={() => handleModalAction(action)}
                            >
                                <Text style={styles.modalActionText}>{action.replace('_', ' ')}</Text>
                            </TouchableOpacity>
                        ))}
                        <Pressable style={styles.closeButton} onPress={() => setModalVisible(false)}>
                            <Text style={styles.closeButtonText}>Cancel</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#4B0082',
        padding: 20,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    backText: {
        fontSize: 16,
        color: '#FFC0CB',
        marginLeft: 5,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
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
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 10,
    },
    quickActionButton: {
        backgroundColor: '#FFC0CB',
        padding: 10,
        borderRadius: 5,
        marginHorizontal: 5,
    },
    moreOptionsButton: {
        backgroundColor: '#FFA500',
        padding: 10,
        borderRadius: 5,
        marginHorizontal: 5,
    },
    actionButtonText: {
        color: '#4B0082',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 10,
        width: '80%',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    modalActionButton: {
        backgroundColor: '#4B0082',
        padding: 10,
        borderRadius: 5,
        marginVertical: 5,
        width: '100%',
        alignItems: 'center',
    },
    modalActionText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    closeButton: {
        marginTop: 15,
        backgroundColor: '#FFC0CB',
        padding: 10,
        borderRadius: 5,
    },
    closeButtonText: {
        color: '#4B0082',
        fontWeight: 'bold',
    },
});