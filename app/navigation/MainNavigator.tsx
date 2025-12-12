// app/navigation/MainNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from './types';
import { HomeFeedScreen } from '../screens/main/HomeFeedScreen';
import MessagesScreen from '../screens/main/MessagesScreen';
import CreatePostScreen from '../screens/main/CreatePostScreen';
import NotificationsScreen from '../screens/main/NotificationsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import ChangePasswordScreen from '../screens/settings/ChangePasswordScreen';
import EditProfileScreen from '../screens/settings/EditProfileScreen';
// Import your BottomNav
import BottomNav from '../components/BottomNav'; 

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      id={undefined}
      screenOptions={{
        headerShown: false,
        animation: 'fade', // Note: You might want 'none' to stop the content fading while nav stays still
      }}
      // 1. THIS IS THE KEY FIX:
      tabBar={(props) => <BottomNav {...props} />} 
    >
      <Tab.Screen name="Home" component={HomeFeedScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="CreatePost" component={CreatePostScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      
      {/* NOTE: Screens like Settings, EditProfile, etc., usually shouldn't 
         be in the Tab Navigator if you don't want the tab bar to show 
         on them. If they MUST be here, the tab bar will show. 
         Usually these go in a Stack Navigator. 
      */}
      <Tab.Screen name="Settings" component={SettingsScreen} />
      <Tab.Screen name="EditProfile" component={EditProfileScreen} />
      <Tab.Screen name="ChangePassword" component={ChangePasswordScreen} />
    </Tab.Navigator>
  );
};