import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../../supabaseClient';

export default function DailyRoleSelectionScreen({ navigation }) {
    const [loading, setLoading] = useState(false);

    const updateRole = async (role) => {
        setLoading(true);
        try {
            const { data: authData, error: authError } = await supabase.auth.getUser();
            if (authError) throw new Error(authError.message);

            const { error } = await supabase
                .from('users')
                .update({ role })
                .eq('id', authData.user.id);
            if (error) throw new Error(error.message);

            navigation.replace('RoleSelection'); // Redirect after updating role
        } catch (err) {
            console.error('Error updating role:', err.message);
            Alert.alert('Error', 'Unable to update role. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>What is your role for the day?</Text>
            {loading ? (
                <ActivityIndicator size="large" color="#FFC0CB" />
            ) : (
                <>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => updateRole('fritidsledare')}
                    >
                        <Text style={styles.buttonText}>Fritidsledare</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => updateRole('fritidspersonal')}
                    >
                        <Text style={styles.buttonText}>Fritidspersonal</Text>
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#4B0082',
        padding: 20,
    },
    title: {
        fontSize: 24,
        color: 'pink',
        marginBottom: 40,
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: '#FFC0CB', // Sticker-like pastel color
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 50, // Rounded edges for sticker shape
        marginVertical: 10,
        width: '80%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5, // For Android shadow
        borderWidth: 2,
        borderColor: '#FF69B4', // Contrasting border
    },
    buttonText: {
        color: '#4B0082',
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'Poppins_600SemiBold', // Choose a playful font if available
        textShadowColor: '#FFB6C1', // Subtle shadow for text
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
});