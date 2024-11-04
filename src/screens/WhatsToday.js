// src/screens/WhatsToday.js
import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Image, Alert, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons } from '@expo/vector-icons';

export default function WhatsToday({ navigation }) {
    const activityOptions = ["Pyssel", "Utomhus", "Film", "Tema Arbete", "Bakning"];
    const [activities, setActivities] = useState([
        { activityType: "Pyssel", fromTime: "", toTime: "", where: "", profilePictures: [null, null, null], description: "", photos: [] }
    ]);
    const [selectedActivityIndex, setSelectedActivityIndex] = useState(null);

    const addActivity = () => {
        setActivities([...activities, { activityType: "Pyssel", fromTime: "", toTime: "", where: "", profilePictures: [null, null, null], description: "", photos: [] }]);
    };

    const removeActivity = (index) => {
        const updatedActivities = activities.filter((_, i) => i !== index);
        setActivities(updatedActivities);
    };

    const updateActivity = (index, field, value) => {
        const newActivities = [...activities];
        newActivities[index][field] = value;
        setActivities(newActivities);
    };

    const handleTimeChange = (text, index, field) => {
        const formatted = text.replace(/[^0-9]/g, '');
        if (formatted.length <= 2) {
            updateActivity(index, field, formatted);
        } else if (formatted.length <= 4) {
            updateActivity(index, field, `${formatted.slice(0, 2)}:${formatted.slice(2)}`);
        }
    };

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

    const attachPhoto = (index) => {
        const randomImageUrl = `https://picsum.photos/200?random=${Math.floor(Math.random() * 1000)}`;
        const newActivities = [...activities];
        const currentPhotos = newActivities[index].photos || [];
        newActivities[index].photos = [...currentPhotos, randomImageUrl];
        setActivities(newActivities);
    };

    const removePhoto = (activityIndex, photoIndex) => {
        const newActivities = [...activities];
        newActivities[activityIndex].photos.splice(photoIndex, 1);
        setActivities(newActivities);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <MaterialIcons name="arrow-back" size={24} color="#FFC0CB" />
            </TouchableOpacity>

            <Text style={styles.title}>What's Today (Fritidspersonal)</Text>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {activities.map((activity, index) => (
                    <View key={index} style={styles.activityCard}>
                        <Picker
                            selectedValue={activity.activityType}
                            style={styles.picker}
                            onValueChange={(itemValue) => updateActivity(index, 'activityType', itemValue)}
                        >
                            {activityOptions.map((option) => (
                                <Picker.Item label={option} value={option} key={option} color="#FFC0CB" />
                            ))}
                        </Picker>

                        <View style={styles.timeLocationContainer}>
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

                            <TextInput
                                style={styles.locationInput}
                                placeholder="Where"
                                placeholderTextColor="#FFC0CB"
                                value={activity.where}
                                onChangeText={(text) => updateActivity(index, 'where', text)}
                            />
                        </View>

                        <TouchableOpacity onPress={() => setSelectedActivityIndex(index)}>
                            <Text style={styles.descriptionText}>{activity.description || "Tap to add description"}</Text>
                        </TouchableOpacity>

                        <View style={styles.profileIconsContainer}>
                            <Text style={styles.assignLabel}>Assigned Teachers:</Text>
                            <View style={styles.profileIcons}>
                                {activity.profilePictures.map((profile, i) => (
                                    <TouchableOpacity key={i} onPress={() => handleProfileSelect(index, i)}>
                                        <Image
                                            style={styles.profileIcon}
                                            source={{ uri: profile || 'https://via.placeholder.com/70?text=+' }}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <TouchableOpacity style={styles.removeButton} onPress={() => removeActivity(index)}>
                            <Text style={styles.removeButtonText}>Remove Activity</Text>
                        </TouchableOpacity>
                    </View>
                ))}

                <TouchableOpacity style={styles.addButton} onPress={addActivity}>
                    <Text style={styles.addButtonText}>+ Add Activity</Text>
                </TouchableOpacity>
            </ScrollView>

            {selectedActivityIndex !== null && (
                <Modal visible={true} transparent={true} animationType="slide">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Edit Description</Text>
                            <TextInput
                                style={styles.modalDescriptionInput}
                                placeholder="Activity details/explanation"
                                placeholderTextColor="#FFC0CB"
                                multiline
                                value={activities[selectedActivityIndex].description}
                                onChangeText={(text) => updateActivity(selectedActivityIndex, 'description', text)}
                            />

                            {/* Display the attached photos if they exist */}
                            {activities[selectedActivityIndex].photos && activities[selectedActivityIndex].photos.map((photo, i) => (
                                <View key={i} style={styles.photoContainer}>
                                    <Image source={{ uri: photo }} style={styles.attachedPhoto} />
                                    <TouchableOpacity style={styles.removePhotoButton} onPress={() => removePhoto(selectedActivityIndex, i)}>
                                        <Text style={styles.removePhotoButtonText}>Remove Photo</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}

                            <TouchableOpacity style={styles.attachPhotoButton} onPress={() => attachPhoto(selectedActivityIndex)}>
                                <Text style={styles.attachPhotoButtonText}>Attach Photo</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedActivityIndex(null)}>
                                <Text style={styles.closeButtonText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#4B0082',
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
        textAlign: 'center',
        marginTop: 70,
        marginBottom: 20,
    },
    scrollContainer: {
        flexGrow: 1,
        alignItems: 'center',
    },
    activityCard: {
        backgroundColor: '#2E004E',
        borderRadius: 10,
        padding: 16,
        marginBottom: 20,
        width: '90%',
    },
    picker: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginBottom: 10,
    },
    timeLocationContainer: {
        flexDirection: 'column',
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
    locationInput: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        color: '#FFC0CB',
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
    },
    descriptionText: {
        color: '#FFC0CB',
        padding: 10,
        marginBottom: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 8,
        textAlign: 'center',
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
    profileIcon: {
        width: 70,
        height: 70,
        borderRadius: 35,
        marginRight: 10,
        borderColor: '#FFC0CB',
        borderWidth: 1,
    },
    removeButton: {
        backgroundColor: '#FF8C8C',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    removeButtonText: {
        color: '#4B0082',
        fontWeight: 'bold',
        fontSize: 16,
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#4B0082',
        padding: 20,
        borderRadius: 10,
        width: '90%',
    },
    modalTitle: {
        color: '#FFC0CB',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    modalDescriptionInput: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        color: '#FFC0CB',
        borderRadius: 8,
        padding: 10,
        height: 200,
        textAlignVertical: 'top',
        marginBottom: 10,
    },
    attachedPhoto: {
        width: '100%',
        height: 150,
        marginTop: 10,
        borderRadius: 8,
    },
    photoContainer: {
        alignItems: 'center',
        marginBottom: 10,
    },
    attachPhotoButton: {
        backgroundColor: '#FFC0CB',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    attachPhotoButtonText: {
        color: '#4B0082',
        fontWeight: 'bold',
        fontSize: 16,
    },
    removePhotoButton: {
        backgroundColor: '#FF8C8C',
        padding: 5,
        borderRadius: 5,
        marginTop: 5,
    },
    removePhotoButtonText: {
        color: '#4B0082',
        fontWeight: 'bold',
        fontSize: 14,
    },
    closeButton: {
        backgroundColor: '#FF8C8C',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    closeButtonText: {
        color: '#4B0082',
        fontWeight: 'bold',
        fontSize: 16,
    },
});