import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from './types';
import { HomeFeedScreen } from '../screens/main/HomeFeedScreen';
import MessagesScreen from '../screens/main/MessagesScreen';
import MessagesScreenChat from '../screens/main/MessagesScreenChat';
import CreatePostScreen from '../screens/main/CreatePostScreen';
import NotificationsScreen from '../screens/main/NotificationsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import ChangePasswordScreen from '../screens/settings/ChangePasswordScreen';
import EditProfileScreen from '../screens/settings/EditProfileScreen';
import PostDetailScreen from '../screens/main/PostDetailScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
      tabBar={() => null}
    >
      <Tab.Screen name="Home" component={HomeFeedScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="MessagesChat" component={MessagesScreenChat} />
      <Tab.Screen name="CreatePost" component={CreatePostScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
      <Tab.Screen name="EditProfile" component={EditProfileScreen} />
      <Tab.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Tab.Screen name="PostDetails" component={PostDetailScreen} />
    </Tab.Navigator>
  );
};