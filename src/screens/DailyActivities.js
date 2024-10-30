// src/screens/DailyActivities.js
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function DailyActivities({ navigation }) {
    const [activities] = useState([
        { activityType: "Pyssel", fromTime: "09:00", toTime: "10:00", where: "Room 101", profilePictures: [null, null, null] },
    ]);

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <MaterialIcons name="arrow-back" size={24} color="#FFC0CB" />
            </TouchableOpacity>

            <Text style={styles.title}>Daily Activities (Read Only)</Text>

            {activities.map((activity, index) => (
                <View key={index} style={styles.activityContainer}>
                    {/* Activity Type - Static Text */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Activity Type:</Text>
                        <Text style={styles.readOnlyText}>{activity.activityType}</Text>
                    </View>

                    {/* Location - Static Text */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Where:</Text>
                        <Text style={styles.readOnlyText}>{activity.where}</Text>
                    </View>

                    {/* Time - Static Text */}
                    <View style={styles.timeRow}>
                        <Text style={styles.label}>From:</Text>
                        <Text style={styles.readOnlyText}>{activity.fromTime}</Text>
                        <Text style={styles.label}>To:</Text>
                        <Text style={styles.readOnlyText}>{activity.toTime}</Text>
                    </View>

                    {/* Activity Details - Static Text */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Activity Details:</Text>
                        <Text style={styles.readOnlyText}>Some details about the activity...</Text>
                    </View>

                    {/* Profile Pictures - Static Display */}
                    <View style={styles.profileIconsContainer}>
                        <Text style={styles.assignLabel}>Assigned Teachers:</Text>
                        <View style={styles.profileIcons}>
                            {activity.profilePictures.map((profile, i) => (
                                <Image
                                    key={i}
                                    style={styles.profileIconExtraLarge}
                                    source={{ uri: profile || 'https://via.placeholder.com/80?text=+' }}
                                />
                            ))}
                        </View>
                    </View>
                </View>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        padding: 16,
        backgroundColor: '#4B0082',
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
        marginTop: 70,
        marginBottom: 20,
    },
    activityContainer: {
        backgroundColor: '#2E004E',
        borderRadius: 10,
        padding: 16,
        marginBottom: 20,
        width: '100%',
    },
    inputContainer: {
        marginBottom: 10,
    },
    label: {
        color: '#FFC0CB',
        fontSize: 16,
        fontWeight: 'bold',
    },
    readOnlyText: {
        color: '#FFC0CB',
        fontSize: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: 8,
        borderRadius: 8,
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    profileIconsContainer: {
        alignItems: 'flex-start',
        marginTop: 10,
    },
    assignLabel: {
        color: '#FFC0CB',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    profileIcons: {
        flexDirection: 'row',
    },
    profileIconExtraLarge: {
        width: 70,
        height: 70,
        borderRadius: 35,
        marginRight: 10,
        borderColor: '#FFC0CB',
        borderWidth: 1,
    },
});