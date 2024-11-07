// src/screens/CalendarPage.js
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Image,
    Modal,
    FlatList,
    TouchableWithoutFeedback,
    Keyboard, Button,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useOccasions } from '../context/OccasionsContext';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';

export default function CalendarPage() {
    const { occasions, setOccasions } = useOccasions();
    const [selectedDate, setSelectedDate] = useState('');
    const [newActivityTitle, setNewActivityTitle] = useState('');
    const [newActivityDescription, setNewActivityDescription] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const [showActivityModal, setShowActivityModal] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [monthlyView, setMonthlyView] = useState(false);

    const getDayActivities = () => occasions.filter(occasion => occasion.date === selectedDate);
    const getMonthActivities = () => {
        const selectedMonth = selectedDate.slice(0, 7);
        return occasions.filter(occasion => occasion.date.startsWith(selectedMonth));
    };

    const handleDayPress = (day) => {
        setSelectedDate(day.dateString);
        setMonthlyView(false);
    };

    const addActivity = () => {
        if (newActivityTitle.trim() && newActivityDescription.trim()) {
            const newOccasion = {
                date: selectedDate,
                title: newActivityTitle,
                description: newActivityDescription,
                images: selectedImages,
            };
            console.log("New Activity:", newOccasion); // Debugging: check new activity details

            setOccasions((prevOccasions) => {
                const updatedOccasions = [...prevOccasions, newOccasion];
                console.log("Updated Occasions:", updatedOccasions); // Debugging: check updated occasions list
                return updatedOccasions;
            });

            setNewActivityTitle('');
            setNewActivityDescription('');
            setSelectedImages([]);
            setShowAddModal(false);
        } else {
            console.log("Missing title or description"); // Debugging: check if any input is missing
        }
    };

    const removeActivity = (activityToRemove) => {
        const updatedOccasions = occasions.filter(occasion => occasion !== activityToRemove);
        setOccasions(updatedOccasions);
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 1,
        });

        if (!result.canceled) {
            setSelectedImages([...selectedImages, ...result.assets.map(asset => asset.uri)]);
        }
    };

    const openActivityModal = (activity) => {
        setSelectedActivity(activity);
        setShowActivityModal(true);
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <Text style={styles.title}>Calendar</Text>

                {/* Calendar View */}
                <Calendar
                    style={styles.calendar}
                    onDayPress={handleDayPress}
                    markedDates={{
                        [selectedDate]: { selected: true, selectedColor: '#FFC0CB' },
                        ...occasions.reduce((acc, occasion) => {
                            acc[occasion.date] = { marked: true, dotColor: '#FFC0CB' };
                            return acc;
                        }, {}),
                    }}
                    theme={{
                        backgroundColor: '#4B0082',
                        calendarBackground: '#4B0082',
                        textSectionTitleColor: '#FFC0CB',
                        selectedDayBackgroundColor: '#FFC0CB',
                        selectedDayTextColor: '#4B0082',
                        todayTextColor: '#FFC0CB',
                        dayTextColor: '#FFFFFF',
                        textDisabledColor: '#888',
                        arrowColor: '#FFC0CB',
                        monthTextColor: '#FFC0CB',
                    }}
                />

                {/* Toggle between daily and monthly views */}
                <TouchableOpacity onPress={() => setMonthlyView(!monthlyView)} style={styles.toggleButton}>
                    <Text style={styles.toggleButtonText}>{monthlyView ? 'View Daily' : 'View Monthly'}</Text>
                </TouchableOpacity>

                {/* Activities List */}
                <FlatList
                    data={monthlyView ? getMonthActivities() : getDayActivities()}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => openActivityModal(item)} style={styles.activityItem}>
                            <View>
                                <Text style={styles.activityText}>{item.title}</Text>
                            </View>
                            <TouchableOpacity onPress={() => removeActivity(item)} style={styles.removeButton}>
                                <Text style={styles.removeButtonText}>Remove</Text>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={<Text style={styles.noActivitiesText}>No activities</Text>}
                />

                {/* Add Activity Button */}
                <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
                    <MaterialIcons name="add" size={24} color="#4B0082" />
                    <Text style={styles.addButtonText}>Add Activity</Text>
                </TouchableOpacity>

                {/* Add Activity Modal */}
                <Modal visible={showAddModal} transparent={true} animationType="slide">
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>Add Activity for {selectedDate}</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Activity title"
                                    placeholderTextColor="#FFC0CB"
                                    value={newActivityTitle}
                                    onChangeText={setNewActivityTitle}
                                />
                                <TextInput
                                    style={[styles.input, styles.descriptionInput]}
                                    placeholder="Activity description"
                                    placeholderTextColor="#FFC0CB"
                                    value={newActivityDescription}
                                    onChangeText={setNewActivityDescription}
                                    multiline
                                />
                                <Button title="Attach Photos" onPress={pickImage} />
                                <ScrollView horizontal style={styles.imagePreviewContainer}>
                                    {selectedImages.map((uri, index) => (
                                        <Image key={index} source={{ uri }} style={styles.selectedImagePreview} />
                                    ))}
                                </ScrollView>
                                <TouchableOpacity style={styles.saveButton} onPress={addActivity}>
                                    <Text style={styles.saveButtonText}>Save</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAddModal(false)}>
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>

                {/* Expanded Activity Modal */}
                {selectedActivity && (
                    <Modal visible={showActivityModal} transparent={true} animationType="slide">
                        <View style={styles.modalOverlay}>
                            <View style={styles.expandedModalContent}>
                                <Text style={styles.modalTitle}>{selectedActivity.title}</Text>
                                {selectedActivity.images && selectedActivity.images.length > 0 && (
                                    <ScrollView horizontal style={styles.imageSection}>
                                        {selectedActivity.images.map((uri, index) => (
                                            <Image key={index} source={{ uri }} style={styles.expandedImage} />
                                        ))}
                                    </ScrollView>
                                )}
                                <ScrollView style={styles.descriptionSection}>
                                    <Text style={styles.activityDescription}>{selectedActivity.description}</Text>
                                </ScrollView>
                                <TouchableOpacity style={styles.cancelButton} onPress={() => setShowActivityModal(false)}>
                                    <Text style={styles.cancelButtonText}>Close</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                )}
            </View>
        </TouchableWithoutFeedback>
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
        marginVertical: 10,
    },
    calendar: {
        marginBottom: 20,
    },
    toggleButton: {
        backgroundColor: '#FFC0CB',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
        alignSelf: 'center',
    },
    toggleButtonText: {
        color: '#4B0082',
        fontWeight: 'bold',
    },
    activityItem: {
        backgroundColor: '#FFC0CB',
        padding: 10,
        borderRadius: 8,
        marginVertical: 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    activityText: {
        color: '#4B0082',
        fontWeight: 'bold',
        flex: 1,
    },
    removeButton: {
        backgroundColor: '#FF8C8C',
        padding: 5,
        borderRadius: 8,
        marginLeft: 10,
    },
    removeButtonText: {
        color: '#4B0082',
        fontWeight: 'bold',
    },
    addButton: {
        backgroundColor: '#FFC0CB',
        padding: 10,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 16,
        marginBottom: 20,
    },
    addButtonText: {
        color: '#4B0082',
        fontWeight: 'bold',
        marginLeft: 5,
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
    expandedModalContent: {
        backgroundColor: '#4B0082',
        padding: 20,
        borderRadius: 10,
        width: '90%',
        maxHeight: '80%',
    },
    modalTitle: {
        color: '#FFC0CB',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        color: '#FFC0CB',
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
    },
    descriptionInput: {
        height: 60,
    },
    imagePreviewContainer: {
        flexDirection: 'row',
        marginVertical: 10,
    },
    selectedImagePreview: {
        width: 60,
        height: 60,
        marginRight: 5,
        borderRadius: 8,
    },
    imageSection: {
        marginBottom: 50,
    },
    expandedImage: {
        width: 200,
        height: 200,
        marginRight: 5,
        borderRadius: 8,
    },
    descriptionSection: {
        maxHeight: 250,
        marginBottom: 50,
        marginTop: 30,
    },
    activityDescription: {
        color: '#FFC0CB',
        fontSize: 16,
    },
    saveButton: {
        backgroundColor: '#FFC0CB',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
    },
    saveButtonText: {
        color: '#4B0082',
        fontWeight: 'bold',
    },
    cancelButton: {
        backgroundColor: '#FF8C8C',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    cancelButtonText: {
        color: '#4B0082',
        fontWeight: 'bold',
    }, noActivitiesText: {
        color: '#FFC0CB',
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 10,
        fontSize: 16,
    },

});