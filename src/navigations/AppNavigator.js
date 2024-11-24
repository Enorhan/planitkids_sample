// src/Navigations/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import your screens
import LoginScreen from '../screens/LoginScreen';
import RoleSelectionScreen from '../screens/RoleSelectionScreen';
import FritidsledareDashboard from '../screens/FritidsledareDashboard';
import FritidspersonalDashboard from '../screens/FritidspersonalDashboard';
import WhatsToday from '../screens/WhatsToday';
import MyGroup from '../screens/MyGroup';
import TrackColleaguesGroups from '../screens/TrackColleaguesGroups';
import DailyActivities from '../screens/DailyActivities';
import Agenda from "../screens/Agenda";
import GroupTrack from "../screens/GroupTrack";
import BusDriverDashboard from '../screens/BusDriverDashboard';
import BusDetails from "../screens/BusDetails"; // Example // New import

const Stack = createStackNavigator();

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Login">
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
                <Stack.Screen name="FritidsledareDashboard" component={FritidsledareDashboard} />
                <Stack.Screen name="FritidspersonalDashboard" component={FritidspersonalDashboard} />
                <Stack.Screen name="Agenda" component={Agenda} />
                <Stack.Screen name="BusDriverDashboard" component={BusDriverDashboard} />
                <Stack.Screen name="BusDetails" component={BusDetails} />
                <Stack.Screen name="WhatsToday" component={WhatsToday} />
                <Stack.Screen name="MyGroup" component={MyGroup} />
                <Stack.Screen name="TrackColleaguesGroups" component={TrackColleaguesGroups} />
                <Stack.Screen name="DailyActivities" component={DailyActivities} />
                <Stack.Screen name="GroupTrack" component={GroupTrack} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}