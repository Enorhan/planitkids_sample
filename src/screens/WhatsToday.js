// src/screens/WhatsToday.js
import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';

export default function WhatsToday() {
    const activityOptions = ["Pyssel", "Utomhus", "Film", "Tema Arbete", "Bakning"];

    // State to hold all activities
    const [activities, setActivities] = useState([
        { activityType: "Pyssel", fromTime: "", toTime: "", where: "", profilePictures: [null, null, null] }
    ]);

    // Function to add a new activity template
    const addActivity = () => {
        setActivities([...activities, { activityType: "Pussel", fromTime: "", toTime: "", where: "", profilePictures: [null, null, null] }]);
    };

    // Update a specific field for an activity
    const updateActivity = (index, field, value) => {
        const newActivities = [...activities];
        newActivities[index][field] = value;
        setActivities(newActivities);
    };

    // Handle auto-formatting for time input
    const handleTimeChange = (text, index, field) => {
        const formatted = text.replace(/[^0-9]/g, ''); // Remove non-numeric characters
        if (formatted.length <= 2) {
            updateActivity(index, field, formatted);
        } else if (formatted.length <= 4) {
            updateActivity(index, field, `${formatted.slice(0, 2)}:${formatted.slice(2)}`);
        }
    };

    // Handle profile selection for each activity
    const handleProfileSelect = (activityIndex, profileIndex) => {
        Alert.alert(
            "Assign Teacher",
            "Choose a teacher to assign",
            [
                { text: "Teacher A", onPress: () => assignProfile(activityIndex, profileIndex, "https://via.placeholder.com/60") },
                { text: "Teacher B", onPress: () => assignProfile(activityIndex, profileIndex, "https://via.placeholder.com/60") },
                { text: "Teacher C", onPress: () => assignProfile(activityIndex, profileIndex, "https://via.placeholder.com/60") },
            ],
            { cancelable: true }
        );
    };

    const assignProfile = (activityIndex, profileIndex, imageUrl) => {
        const newActivities = [...activities];
        newActivities[activityIndex].profilePictures[profileIndex] = imageUrl;
        setActivities(newActivities);
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <Text style={styles.title}>What's Today (Fritidspersonal)</Text>

            {activities.map((activity, index) => (
                <View key={index} style={styles.activityContainer}>
                    {/* Activity Dropdown */}
                    <Picker
                        selectedValue={activity.activityType}
                        style={[styles.picker, { color: '#FFC0CB' }]}
                        onValueChange={(itemValue) => updateActivity(index, 'activityType', itemValue)}
                    >
                        {activityOptions.map((option) => (
                            <Picker.Item label={option} value={option} key={option} color="#FFC0CB" />
                        ))}
                    </Picker>

                    {/* Where Input */}
                    <TextInput
                        style={styles.input}
                        placeholder="Where"
                        placeholderTextColor="#FFC0CB"
                        value={activity.where}
                        onChangeText={(text) => updateActivity(index, 'where', text)}
                    />

                    {/* Time Input */}
                    <View style={styles.timeRow}>
                        <Text style={styles.label}>From</Text>
                        <TextInput
                            style={styles.timeInput}
                            placeholder="HH:MM"
                            placeholderTextColor="#FFC0CB"
                            keyboardType="numeric"
                            value={activity.fromTime}
                            onChangeText={(text) => handleTimeChange(text, index, 'fromTime')}
                        />
                        <Text style={styles.label}>To</Text>
                        <TextInput
                            style={styles.timeInput}
                            placeholder="HH:MM"
                            placeholderTextColor="#FFC0CB"
                            keyboardType="numeric"
                            value={activity.toTime}
                            onChangeText={(text) => handleTimeChange(text, index, 'toTime')}
                        />
                    </View>

                    {/* Activity Details */}
                    <TextInput
                        style={styles.detailsInput}
                        placeholder="Activity details/explanation"
                        placeholderTextColor="#FFC0CB"
                        multiline
                    />

                    {/* Profile Pictures with Visible Placeholders */}
                    <View style={styles.profileIconsContainer}>
                        <Text style={styles.assignLabel}>Assigned Teachers:</Text>
                        <View style={styles.profileIcons}>
                            {activity.profilePictures.map((profile, i) => (
                                <TouchableOpacity key={i} onPress={() => handleProfileSelect(index, i)}>
                                    <Image
                                        style={styles.profileIconExtraLarge}
                                        source={{ uri: profile || 'https://via.placeholder.com/80?text=+' }}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>
            ))}

            {/* Add Activity Button */}
            <TouchableOpacity style={styles.addButton} onPress={addActivity}>
                <Text style={styles.addButtonText}>+ Add Activity</Text>
            </TouchableOpacity>
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
    title: {
        fontSize: 24,
        color: '#FFC0CB',
        fontWeight: 'bold',
        marginBottom: 20,
    },
    activityContainer: {
        backgroundColor: '#2E004E',
        borderRadius: 10,
        padding: 16,
        marginBottom: 20,
        width: '100%',
    },
    picker: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginBottom: 10,
    },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        color: '#FFC0CB',
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    label: {
        color: '#FFC0CB',
        marginRight: 5,
    },
    timeInput: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        color: '#FFC0CB',
        borderRadius: 8,
        padding: 10,
        width: 60,
        marginRight: 10,
        textAlign: 'center',
    },
    detailsInput: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        color: '#FFC0CB',
        borderRadius: 8,
        padding: 10,
        textAlignVertical: 'top',
        height: 80,
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
    addButton: {
        backgroundColor: '#FFC0CB',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
        width: '80%',
    },
    addButtonText: {
        color: '#4B0082',
        fontWeight: 'bold',
        fontSize: 16,
    },
});