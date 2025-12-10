// app/navigation/MainNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from './types';
import { HomeFeedScreen } from '../screens/main/HomeFeedScreen';
import MessagesScreen from '../screens/main/MessagesScreen';
// Removed MessagesScreenChat from here (Moving to Stack)
import CreatePostScreen from '../screens/main/CreatePostScreen';
import NotificationsScreen from '../screens/main/NotificationsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import ChangePasswordScreen from '../screens/settings/ChangePasswordScreen';
import EditProfileScreen from '../screens/settings/EditProfileScreen';
// Removed PostDetailScreen from here (Moving to Stack)

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      id={undefined}
      screenOptions={{
        headerShown: false,
      }}
      tabBar={() => null} // Assuming you have a custom BottomNav component handling the UI
    >
      <Tab.Screen name="Home" component={HomeFeedScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      {/* MessagesChat removed from Tabs to allow full screen chat */}
      <Tab.Screen name="CreatePost" component={CreatePostScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
      <Tab.Screen name="EditProfile" component={EditProfileScreen} />
      <Tab.Screen name="ChangePassword" component={ChangePasswordScreen} />
      {/* PostDetails removed from Tabs to prevent duplication */}
    </Tab.Navigator>
  );
};