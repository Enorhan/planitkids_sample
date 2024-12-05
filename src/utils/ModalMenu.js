import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';

export default function ModalMenu({ visible, onClose, onSelect }) {
    return (
        <Modal
            transparent={true}
            animationType="fade"
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <TouchableOpacity
                        style={styles.modalOption}
                        onPress={() => onSelect("Logout")}
                    >
                        <Text style={styles.modalOptionText}>Logout</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.modalOption}
                        onPress={() => onSelect("RoleSelection")}
                    >
                        <Text style={styles.modalOptionText}>Go to Role Selection</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.modalOption, styles.cancelOption]}
                        onPress={onClose}
                    >
                        <Text style={styles.cancelOptionText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: '#4B0082',
        width: '80%',
        borderRadius: 10,
        padding: 20,
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
});