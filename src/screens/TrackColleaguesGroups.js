// src/screens/TrackColleaguesGroups.js
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function TrackColleaguesGroups({ navigation }) { // Use navigation prop directly
    const [expandedGroup, setExpandedGroup] = useState(null);

    // Sample data of colleagues with student details
    const colleagues = [
        {
            email: "enes@northbyschool.com",
            students: [
                { firstName: "Student", lastName: "A", class: "Class 1" },
                { firstName: "Student", lastName: "B", class: "Class 1" },
                { firstName: "Student", lastName: "C", class: "Class 2" },
            ]
        },
        {
            email: "sara@northbyschool.com",
            students: [
                { firstName: "Student", lastName: "D", class: "Class 3" },
                { firstName: "Student", lastName: "E", class: "Class 4" },
            ]
        },
        {
            email: "leo@northbyschool.com",
            students: [
                { firstName: "Student", lastName: "F", class: "Class 2" },
                { firstName: "Student", lastName: "G", class: "Class 5" },
            ]
        },
    ];

    // Extract name from email
    const getGroupName = (email) => {
        const name = email.split("@")[0];
        return `${name.charAt(0).toUpperCase() + name.slice(1)}'s group`;
    };

    // Toggle expanded group
    const toggleGroup = (index) => {
        setExpandedGroup(expandedGroup === index ? null : index);
    };

    return (
        <View style={styles.container}>
            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <MaterialIcons name="arrow-back" size={24} color="#FFC0CB" />
            </TouchableOpacity>

            <Text style={styles.title}>Colleagues' Groups</Text>

            {/* List of Groups */}
            <ScrollView contentContainerStyle={styles.groupList}>
                {colleagues.map((colleague, index) => (
                    <View key={index} style={styles.groupContainer}>
                        <TouchableOpacity onPress={() => toggleGroup(index)} style={styles.groupButton}>
                            <Text style={styles.groupText}>{getGroupName(colleague.email)}</Text>
                        </TouchableOpacity>

                        {/* Show group details if expanded */}
                        {expandedGroup === index && (
                            <View style={styles.detailsContainer}>
                                {colleague.students.map((student, i) => (
                                    <Text key={i} style={styles.memberText}>
                                        {student.firstName} {student.lastName} - {student.class}
                                    </Text>
                                ))}
                            </View>
                        )}
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#4B0082',
        padding: 16,
        alignItems: 'center',
    },
    backButton: {
        position: 'absolute',
        top: 40,
        left: 16,
    },
    title: {
        fontSize: 24,
        color: '#FFC0CB',
        fontWeight: 'bold',
        marginBottom: 20,
    },
    groupList: {
        width: '100%',
        alignItems: 'center',
    },
    groupContainer: {
        backgroundColor: '#FFC0CB',
        padding: 15,
        borderRadius: 8,
        marginVertical: 10,
        width: '100%',
        alignItems: 'center',
    },
    groupButton: {
        width: '100%',
        alignItems: 'center',
    },
    groupText: {
        color: '#4B0082',
        fontWeight: 'bold',
        fontSize: 16,
    },
    detailsContainer: {
        marginTop: 10,
        width: '100%',
        paddingHorizontal: 10,
    },
    memberText: {
        color: '#4B0082',
        fontSize: 14,
        textAlign: 'left',
    },
});