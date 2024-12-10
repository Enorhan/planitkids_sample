import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, TouchableOpacity, Image, Alert, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../../supabaseClient';
import * as ImagePicker from "expo-image-picker";
import { KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from 'react-native';



export default function WhatsToday({ navigation }) {
    const activityOptions = ["Pyssel", "Utomhus", "Film", "Tema Arbete", "Bakning"];
    const [activities, setActivities] = useState([
        {
            activity_type: "Pyssel",
            from_time: "",
            to_time: "",
            location: "",
            assigned_profiles: [],
            description: "",
            photos: [],
            is_saved: false,
            id: null,
            isExpanded: false
        }
    ]);
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const [teacherSelectModalVisible, setTeacherSelectModalVisible] = useState(false);
    const [assigningTeacherForIndex, setAssigningTeacherForIndex] = useState(null);
    const [user, setUser] = useState(null);
    const [selectedActivityIndex, setSelectedActivityIndex] = useState(null);
    const [tempDescription, setTempDescription] = useState('');
    const [confirmationVisible, setConfirmationVisible] = useState(false);
    const [activityToRemove, setActivityToRemove] = useState(null);
    const [editingTeacherModalVisible, setEditingTeacherModalVisible] = useState(false);
    const [teacherToEdit, setTeacherToEdit] = useState(null); // This will store the user object of the teacher clicked
    const [editingTeacherForIndex, setEditingTeacherForIndex] = useState(null); // Which activity's teacher we are editing

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const { data: authUser, error: authError } = await supabase.auth.getUser();
                if (authError || !authUser) {
                    Alert.alert("Error", "Failed to retrieve user authentication.");
                    return;
                }

                const { data: userDetails, error: userError } = await supabase
                    .from('users')
                    .select('id, school_id')
                    .eq('id', authUser.user.id)
                    .single();

                if (userError || !userDetails) {
                    Alert.alert("Error", "Failed to fetch user details.");
                    return;
                }

                setUser({
                    id: userDetails.id,
                    school_id: userDetails.school_id,
                });
            } catch (err) {
                console.error("Error fetching user data:", err.message);
                Alert.alert("Error", "Unable to fetch user details.");
            }
        };

        fetchUserData();
    }, []);

    const [eligibleUsers, setEligibleUsers] = useState([]);

    useEffect(() => {
        const fetchEligibleUsers = async () => {
            try {
                const { data, error } = await supabase
                    .from('users')
                    .select('id, first_name, role')
                    .in('role', ['fritidspersonal', 'fritidsledare', 'vikarie']);

                if (error) throw error;

                setEligibleUsers(data || []);
            } catch (err) {
                console.error('Error fetching eligible users:', err.message);
            }
        };

        fetchEligibleUsers();
    }, []);

    useEffect(() => {
        const fetchTodayActivities = async () => {
            try {
                const { data, error } = await supabase
                    .from('activities')
                    .select('*')
                    .eq('date', today);

                if (error) throw error;

                // Ensure data is always an array
                const safeData = data || [];
                const activitiesWithExpanded = safeData.map(act => ({ ...act, isExpanded: false }));
                setActivities(activitiesWithExpanded);
            } catch (err) {
                console.error('Error fetching today’s activities:', err.message);
                // If there's an error, you can opt to setActivities([]) to avoid issues
                setActivities([]);
            }
        };

        fetchTodayActivities();
    }, [today]);



    const handleAssignTeacher = (activityIndex, user) => {
        setActivities((prev) => {
            const updated = [...prev];
            const currentTeachers = updated[activityIndex].assigned_profiles || [];
            if (!currentTeachers.some(t => t.id === user.id)) {
                updated[activityIndex].assigned_profiles = [...currentTeachers, user];
            }
            return updated;
        });
    };

    const removeAssignedTeacher = (activityIndex, userId) => {
        setActivities((prev) => {
            const updated = [...prev];
            updated[activityIndex].assigned_profiles = updated[activityIndex].assigned_profiles.filter(
                (user) => user.id !== userId
            );
            return updated;
        });
    };

    const attachPhotoFromPhone = async (index) => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'We need access to your photos to attach an image.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaType?.IMAGE || ImagePicker.MediaTypeOptions?.Images || ['image'],
                allowsEditing: true,
                quality: 1,
            });

            console.log('ImagePicker Result:', result); // Debugging

            // Extract the URI from the result
            const photoUri = result.assets?.[0]?.uri;

            if (photoUri) {
                console.log('Photo URI:', photoUri); // Debugging
                setActivities((prev) => {
                    const updated = [...prev];
                    updated[index].photos.push(photoUri);
                    return updated;
                });
            } else {
                console.log('No valid photo URI found');
            }
        } catch (err) {
            console.error('Error attaching photo:', err.message);
            Alert.alert('Error', 'Unable to attach photo. Please try again.');
        }
    };    const removePhoto = (activityIndex, photoIndex) => {
        setActivities((prev) => {
            const updated = [...prev];
            updated[activityIndex].photos.splice(photoIndex, 1);
            return updated;
        });
    };

    const saveActivityToSupabase = async (index) => {
        try {
            if (!user || !user.id || !user.school_id) {
                Alert.alert("Error", "User information is incomplete.");
                return;
            }

            const activity = activities[index];

            if (!activity.from_time || !activity.to_time || !activity.location) {
                Alert.alert('Error', 'Please fill all fields before saving.');
                return;
            }

            const activityData = {
                activity_type: activity.activity_type,
                from_time: activity.from_time,
                to_time: activity.to_time,
                location: activity.location,
                description: activity.description,
                photos: activity.photos,
                assigned_profiles: activity.assigned_profiles,
                is_saved: true,
                created_by: user.id,
                school_id: user.school_id,
                date: new Date().toISOString().split('T')[0],
            };

            const { data, error } = await supabase.from('activities').insert([activityData]).select();
            if (error) throw error;

            Alert.alert('Success', 'Activity saved successfully.');

            const updatedActivities = [...activities];
            updatedActivities[index] = { ...updatedActivities[index], id: data[0].id, is_saved: true };
            setActivities(updatedActivities);
        } catch (err) {
            console.error('Error saving activity:', err.message);
            Alert.alert('Error', 'Unable to save activity. Please try again.');
        }
    };

    const updateActivityInSupabase = async (index) => {
        try {
            const activity = activities[index];

            if (!activity.is_saved) {
                Alert.alert('Error', 'Save the activity before updating.');
                return;
            }

            if (!activity.id) {
                Alert.alert('Error', 'Activity ID is missing.');
                return;
            }

            console.log('Updating activity with ID:', activity.id); // Debugging

            const { error } = await supabase
                .from('activities')
                .update({
                    activity_type: activity.activity_type,
                    from_time: activity.from_time,
                    to_time: activity.to_time,
                    location: activity.location,
                    description: activity.description,
                    photos: activity.photos,
                })
                .eq('id', activity.id);

            if (error) {
                console.error('Supabase update error:', error.message); // Debugging
                throw error;
            }

            Alert.alert('Success', 'Activity updated successfully.');
            console.log('Activity updated:', activity); // Debugging
        } catch (err) {
            console.error('Error updating activity:', err.message);
            Alert.alert('Error', 'Unable to update activity. Please try again.');
        }
    };

    const removeActivityFromSupabase = async () => {
        try {
            console.log('Activity to Remove Index:', activityToRemove); // Debugging
            console.log('Activities Array:', activities); // Debugging

            if (activityToRemove === null || activityToRemove < 0 || activityToRemove >= activities.length) {
                Alert.alert('Error', 'Invalid activity selected.');
                return;
            }

            const activity = activities[activityToRemove];

            if (!activity.id) {
                Alert.alert('Error', 'Activity ID is missing or invalid.');
                return;
            }

            console.log('Deleting activity with ID:', activity.id); // Debugging

            const { error } = await supabase.from('activities').delete().eq('id', activity.id);

            if (error) {
                console.error('Supabase delete error:', error.message); // Debugging
                throw error;
            }

            Alert.alert('Success', 'Activity removed successfully.');

            setActivities((prev) => {
                const updatedActivities = prev.filter((_, i) => i !== activityToRemove);
                console.log('Updated activities after removal:', updatedActivities); // Debugging
                return updatedActivities;
            });

            setConfirmationVisible(false);
        } catch (err) {
            console.error('Error removing activity:', err.message); // Debugging
            Alert.alert('Error', 'Unable to remove activity. Please try again.');
        }
    };

    const addActivity = () => {
        setActivities([...activities, {
            activity_type: "Pyssel",
            from_time: "",
            to_time: "",
            location: "",
            assigned_profiles: [],
            description: "",
            photos: [],
            is_saved: false,
            id: null
        }]);
    };

    const updateActivity = (index, field, value) => {
        setActivities((prev) => {
            const updated = [...prev];
            updated[index][field] = value;
            return updated;
        });
    };

    const handleTimeChange = (text, index, field) => {
        const formatted = text.replace(/[^0-9]/g, '');
        if (formatted.length > 4) return;
        const value = formatted.length <= 2 ? formatted : `${formatted.slice(0, 2)}:${formatted.slice(2)}`;
        updateActivity(index, field, value);
    };

    const handleSaveDescription = () => {
        if (selectedActivityIndex !== null) {
            // Update the activity's description
            setActivities((prev) => {
                const updated = [...prev];
                updated[selectedActivityIndex].description = tempDescription;
                return updated;
            });

            // Reset modal states
            setSelectedActivityIndex(null);
            setTempDescription('');
        }
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back" size={24} color="#FFC0CB" />
                    </TouchableOpacity>
                    <Text style={styles.title}>What's Today (Activity Planner)</Text>
                    <ScrollView
                        contentContainerStyle={styles.scrollContainer}
                        keyboardShouldPersistTaps="handled">
                        {Array.isArray(activities) && activities.map((activity, index) => (
                            <View key={index} style={styles.activityCard}>

                                {/* Expand/Minimize Toggle Button */}
                                <TouchableOpacity onPress={() => {
                                    setActivities(prev => {
                                        const updated = [...prev];
                                        updated[index].isExpanded = !updated[index].isExpanded;
                                        return updated;
                                    });
                                }}>
                                    <Text style={{color: '#FFC0CB', fontSize: 16, fontWeight: 'bold'}}>
                                        {activity.isExpanded ? "Minimize" : "Expand"}
                                    </Text>
                                </TouchableOpacity>

                                {activity.isExpanded ? (
                                    /* Expanded View: Show full details */
                                    <View>
                                        <Picker
                                            selectedValue={activity.activity_type}
                                            style={styles.picker}
                                            onValueChange={(itemValue) => updateActivity(index, 'activity_type', itemValue)}
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
                                                    value={activity.from_time}
                                                    onChangeText={(text) => handleTimeChange(text, index, 'from_time')}
                                                />
                                                <Text style={styles.label}>To</Text>
                                                <TextInput
                                                    style={styles.timeInput}
                                                    placeholder="HH:MM"
                                                    placeholderTextColor="#FFC0CB"
                                                    keyboardType="numeric"
                                                    value={activity.to_time}
                                                    onChangeText={(text) => handleTimeChange(text, index, 'to_time')}
                                                />
                                            </View>
                                            <TextInput
                                                style={styles.locationInput}
                                                placeholder="Where"
                                                placeholderTextColor="#FFC0CB"
                                                value={activity.location}
                                                onChangeText={(text) => updateActivity(index, 'location', text)}
                                            />
                                        </View>

                                        <TouchableOpacity onPress={() => setSelectedActivityIndex(index)}>
                                            <Text style={styles.descriptionText}>
                                                {activity.description || "Tap to add description"}
                                            </Text>
                                        </TouchableOpacity>

                                        {/* Assigned Teachers */}
                                        <View style={styles.profileIconsContainer}>
                                            <Text style={styles.assignLabel}>Assigned Teachers:</Text>
                                            <ScrollView horizontal>
                                                <View style={styles.profileIcons}>
                                                    {activity.assigned_profiles.map((user, userIndex) => (
                                                        <TouchableOpacity
                                                            key={userIndex}
                                                            onPress={() => {
                                                                setTeacherToEdit(user);
                                                                setEditingTeacherForIndex(index);
                                                                setEditingTeacherModalVisible(true);
                                                            }}
                                                        >
                                                            <Image
                                                                source={{ uri: user.uri || 'https://via.placeholder.com/100' }}
                                                                style={styles.profileIcon}
                                                                resizeMode="cover"
                                                            />
                                                        </TouchableOpacity>
                                                    ))}
                                                    <TouchableOpacity onPress={() => {
                                                        setAssigningTeacherForIndex(index);
                                                        setTeacherSelectModalVisible(true);
                                                    }}>
                                                        <View style={[styles.profileIcon, styles.addTeacherIcon]}>
                                                            <Text style={{ color: '#FFC0CB', fontSize: 20, fontWeight: 'bold' }}>+</Text>
                                                        </View>
                                                    </TouchableOpacity>
                                                </View>
                                            </ScrollView>
                                        </View>

                                        {/* Photos */}
                                        <View style={styles.photosContainer}>
                                            {activity.photos.map((photo, i) => (
                                                <View key={i} style={styles.photoWrapper}>
                                                    <Image
                                                        source={{ uri: photo }}
                                                        style={styles.attachedPhoto}
                                                        resizeMode="cover"
                                                    />
                                                    <TouchableOpacity
                                                        style={styles.removePhotoButton}
                                                        onPress={() => removePhoto(index, i)}
                                                    >
                                                        <Text style={styles.removePhotoButtonText}>X</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            ))}
                                        </View>

                                        <TouchableOpacity style={styles.saveButton} onPress={() => saveActivityToSupabase(index)} disabled={activity.is_saved}>
                                            <Text style={styles.saveButtonText}>{activity.is_saved ? "Activity Saved" : "Save Activity"}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.editButton} onPress={() => updateActivityInSupabase(index)}>
                                            <Text style={styles.editButtonText}>Update Activity</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.removeButton}
                                            onPress={() => {
                                                setActivityToRemove(index);
                                                setConfirmationVisible(true);
                                            }}
                                        >
                                            <Text style={styles.removeButtonText}>Remove Activity</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    /* Minimized View: Show only activity type */
                                    <View style={{ marginTop: 10 }}>
                                        <Text style={{color:'#FFC0CB', fontSize:18}}>Type: {activity.activity_type}</Text>
                                    </View>
                                )}
                            </View>
                        ))}
                        <TouchableOpacity style={styles.addButton} onPress={addActivity}>
                            <Text style={styles.addButtonText}>+ Add Activity</Text>
                        </TouchableOpacity>
                    </ScrollView>

                    {confirmationVisible && (
                        <Modal visible={true} transparent animationType="fade">
                            <View style={styles.modalOverlay}>
                                <View style={styles.modalContent}>
                                    <Text style={styles.modalTitle}>Are you sure you want to remove this activity?</Text>
                                    <TouchableOpacity style={styles.confirmButton} onPress={removeActivityFromSupabase}>
                                        <Text style={styles.confirmButtonText}>Yes</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.cancelButton} onPress={() => setConfirmationVisible(false)}>
                                        <Text style={styles.cancelButtonText}>No</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Modal>
                    )}

                    {selectedActivityIndex !== null && (
                        <Modal visible={true} transparent animationType="fade">
                            <View style={styles.modalOverlay}>
                                <View style={styles.modalContent}>
                                    <Text style={styles.modalTitle}>Add Description</Text>
                                    <TextInput
                                        style={styles.modalDescriptionInput}
                                        placeholder="Enter description here"
                                        placeholderTextColor="#FFC0CB"
                                        value={tempDescription}
                                        onChangeText={(text) => setTempDescription(text)}
                                        multiline
                                    />
                                    <TouchableOpacity style={styles.attachPhotoButton} onPress={() => attachPhotoFromPhone(selectedActivityIndex)}>
                                        <Text style={styles.attachPhotoButtonText}>Attach Photo</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.saveButton} onPress={handleSaveDescription}>
                                        <Text style={styles.saveButtonText}>Save</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.cancelButton} onPress={() => setSelectedActivityIndex(null)}>
                                        <Text style={styles.cancelButtonText}>Cancel</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Modal>
                    )}

                    {teacherSelectModalVisible && (
                        <Modal visible={true} transparent animationType="fade">
                            <View style={styles.modalOverlay}>
                                <View style={styles.modalContent}>
                                    <Text style={styles.modalTitle}>Select a Teacher</Text>
                                    <ScrollView style={{ maxHeight: 300 }}>
                                        {eligibleUsers.map((user) => (
                                            <TouchableOpacity
                                                key={user.id}
                                                onPress={() => {
                                                    if (teacherToEdit && editingTeacherForIndex !== null) {
                                                        // We are editing
                                                        removeAssignedTeacher(editingTeacherForIndex, teacherToEdit.id);
                                                        handleAssignTeacher(assigningTeacherForIndex, user);
                                                        setTeacherToEdit(null);
                                                        setEditingTeacherForIndex(null);
                                                    } else {
                                                        // Normal add
                                                        handleAssignTeacher(assigningTeacherForIndex, user);
                                                    }
                                                    setTeacherSelectModalVisible(false);
                                                }}
                                                style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#FFC0CB'}}
                                            >
                                                <Text style={{ color: '#FFC0CB', fontSize: 18 }}>{user.first_name}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                    <TouchableOpacity style={styles.cancelButton} onPress={() => setTeacherSelectModalVisible(false)}>
                                        <Text style={styles.cancelButtonText}>Cancel</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Modal>
                    )}

                    {editingTeacherModalVisible && (
                        <Modal visible={true} transparent animationType="fade">
                            <View style={styles.modalOverlay}>
                                <View style={styles.modalContent}>
                                    <Text style={styles.modalTitle}>Remove Teacher</Text>
                                    <Text style={{ color: '#FFC0CB', fontSize: 16, marginVertical: 10 }}>
                                        {teacherToEdit ? `Selected: ${teacherToEdit.first_name}` : ''}
                                    </Text>

                                    <TouchableOpacity
                                        style={styles.removeButton}
                                        onPress={() => {
                                            removeAssignedTeacher(editingTeacherForIndex, teacherToEdit.id);
                                            setEditingTeacherModalVisible(false);
                                        }}
                                    >
                                        <Text style={styles.removeButtonText}>Remove</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={styles.cancelButton} onPress={() => setEditingTeacherModalVisible(false)}>
                                        <Text style={styles.cancelButtonText}>Cancel</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Modal>
                    )}

                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
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
        fontsize: 18
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
        fontSize: 20,
    },
    timeInput: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        color: '#FFC0CB',
        borderRadius: 8,
        padding: 10,
        width: 100,
        marginRight: 10,
        textAlign: 'center',
        fontSize: 18
    },
    locationInput: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        color: '#FFC0CB',
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
        fontSize: 18
    },
    descriptionText: {
        color: '#FFC0CB',
        padding: 10,
        marginBottom: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 8,
        textAlign: 'center',
        fontSize: 18
    },
    profileIconsContainer: {
        alignItems: 'flex-start',
        marginTop: 10,
    },
    assignLabel: {
        color: '#FFC0CB',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    profileIcons: {
        flexDirection: 'row',
    },
    profileIcon: {
        width: 100,
        height: 100,
        borderRadius: 100,
        marginRight: 10,
        borderColor: '#FFC0CB',
        borderWidth: 1,
    },
    removeButton: {
        backgroundColor: '#FF8C8C',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    removeButtonText: {
        color: '#4B0082',
        fontWeight: 'bold',
        fontSize: 18,
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
        fontSize: 18,
    },
    saveButton: {
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    saveButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 18

    },
    editButton: {
        backgroundColor: '#FFA500',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    editButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 18
    },
    confirmButton: {
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    confirmButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 18
    },
    cancelButton: {
        backgroundColor: '#FF8C8C',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    cancelButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 18
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
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',

    },
    modalDescriptionInput: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        color: '#FFC0CB',
        borderRadius: 8,
        padding: 10,
        height: 100,
        textAlignVertical: 'top',
        marginBottom: 10,
    },
    attachPhotoButton: {
        backgroundColor: '#FF8C8C',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    attachPhotoButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 18,
    },
    photosContainer: {
        flexDirection: 'row',
        marginTop: 10,
    },
    photoWrapper: {
        marginRight: 10,
    },
    attachedPhoto: {
        width: 160,
        height: 160,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FFC0CB',
    },
    removePhotoButton: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent background
        borderRadius: 15,
        padding: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    removePhotoButtonText: {
        color: '#FF0000', // Red 'X'
        fontWeight: 'bold',
        fontSize: 12,
    },
    addTeacherIcon: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 192, 203, 0.3)',
    },


});