import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, TouchableOpacity, Image, Alert, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../../supabaseClient';
import * as ImagePicker from "expo-image-picker";
import { KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import {Calendar} from "react-native-calendars";



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

    // Function to calculate week number
    const getWeekNumber = (date) => {
        const target = new Date(date);
        // Set to nearest Thursday: current date + 4 - current day number
        // Make Sunday's day number 7 for ISO 8601 compliance
        const dayNr = (target.getDay() + 6) % 7;
        target.setDate(target.getDate() - dayNr + 3);

        // January 4th is always in the first ISO week
        const firstThursday = new Date(target.getFullYear(), 0, 4);
        const diff = target - firstThursday;

        // Calculate full weeks to nearest Thursday
        const oneWeek = 7 * 24 * 60 * 60 * 1000;
        return 1 + Math.floor(diff / oneWeek);
    };
    // Format the current date
    const formatDate = (date) => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Intl.DateTimeFormat('en-US', options).format(date);
    };

    // Formatting Utilities
    const formatDateDisplay = (date) => {
        const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
        return new Intl.DateTimeFormat('en-US', options).format(date);
    };

    const formatWeekNumber = (date) => {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date - firstDayOfYear + 86400000) / 86400000;
        return `Week ${Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)}`;
    };

    const [activeModal, setActiveModal] = useState(null); // 'description' or 'feedback'
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
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
    const [currentWeek, setCurrentWeek] = useState([]);
    const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
    const [feedbackText, setFeedbackText] = useState('');
    const currentDate = new Date(selectedDate);
    const weekNumber = getWeekNumber(currentDate);
    const formattedDate = formatDate(currentDate);
    const [descriptionModalVisible, setDescriptionModalVisible] = useState(false);
    const [weeklyActivities, setWeeklyActivities] = useState({});

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
        const fetchWeeklyActivities = async () => {
            try {
                const { data, error } = await supabase
                    .from('activities')
                    .select('*')
                    .in('date', currentWeek); // Fetch activities for the whole week

                if (error) throw error;

                const groupedActivities = currentWeek.reduce((acc, day) => {
                    acc[day] = [];
                    return acc;
                }, {});

                // Group activities by date
                (data || []).forEach((activity) => {
                    const date = activity.date;
                    if (groupedActivities[date]) {
                        groupedActivities[date].push(activity);
                    }
                });

                setWeeklyActivities(groupedActivities);
            } catch (err) {
                console.error('Error fetching weekly activities:', err.message);
            }
        };

        fetchWeeklyActivities();
    }, [currentWeek]); // Refetch whenever the week changes

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

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const { data, error } = await supabase
                    .from('activities')
                    .select('*')
                    .eq('date', selectedDate); // Fetch based on selected date

                if (error) throw error;

                const activitiesWithDefaults = (data || []).map((act) => ({
                    ...act,
                    assigned_profiles: act.assigned_profiles || [], // Ensure assigned_profiles is an array
                    isExpanded: false,
                }));
                setActivities(activitiesWithDefaults);
            } catch (err) {
                console.error('Error fetching activities:', err.message);
                setActivities([]); // Reset activities if error
            }
        };

        fetchActivities();
    }, [selectedDate]); // Refetch when selectedDate changes


    // Initialize the current week
    useEffect(() => {
        setCurrentWeek(getWeekFromDate(today));
    }, []);

    const getWeekFromDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDay();
        // Adjust so Monday is the first day of the week
        const diff = (day === 0 ? -6 : 1) - day; // Sunday becomes -6, others shift accordingly
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() + diff); // Set to Monday

        const week = Array.from({ length: 7 }, (_, i) => {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            return day.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        });
        return week;
    };

    const goToPreviousWeek = () => {
        const firstDayOfWeek = new Date(currentWeek[0]);
        firstDayOfWeek.setDate(firstDayOfWeek.getDate() - 7); // Go back 7 days
        setCurrentWeek(getWeekFromDate(firstDayOfWeek.toISOString().split('T')[0]));
    };

    const goToNextWeek = () => {
        const lastDayOfWeek = new Date(currentWeek[6]);
        lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 7); // Go forward 7 days
        setCurrentWeek(getWeekFromDate(lastDayOfWeek.toISOString().split('T')[0]));
    };


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

    const handleAddDescription = (index) => {
        setSelectedActivityIndex(index);
        setDescriptionModalVisible(true);
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

    const saveFeedbackToSupabase = async (index, feedback) => {
        try {
            const activity = activities[index];
            if (!activity.id) {
                Alert.alert('Error', 'Activity ID is missing.');
                return;
            }

            const { error } = await supabase
                .from('activities')
                .update({ feedback })
                .eq('id', activity.id);

            if (error) {
                console.error('Supabase update error:', error.message);
                throw error;
            }

            Alert.alert('Success', 'Feedback saved successfully.');
        } catch (err) {
            console.error('Error saving feedback:', err.message);
            Alert.alert('Error', 'Unable to save feedback. Please try again.');
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
            setDescriptionModalVisible(false); // Close only the description modal
        }
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back" size={24} color="#FFC0CB" />
                    </TouchableOpacity>

                    {/* Calendar Component */}
                    <View style={styles.weekView}>
                        <View style={styles.weekHeader}>
                            <TouchableOpacity onPress={goToPreviousWeek} style={styles.navigationButton}>
                                <MaterialIcons name="arrow-back-ios" size={28} color="#FFC0CB" />
                            </TouchableOpacity>
                            <View style={styles.textContainer}>
                                <Text style={styles.primaryDateText}>{formattedDate}</Text>
                                <View style={styles.weekContainer}>
                                    <Text style={styles.weekText}>W.{weekNumber}</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={goToNextWeek} style={styles.navigationButton}>
                                <MaterialIcons name="arrow-forward-ios" size={28} color="#FFC0CB" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView horizontal contentContainerStyle={styles.daysRow}>
                            {currentWeek.map((day) => (
                                <TouchableOpacity
                                    key={day}
                                    onPress={() => setSelectedDate(day)}
                                    style={[
                                        styles.dayContainer,
                                        day === today && styles.currentDay,
                                        day === selectedDate && styles.selectedDay,
                                    ]}
                                >
                                    <Text style={styles.dayText}>{new Date(day).getDate()}</Text>
                                    <Text style={styles.subText}>
                                        {weeklyActivities[day]?.length || 0} activities
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
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

                                        <TouchableOpacity onPress={() => {
                                            setSelectedActivityIndex(index);
                                            setTempDescription(activities[index].description || '');
                                            setActiveModal('description'); // Indicate the active modal
                                        }}>
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
                                        <TouchableOpacity
                                            style={styles.feedbackButton}
                                            onPress={() => {
                                                setSelectedActivityIndex(index);
                                                setFeedbackText(activity.feedback || ''); // Load feedback
                                                setActiveModal('feedback'); // Indicate the active modal
                                            }}
                                        >
                                            <Text style={styles.feedbackButtonText}>Give Feedback</Text>
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

                    {/*{selectedActivityIndex !== null && (*/}
                    {/*    <Modal visible={true} transparent animationType="fade">*/}
                    {/*        <View style={styles.modalOverlay}>*/}
                    {/*            <View style={styles.modalContent}>*/}
                    {/*                <Text style={styles.modalTitle}>Add Description</Text>*/}
                    {/*                <TextInput*/}
                    {/*                    style={styles.modalDescriptionInput}*/}
                    {/*                    placeholder="Enter description here"*/}
                    {/*                    placeholderTextColor="#FFC0CB"*/}
                    {/*                    value={tempDescription}*/}
                    {/*                    onChangeText={(text) => setTempDescription(text)}*/}
                    {/*                    multiline*/}
                    {/*                />*/}
                    {/*                <TouchableOpacity style={styles.attachPhotoButton} onPress={() => attachPhotoFromPhone(selectedActivityIndex)}>*/}
                    {/*                    <Text style={styles.attachPhotoButtonText}>Attach Photo</Text>*/}
                    {/*                </TouchableOpacity>*/}
                    {/*                <TouchableOpacity style={styles.saveButton} onPress={handleSaveDescription}>*/}
                    {/*                    <Text style={styles.saveButtonText}>Save</Text>*/}
                    {/*                </TouchableOpacity>*/}
                    {/*                <TouchableOpacity style={styles.cancelButton} onPress={() => setSelectedActivityIndex(null)}>*/}
                    {/*                    <Text style={styles.cancelButtonText}>Cancel</Text>*/}
                    {/*                </TouchableOpacity>*/}
                    {/*            </View>*/}
                    {/*        </View>*/}
                    {/*    </Modal>*/}
                    {/*)}*/}

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

                    {activeModal === 'description' && selectedActivityIndex !== null && (
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

                                    {/* Horizontal ScrollView for Photos */}
                                    {activities[selectedActivityIndex]?.photos?.length > 0 && (
                                        <ScrollView
                                            horizontal
                                            contentContainerStyle={styles.photosScrollContainer}
                                            showsHorizontalScrollIndicator={false}
                                        >
                                            {activities[selectedActivityIndex].photos.map((photo, i) => (
                                                <View key={i} style={styles.photoWrapper}>
                                                    <Image
                                                        source={{ uri: photo }}
                                                        style={styles.attachedPhoto}
                                                        resizeMode="cover"
                                                    />
                                                    <TouchableOpacity
                                                        style={styles.removePhotoButton}
                                                        onPress={() => removePhoto(selectedActivityIndex, i)}
                                                    >
                                                        <Text style={styles.removePhotoButtonText}>X</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            ))}
                                        </ScrollView>
                                    )}

                                    {/* Buttons */}
                                    <TouchableOpacity
                                        style={styles.attachPhotoButton}
                                        onPress={() => attachPhotoFromPhone(selectedActivityIndex)}
                                    >
                                        <Text style={styles.attachPhotoButtonText}>Attach Photo</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.saveButton}
                                        onPress={() => {
                                            if (selectedActivityIndex !== null) {
                                                setActivities((prev) => {
                                                    const updated = [...prev];
                                                    updated[selectedActivityIndex].description = tempDescription; // Save updated description
                                                    return updated;
                                                });
                                                setActiveModal(null); // Close the modal
                                                setTempDescription('');
                                                setSelectedActivityIndex(null);
                                            }
                                        }}
                                    >
                                        <Text style={styles.saveButtonText}>Save</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.cancelButton}
                                        onPress={() => {
                                            setActiveModal(null); // Close the modal
                                            setTempDescription('');
                                            setSelectedActivityIndex(null);
                                        }}
                                    >
                                        <Text style={styles.cancelButtonText}>Cancel</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Modal>
                    )}

                    {activeModal === 'feedback' && selectedActivityIndex !== null && (
                        <Modal visible={true} transparent animationType="fade">
                            <View style={styles.modalOverlay}>
                                <View style={styles.modalContent}>
                                    <Text style={styles.modalTitle}>Activity Feedback</Text>
                                    <TextInput
                                        style={styles.modalDescriptionInput}
                                        placeholder="Write your feedback here..."
                                        placeholderTextColor="#FFC0CB"
                                        value={feedbackText}
                                        onChangeText={setFeedbackText}
                                        multiline
                                    />
                                    <TouchableOpacity
                                        style={styles.saveButton}
                                        onPress={() => {
                                            if (selectedActivityIndex !== null) {
                                                setActivities((prev) => {
                                                    const updated = [...prev];
                                                    updated[selectedActivityIndex].feedback = feedbackText;
                                                    return updated;
                                                });

                                                saveFeedbackToSupabase(selectedActivityIndex, feedbackText); // Save feedback
                                                setActiveModal(null); // Close the modal
                                                setFeedbackText('');
                                                setSelectedActivityIndex(null);
                                            }
                                        }}
                                    >
                                        <Text style={styles.saveButtonText}>Save Feedback</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.cancelButton}
                                        onPress={() => {
                                            setActiveModal(null); // Close the modal
                                            setFeedbackText('');
                                            setSelectedActivityIndex(null);
                                        }}
                                    >
                                        <Text style={styles.cancelButtonText}>Cancel</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Modal>
                    )}

                    {/*{feedbackModalVisible && (*/}
                    {/*    <Modal visible={true} transparent animationType="fade">*/}
                    {/*        <View style={styles.modalOverlay}>*/}
                    {/*            <View style={styles.modalContent}>*/}
                    {/*                <Text style={styles.modalTitle}>Activity Feedback</Text>*/}
                    {/*                <TextInput*/}
                    {/*                    style={styles.modalDescriptionInput}*/}
                    {/*                    placeholder="Write your feedback here..."*/}
                    {/*                    placeholderTextColor="#FFC0CB"*/}
                    {/*                    value={feedbackText}*/}
                    {/*                    onChangeText={setFeedbackText}*/}
                    {/*                    multiline*/}
                    {/*                />*/}
                    {/*                <TouchableOpacity*/}
                    {/*                    style={styles.saveButton}*/}
                    {/*                    onPress={() => {*/}
                    {/*                        if (selectedActivityIndex !== null) {*/}
                    {/*                            // Update feedback for the specific activity*/}
                    {/*                            setActivities(prev => {*/}
                    {/*                                const updated = [...prev];*/}
                    {/*                                updated[selectedActivityIndex].feedback = feedbackText;*/}
                    {/*                                return updated;*/}
                    {/*                            });*/}

                    {/*                            // Save to Supabase*/}
                    {/*                            saveFeedbackToSupabase(selectedActivityIndex, feedbackText);*/}

                    {/*                            // Reset modal states*/}
                    {/*                            setFeedbackModalVisible(false);*/}
                    {/*                            setFeedbackText('');*/}
                    {/*                            setSelectedActivityIndex(null);*/}
                    {/*                        }*/}
                    {/*                    }}*/}
                    {/*                >*/}
                    {/*                    <Text style={styles.saveButtonText}>Save Feedback</Text>*/}
                    {/*                </TouchableOpacity>*/}
                    {/*                <TouchableOpacity*/}
                    {/*                    style={styles.cancelButton}*/}
                    {/*                    onPress={() => {*/}
                    {/*                        setFeedbackModalVisible(false);*/}
                    {/*                        setFeedbackText('');*/}
                    {/*                        setSelectedActivityIndex(null);*/}
                    {/*                    }}*/}
                    {/*                >*/}
                    {/*                    <Text style={styles.cancelButtonText}>Cancel</Text>*/}
                    {/*                </TouchableOpacity>*/}
                    {/*            </View>*/}
                    {/*        </View>*/}
                    {/*    </Modal>*/}
                    {/*)}*/}

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
    photosScrollContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10, // Add spacing around the photo section
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
        top: 5,
        right: 5,
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
    noActivitiesText: {
        color: '#FFC0CB',
        fontSize: 16,
        marginTop: 20,
        textAlign: 'center',
    },
    calendarWrapper: {
        backgroundColor: '#2E004E',
        borderRadius: 12,
        margin: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 5,
        marginTop: 90
    },
    calendar: {
        borderRadius: 12,
        padding: 10
    },
    feedbackButton: {
        backgroundColor: '#FF8C8C',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    feedbackButtonText: {
        color: '#4B0082',
        fontWeight: 'bold',
        fontSize: 18,
    },
    dateContainer: {
        alignItems: 'center',
    },
    weekView: {
        marginVertical: 20,
        paddingHorizontal: 10,
        alignItems: 'center',
        paddingTop: 50,
    },
    dateWrapper: {
        alignItems: 'center',
    },
    secondaryDateText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFC0CB',
        marginTop: 4,
    },
    daysRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 10,
    },
    dayContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        marginHorizontal: 5,
        borderRadius: 10,
        backgroundColor: '#2E004E',
        elevation: 3,
    },
    selectedDay: {
        borderColor: '#FFC0CB',
        borderWidth: 2,
    },
    currentDay: {
        backgroundColor: '#ff002d',
    },
    dayText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    subText: {
        fontSize: 12,
        color: '#FFC0CB',
    },
    weekHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 20,
        marginVertical: 10,
        backgroundColor: '#2E004E', // Add a subtle background for better design
        borderRadius: 12,
        padding: 10,
    },
    textContainer: {
        alignItems: 'center',
        flex: 1, // Ensure it takes up available space for alignment
    },
    primaryDateText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFC0CB',
    },
    weekContainer: {
        backgroundColor: '#FFC0CB', // Container background color
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginTop: 8,
        elevation: 3, // Add a subtle shadow
    },
    weekText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4B0082', // Text color contrasting with the container
    },
    navigationButton: {
        padding: 10,
    },

});