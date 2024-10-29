// src/Navigations/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import your screens
import LoginScreen from '../screens/LoginScreen';
import RoleSelectionScreen from '../screens/RoleSelectionScreen';
import FritidsledareDashboard from '../screens/FritidsledareDashboard';
import WhatsToday from '../screens/WhatsToday';
import MyGroup from '../screens/MyGroup';

const Stack = createStackNavigator();

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Login">
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
                <Stack.Screen name="FritidsledareDashboard" component={FritidsledareDashboard} />
                <Stack.Screen name="WhatsToday" component={WhatsToday} />
                <Stack.Screen name="MyGroup" component={MyGroup} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}