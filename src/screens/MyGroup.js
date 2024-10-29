// src/screens/MyGroup.js
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

export default function MyGroup() {
    // Sample data for students in each class
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
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [pendingSelection, setPendingSelection] = useState({}); // Temporarily holds selected students until added

    // Handle selecting a student from the dropdown
    const handleStudentSelect = (className, student) => {
        setPendingSelection({ ...pendingSelection, [className]: student });
    };

    // Handle adding a student to the selected list
    const addStudent = (className) => {
        const student = pendingSelection[className];
        setSelectedStudents([...selectedStudents, { name: student, class: className }]);

        setClassData({
            ...classData,
            [className]: classData[className].filter((s) => s !== student),
        });

        // Clear the pending selection after adding the student
        setPendingSelection({ ...pendingSelection, [className]: null });
    };

    // Handle removing a student from the selected list
    const removeStudent = (student) => {
        const { name, class: className } = student;
        setSelectedStudents(selectedStudents.filter((s) => s.name !== name));
        setClassData({
            ...classData,
            [className]: [...classData[className], name],
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>My Group (Fritidspersonal)</Text>

            {/* Selected Students Scrollable Box */}
            <View style={styles.selectedContainer}>
                <Text style={styles.subTitle}>Selected Students</Text>
                <ScrollView style={styles.selectedScroll}>
                    {selectedStudents.map((student, index) => (
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
                            style={[styles.picker, { color: '#FFC0CB' }]} // Pink text in Picker
                            onValueChange={(student) => handleStudentSelect(className, student)}
                        >
                            <Picker.Item label={`Select a student from ${className}`} value={null} color="#FFC0CB" />
                            {classData[className].map((student) => (
                                <Picker.Item label={student} value={student} key={student} color="#FFC0CB" /> // Pink color for each item
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
    title: {
        fontSize: 24,
        color: '#FFC0CB',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    selectedContainer: {
        backgroundColor: '#2E004E',
        borderRadius: 10,
        padding: 10,
        marginBottom: 20,
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
    picker: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 8,
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