import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, StatusBar, TouchableOpacity, Switch, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '../../navigation/types';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS } from '../../constants/colors';
import { supabase } from '../../lib/supabase';
import { Profile } from '../../types';

type SettingsScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Settings'>;
type UserSettings = NonNullable<Profile['settings']>;

const DEFAULT_SETTINGS: UserSettings = {
  replies_to_posts: true,
  new_messages: true,
  post_interactions: true,
  active_status: true, // Default to true
};

export default function SettingsScreen() {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { logout, session, refreshProfile } = useAuth(); // Import refreshProfile

  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch Settings on Load
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    if (!session?.user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('settings')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;

      if (data?.settings) {
        // Merge with defaults in case we add new keys later
        setSettings({ ...DEFAULT_SETTINGS, ...data.settings });
      }
    } catch (error) {
      console.log('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Generic Toggle Handler
  const toggleSetting = async (key: keyof UserSettings, value: boolean) => {
    // Optimistic Update: Update UI immediately
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    if (!session?.user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ settings: newSettings })
        .eq('id', session.user.id);

      if (error) throw error;
      
      // Refresh global profile so AuthContext knows about the change immediately
      await refreshProfile(); 

    } catch (error) {
      Alert.alert('Error', 'Failed to save setting');
      // Revert on error
      setSettings(settings);
    }
  };

  const handleBack = () => {
    navigation.navigate('Profile');
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile' as any);
  };

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword' as any);
  };

  const handleHelpSupport = () => {
    Alert.alert('Support', 'Contact us at support@campusee.edu');
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

      {isLoading ? (
        <View style={[styles.content, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
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

          {/* Privacy Section (New) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PRIVACY</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>🟢</Text>
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Active Status</Text>
                <Text style={styles.settingDescription}>Show when you're active</Text>
              </View>
              <Switch
                value={settings.active_status !== false} // Default true if undefined
                onValueChange={(val) => toggleSetting('active_status', val)}
                trackColor={{ false: COLORS.border, true: COLORS.success }}
                thumbColor={COLORS.backgroundLight}
              />
            </View>
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
                value={settings.replies_to_posts}
                onValueChange={(val) => toggleSetting('replies_to_posts', val)}
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
                value={settings.new_messages}
                onValueChange={(val) => toggleSetting('new_messages', val)}
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
                value={settings.post_interactions}
                onValueChange={(val) => toggleSetting('post_interactions', val)}
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
      )}
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