import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../constants/colors';

import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import SettingsScreen from '../screens/settings/SettingsScreen';
import EditProfileScreen from '../screens/settings/EditProfileScreen';
import ChangePasswordScreen from '../screens/settings/ChangePasswordScreen';
import PostDetailScreen from '../screens/main/PostDetailScreen';
import MessagesScreenChat from '../screens/main/MessagesScreenChat';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, profile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      id={undefined} // RESTORED THIS LINE
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : !profile?.full_name ? (
        <Stack.Screen 
          name="SetupProfile" 
          component={EditProfileScreen} 
          initialParams={{ isNewUser: true }}
          options={{ animation: 'fade', gestureEnabled: false }}
        />
      ) : (
        <>
          <Stack.Screen name="Main" component={MainNavigator} />
          
          <Stack.Screen
            name="PostDetails"
            component={PostDetailScreen}
            options={{ animation: 'slide_from_right' }}
          />

          <Stack.Screen 
            name="MessagesChat" 
            component={MessagesScreenChat} 
            options={{ animation: 'slide_from_right' }}
          />
          
          <Stack.Group
            screenOptions={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          >
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
          </Stack.Group>
        </>
      )}
    </Stack.Navigator>
  );
};