import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, StatusBar, TouchableOpacity, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '../../navigation/types';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/fonts';

type SettingsScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Settings'>;

export default function SettingsScreen() {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { logout } = useAuth();
  const [repliesToPosts, setRepliesToPosts] = useState(true);
  const [newMessages, setNewMessages] = useState(true);
  const [postInteractions, setPostInteractions] = useState(true);

  const handleBack = () => {
    navigation.navigate('Profile');
  };

  const handleEditProfile = () => {
    // Navigate to EditProfileScreen
    navigation.navigate('EditProfile' as any);
  };

  const handleChangePassword = () => {
    // Navigate to ChangePasswordScreen
    navigation.navigate('ChangePassword' as any);
  };

  const handleHelpSupport = () => {
    console.log('Help & Support pressed');
  };

  const handleTermsOfService = () => {
    console.log('Terms of Service pressed');
  };

  const handlePrivacyPolicy = () => {
    console.log('Privacy Policy pressed');
  };

  const handleLogOut = () => {
    logout();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.7} onPress={handleBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Settings</Text>
        
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACCOUNT</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={handleEditProfile}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>👤</Text>
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Edit Profile</Text>
              <Text style={styles.settingDescription}>Update your name and photo</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={handleChangePassword}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>🔒</Text>
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Change Password</Text>
              <Text style={styles.settingDescription}>Keep your account secure</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>💬</Text>
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Replies to my posts</Text>
              <Text style={styles.settingDescription}>Get notified when someone replies</Text>
            </View>
            <Switch
              value={repliesToPosts}
              onValueChange={setRepliesToPosts}
              trackColor={{ false: COLORS.border, true: COLORS.success }}
              thumbColor={COLORS.backgroundLight}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>✉️</Text>
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>New messages</Text>
              <Text style={styles.settingDescription}>Get notified about new messages</Text>
            </View>
            <Switch
              value={newMessages}
              onValueChange={setNewMessages}
              trackColor={{ false: COLORS.border, true: COLORS.success }}
              thumbColor={COLORS.backgroundLight}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>❤️</Text>
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Post interactions</Text>
              <Text style={styles.settingDescription}>Likes and comments on your posts</Text>
            </View>
            <Switch
              value={postInteractions}
              onValueChange={setPostInteractions}
              trackColor={{ false: COLORS.border, true: COLORS.success }}
              thumbColor={COLORS.backgroundLight}
            />
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ABOUT</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={handleHelpSupport}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>❓</Text>
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Help & Support</Text>
              <Text style={styles.settingDescription}>FAQs and contact options</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={handleTermsOfService}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>📄</Text>
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Terms of Service</Text>
              <Text style={styles.settingDescription}>Read our terms and conditions</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={handlePrivacyPolicy}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>🛡️</Text>
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Privacy Policy</Text>
              <Text style={styles.settingDescription}>How we protect your data</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Log Out Button */}
        <TouchableOpacity 
          style={styles.logOutButton}
          onPress={handleLogOut}
          activeOpacity={0.8}
        >
          <Text style={styles.logOutIcon}>🚪</Text>
          <Text style={styles.logOutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: COLORS.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: COLORS.textPrimary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textTertiary,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  chevron: {
    fontSize: 24,
    color: COLORS.textTertiary,
    marginLeft: 8,
  },
  logOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    marginHorizontal: 20,
    marginTop: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  logOutIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  logOutText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textLight,
  },
});