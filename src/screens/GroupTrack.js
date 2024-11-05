// src/screens/GroupTrack.js
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function GroupTrack({ navigation }) {
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

    const getGroupName = (email) => {
        const name = email.split("@")[0];
        return `${name.charAt(0).toUpperCase() + name.slice(1)}'s group`;
    };

    const toggleGroup = (index) => {
        setExpandedGroup(expandedGroup === index ? null : index);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Today's Groups</Text>

            <ScrollView contentContainerStyle={styles.groupList}>
                {colleagues.map((colleague, index) => (
                    <View key={index} style={styles.groupContainer}>
                        <TouchableOpacity onPress={() => toggleGroup(index)} style={styles.groupButton}>
                            <Text style={styles.groupText}>{getGroupName(colleague.email)}</Text>
                        </TouchableOpacity>

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

            <View style={styles.footer}>
                <View style={styles.speechBubble}>
                    <Text style={styles.speechText}>Done spying? I'll take you back</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('Agenda')}>
                    <Image
                        source={require('../../assets/freepik__background__24274.png')} // Use require here
                        style={styles.pandaIcon}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#4B0082',
        padding: 16,
    },
    title: {
        fontSize: 28,
        color: '#FFC0CB',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    groupList: {
        width: '100%',
        alignItems: 'center',
        paddingBottom: 100,
    },
    groupContainer: {
        backgroundColor: '#FFC0CB',
        padding: 18,
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
        fontSize: 18,
    },
    detailsContainer: {
        marginTop: 10,
        width: '100%',
        paddingHorizontal: 10,
    },
    memberText: {
        color: '#4B0082',
        fontSize: 16,
        textAlign: 'left',
    },
    footer: {
        position: 'absolute',
        bottom: 10,
        width: '100%',
        alignItems: 'center',
    },
    speechBubble: {
        backgroundColor: '#FFC0CB',
        padding: 10,
        borderRadius: 8,
        marginBottom: 5,
        maxWidth: 250,
    },
    speechText: {
        color: '#4B0082',
        fontWeight: 'bold',
        fontSize: 14,
        textAlign: 'center',
    },
    pandaIcon: {
        width: 250,
        height: 250,
    },
});