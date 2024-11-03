import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Sample data for colleagues and classes
const colleagues = [
    { email: "enes@northbyschool.com" },
    { email: "sara@northbyschool.com" },
    { email: "leo@northbyschool.com" },
];

// Extract the first name from email and format it
const getGroupName = (email) => {
    const name = email.split("@")[0];
    return `${name.charAt(0).toUpperCase() + name.slice(1)}'s Group`;
};

export default function MyGroup() {
    const navigation = useNavigation();
    const [selectedColleague, setSelectedColleague] = useState("myGroup");

    // Maintain separate selected student lists for each group
    const [groupSelections, setGroupSelections] = useState({
        myGroup: [],
        enes: [],
        sara: [],
        leo: []
    });

    // Initial data for available classes and students
    const initialClassData = {
        "F Klassen": ["Ali", "Sara", "Emma"],
        "Åk 1": ["Hasan", "Lina", "Eli"],
        "Åk 2": ["Oscar", "Mia", "Nora"],
        "Åk 3": ["Leo", "Sofia", "Max"],
        "Åk 4": ["Ella", "Tom", "Lucas"],
        "Åk 5": ["Olivia", "Hugo", "Liam"],
        "Åk 6": ["Freja", "Victor", "Stina"],
        "Rest": ["Extra Student 1", "Extra Student 2"]
    };

    const [classData, setClassData] = useState(initialClassData);
    const [pendingSelection, setPendingSelection] = useState({});

    const getUnavailableStudents = () => {
        return Object.keys(groupSelections).reduce((acc, groupKey) => {
            if (groupKey !== selectedColleague) {
                acc.push(...groupSelections[groupKey].map((s) => s.name));
            }
            return acc;
        }, []);
    };

    const getAvailableStudents = (className) => {
        const unavailableStudents = getUnavailableStudents();
        return classData[className].filter((student) => !unavailableStudents.includes(student));
    };

    const handleStudentSelect = (className, student) => {
        setPendingSelection({ ...pendingSelection, [className]: student });
    };

    const addStudent = (className) => {
        const student = pendingSelection[className];
        const updatedGroupSelections = {
            ...groupSelections,
            [selectedColleague]: [...groupSelections[selectedColleague], { name: student, class: className }]
        };
        setGroupSelections(updatedGroupSelections);

        setClassData({
            ...classData,
            [className]: classData[className].filter((s) => s !== student),
        });

        setPendingSelection({ ...pendingSelection, [className]: null });
    };

    const removeStudent = (student) => {
        const { name, class: className } = student;
        const updatedGroupSelections = {
            ...groupSelections,
            [selectedColleague]: groupSelections[selectedColleague].filter((s) => s.name !== name)
        };
        setGroupSelections(updatedGroupSelections);

        setClassData({
            ...classData,
            [className]: [...classData[className], name],
        });
    };

    return (
        <View style={styles.container}>
            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <MaterialIcons name="arrow-back" size={24} color="#FFC0CB" />
            </TouchableOpacity>

            {/* Title and Dropdown to Select Colleague's Group */}
            <View style={styles.header}>
                <Text style={styles.title}>
                    {selectedColleague === "myGroup" ? "My Group" : getGroupName(selectedColleague)}
                </Text>
                <Picker
                    selectedValue={selectedColleague}
                    onValueChange={(value) => setSelectedColleague(value)}
                    style={styles.picker}
                    dropdownIconColor="#FFC0CB"
                >
                    <Picker.Item label="My Group" value="myGroup" color="#FFC0CB" />
                    {colleagues.map((colleague) => (
                        <Picker.Item
                            label={getGroupName(colleague.email)}
                            value={colleague.email.split("@")[0]}
                            key={colleague.email}
                            color="#FFC0CB"
                        />
                    ))}
                </Picker>
            </View>

            {/* Selected Students */}
            <View style={styles.selectedContainer}>
                <Text style={styles.subTitle}>Selected Students</Text>
                <ScrollView style={styles.selectedScroll}>
                    {groupSelections[selectedColleague].map((student, index) => (
                        <View key={index} style={styles.studentItem}>
                            <Text style={styles.studentText}>{student.name} ({student.class})</Text>
                            <TouchableOpacity onPress={() => removeStudent(student)} style={styles.removeButton}>
                                <Text style={styles.removeButtonText}>Remove</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>
            </View>

            {/* Class Dropdowns */}
            <ScrollView style={styles.dropdownContainer}>
                {Object.keys(classData).map((className) => (
                    <View key={className} style={styles.classSection}>
                        <Text style={styles.classTitle}>{className}</Text>
                        <Picker
                            selectedValue={pendingSelection[className] || null}
                            style={[styles.picker, { color: '#FFC0CB' }]}
                            onValueChange={(student) => handleStudentSelect(className, student)}
                        >
                            <Picker.Item label={`Select a student from ${className}`} value={null} color="#FFC0CB" />
                            {getAvailableStudents(className).map((student) => (
                                <Picker.Item label={student} value={student} key={student} color="#FFC0CB" />
                            ))}
                        </Picker>

                        {/* Add button for selected student */}
                        {pendingSelection[className] && (
                            <TouchableOpacity
                                style={styles.addButton}
                                onPress={() => addStudent(className)}
                            >
                                <Text style={styles.addButtonText}>Add {pendingSelection[className]}</Text>
                            </TouchableOpacity>
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
    },
    backButton: {
        position: 'absolute',
        top: 40,
        left: 16,
        zIndex: 1,  // Ensure back button remains accessible
    },
    header: {
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 10,
    },
    title: {
        fontSize: 24,
        color: '#FFC0CB',
        fontWeight: 'bold',
        marginBottom: 10,
    },
    picker: {
        width: '90%',
        color: '#FFC0CB',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 8,
    },
    selectedContainer: {
        backgroundColor: '#2E004E',
        borderRadius: 10,
        padding: 10,
        marginVertical: 15,
    },
    subTitle: {
        fontSize: 18,
        color: '#FFC0CB',
        fontWeight: 'bold',
        marginBottom: 5,
    },
    selectedScroll: {
        maxHeight: 150,
    },
    studentItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#FFC0CB',
    },
    studentText: {
        color: '#FFC0CB',
        fontSize: 16,
    },
    removeButton: {
        backgroundColor: '#FFC0CB',
        padding: 5,
        borderRadius: 5,
    },
    removeButtonText: {
        color: '#4B0082',
        fontWeight: 'bold',
    },
    dropdownContainer: {
        flex: 1,
    },
    classSection: {
        marginBottom: 20,
    },
    classTitle: {
        color: '#FFC0CB',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    addButton: {
        backgroundColor: '#FFC0CB',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 5,
    },
    addButtonText: {
        color: '#4B0082',
        fontWeight: 'bold',
    },
});