import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Modal, Alert } from 'react-native';
import { supabase } from '../../supabaseClient';
import { MaterialIcons } from '@expo/vector-icons';

export default function Agenda({ navigation }) {
    const [role, setRole] = useState('');
    const [loading, setLoading] = useState(true);
    const [menuVisible, setMenuVisible] = useState(false);
    const [activities, setActivities] = useState([
        {
            activityType: "Pyssel",
            fromTime: "09:00",
            toTime: "11:00",
            where: "Room A",
            profilePictures: ["https://via.placeholder.com/60"],
            description: "Sample activity description.",
            photos: ["https://picsum.photos/200?random=1", "https://picsum.photos/200?random=2"],
        },
    ]);
    const [selectedActivityIndex, setSelectedActivityIndex] = useState(null);

    // Fetch user role from Supabase
    useEffect(() => {
        const fetchRole = async () => {
            try {
                const { data: authData, error: authError } = await supabase.auth.getUser();
                if (authError) throw new Error(authError.message);

                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('role')
                    .eq('id', authData.user.id)
                    .single();
                if (userError) throw new Error(userError.message);

                setRole(userData.role);
            } catch (error) {
                console.error('Error fetching user role:', error.message);
                Alert.alert('Error', 'Unable to fetch user role.');
                navigation.replace('Login'); // Redirect to login if fetching fails
            } finally {
                setLoading(false);
            }
        };

        fetchRole();
    }, [navigation]);

    const handleMenuOption = (option) => {
        setMenuVisible(false);
        if (option === 'Logout') {
            handleLogout();
        } else if (option === 'RoleSelection') {
            navigation.navigate('RoleSelection');
        } else if (option === 'AdminDashboard') {
            navigation.navigate('AdminDashboard');
        }
    };

    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw new Error(error.message);
            navigation.replace('Login'); // Redirect to login page
        } catch (err) {
            console.error('Logout Error:', err.message);
            Alert.alert('Error', 'Failed to log out. Please try again.');
        }
    };

    const menuOptions = () => {
        return (
            <>
                {/* Show 'Go to Role Selection' for fritidsledare and fritidspersonal */}
                {(role === 'fritidspersonal' || role === 'fritidsledare') && (
                    <TouchableOpacity
                        style={styles.modalOption}
                        onPress={() => handleMenuOption('RoleSelection')}
                    >
                        <Text style={styles.modalOptionText}>Go to Role Selection</Text>
                    </TouchableOpacity>
                )}
                {/* Show 'Go to Admin Dashboard' for admins */}
                {role === 'admin' && (
                    <TouchableOpacity
                        style={styles.modalOption}
                        onPress={() => handleMenuOption('AdminDashboard')}
                    >
                        <Text style={styles.modalOptionText}>Go to Admin Dashboard</Text>
                    </TouchableOpacity>
                )}
                {/* Show Logout Option */}
                <TouchableOpacity
                    style={styles.modalOption}
                    onPress={() => handleMenuOption('Logout')}
                >
                    <Text style={styles.modalOptionText}>Logout</Text>
                </TouchableOpacity>
                {/* Cancel Option */}
                <TouchableOpacity
                    style={[styles.modalOption, styles.cancelOption]}
                    onPress={() => setMenuVisible(false)}
                >
                    <Text style={styles.cancelOptionText}>Cancel</Text>
                </TouchableOpacity>
            </>
        );
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Menu Button */}
            <TouchableOpacity style={styles.menuButton} onPress={() => setMenuVisible(true)}>
                <MaterialIcons name="more-vert" size={28} color="#FFC0CB" />
            </TouchableOpacity>

            {/* Custom Modal for Menu Options */}
            {menuVisible && (
                <Modal
                    transparent={true}
                    animationType="fade"
                    visible={menuVisible}
                    onRequestClose={() => setMenuVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>{menuOptions()}</View>
                    </View>
                </Modal>
            )}

            <Text style={styles.title}>Agenda</Text>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {activities.map((activity, index) => (
                    <View key={index} style={styles.activityCard}>
                        <Text style={styles.activityType}>{activity.activityType}</Text>

                        <View style={styles.timeLocationContainer}>
                            <Text style={styles.label}>From: {activity.fromTime}</Text>
                            <Text style={styles.label}>To: {activity.toTime}</Text>
                            <Text style={styles.location}>Where: {activity.where}</Text>
                        </View>

                        <TouchableOpacity onPress={() => setSelectedActivityIndex(index)}>
                            <Text style={styles.descriptionText}>
                                {activity.description || "Tap to view description"}
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.profileIconsContainer}>
                            <Text style={styles.assignLabel}>Assigned Teachers:</Text>
                            <View style={styles.profileIcons}>
                                {activity.profilePictures.map((profile, i) => (
                                    <Image
                                        key={i}
                                        style={styles.profileIcon}
                                        source={{ uri: profile || 'https://via.placeholder.com/70?text=+' }}
                                    />
                                ))}
                            </View>
                        </View>

                        <ScrollView horizontal style={styles.photoScrollContainer}>
                            {activity.photos.map((photoUri, i) => (
                                <View key={i} style={styles.photoContainer}>
                                    <Image source={{ uri: photoUri }} style={styles.attachedPhoto} />
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                ))}
            </ScrollView>

            {/* Modal for Activity Description */}
            {selectedActivityIndex !== null && (
                <Modal visible={true} transparent={true} animationType="slide">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Activity Description</Text>
                            <Text style={styles.modalDescriptionText}>
                                {activities[selectedActivityIndex].description}
                            </Text>

                            <ScrollView horizontal style={styles.modalPhotoScroll}>
                                {activities[selectedActivityIndex].photos.map((photoUri, i) => (
                                    <Image key={i} source={{ uri: photoUri }} style={styles.modalAttachedPhoto} />
                                ))}
                            </ScrollView>

                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setSelectedActivityIndex(null)}
                            >
                                <Text style={styles.closeButtonText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            )}

            {/* Panda Button with Speech Bubble */}
            <View style={styles.footer}>
                <View style={styles.speechBubble}>
                    <Text style={styles.speechText}>Psst... wanna see the groups 👀</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate("GroupTrack")}>
                    <Image
                        source={require('../../assets/freepik__background__24274.png')} // Ensure this path is correct
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
    },
    menuButton: {
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
        paddingBottom: 120,
    },
    activityCard: {
        backgroundColor: '#2E004E',
        borderRadius: 10,
        padding: 16,
        marginBottom: 20,
        width: '90%',
    },
    activityType: {
        color: '#FFC0CB',
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 10,
    },
    timeLocationContainer: {
        marginBottom: 10,
    },
    label: {
        color: '#FFC0CB',
    },
    location: {
        color: '#FFC0CB',
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
    photoScrollContainer: {
        marginTop: 10,
    },
    photoContainer: {
        marginRight: 10,
    },
    attachedPhoto: {
        width: 100,
        height: 100,
        borderRadius: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: '#4B0082',
        padding: 20,
        borderRadius: 10,
        width: '80%',
    },
    modalOption: {
        backgroundColor: '#FFC0CB',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
    },
    modalOptionText: {
        color: '#4B0082',
        fontWeight: 'bold',
        fontSize: 16,
    },
    cancelOption: {
        backgroundColor: '#4B0082',
    },
    cancelOptionText: {
        color: '#FFC0CB',
        fontWeight: 'bold',
    },
    modalTitle: {
        color: '#FFC0CB',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    modalDescriptionText: {
        color: '#FFC0CB',
        marginBottom: 10,
    },
    modalPhotoScroll: {
        marginTop: 10,
        flexDirection: 'row',
    },
    modalAttachedPhoto: {
        width: 120,
        height: 120,
        borderRadius: 8,
        marginRight: 10,
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
        width: 200,
        height: 200,
    },
});