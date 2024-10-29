// App.js
import React from 'react';
import { StyleSheet, View } from 'react-native';
import AppNavigator from './src/navigations/AppNavigator';

export default function App() {
    return (
        <View style={styles.container}>
            <AppNavigator />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff', // Keeping a simple white background for the app root
    },
});