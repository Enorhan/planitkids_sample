// App.js
import React from 'react';
import { StyleSheet, View } from 'react-native';
import AppNavigator from './src/navigations/AppNavigator';
import { OccasionsProvider } from './src/context/OccasionsContext';

export default function App() {
    return (
        <OccasionsProvider>
            <View style={styles.container}>
                <AppNavigator />
            </View>
        </OccasionsProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
});