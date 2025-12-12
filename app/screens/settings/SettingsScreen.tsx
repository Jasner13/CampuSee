// app/screens/settings/SettingsScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, StatusBar, TouchableOpacity, Switch, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import type { MainTabParamList } from '../../navigation/types';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS } from '../../constants/colors';
import { supabase } from '../../lib/supabase';
import { Profile } from '../../types';

// Import Modals
import { HelpSupportModal } from '../../components/modals/HelpSupportModal';
import { TermsOfServiceModal } from '../../components/modals/TermsOfServiceModal';
import { PrivacyPolicyModal } from '../../components/modals/PrivacyPolicyModal';

type SettingsScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Settings'>;
type UserSettings = NonNullable<Profile['settings']>;

const DEFAULT_SETTINGS: UserSettings = {
  replies_to_posts: true,
  new_messages: true,
  post_interactions: true,
  active_status: true,
};

export default function SettingsScreen() {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { logout, session, refreshProfile } = useAuth();

  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isHelpVisible, setHelpVisible] = useState(false);
  const [isTermsVisible, setTermsVisible] = useState(false);
  const [isPrivacyVisible, setPrivacyVisible] = useState(false);

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
        setSettings({ ...DEFAULT_SETTINGS, ...data.settings });
      }
    } catch (error) {
      console.log('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSetting = async (key: keyof UserSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    if (!session?.user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ settings: newSettings })
        .eq('id', session.user.id);

      if (error) throw error;
      
      await refreshProfile(); 

    } catch (error) {
      Alert.alert('Error', 'Failed to save setting');
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

  // Open Modals
  const handleHelpSupport = () => {
    setHelpVisible(true);
  };

  const handleTermsOfService = () => {
    setTermsVisible(true);
  };

  const handlePrivacyPolicy = () => {
    setPrivacyVisible(true);
  };

  const handleLogOut = () => {
    logout();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.backgroundLight} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.7} onPress={handleBack}>
          <Feather name="arrow-left" size={24} color={COLORS.textPrimary} />
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
                <Feather name="user" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Edit Profile</Text>
                <Text style={styles.settingDescription}>Update your name and photo</Text>
              </View>
              <Feather name="chevron-right" size={20} color={COLORS.textTertiary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleChangePassword}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <Feather name="lock" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Change Password</Text>
                <Text style={styles.settingDescription}>Keep your account secure</Text>
              </View>
              <Feather name="chevron-right" size={20} color={COLORS.textTertiary} />
            </TouchableOpacity>
          </View>

          {/* Privacy Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PRIVACY</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.iconContainer}>
                <Feather name="activity" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Active Status</Text>
                <Text style={styles.settingDescription}>Show when you're active</Text>
              </View>
              <Switch
                value={settings.active_status !== false}
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
                <Feather name="message-square" size={20} color={COLORS.primary} />
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
                <Feather name="mail" size={20} color={COLORS.primary} />
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
                <Feather name="heart" size={20} color={COLORS.primary} />
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
                <Feather name="help-circle" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Help & Support</Text>
                <Text style={styles.settingDescription}>FAQs and contact options</Text>
              </View>
              <Feather name="chevron-right" size={20} color={COLORS.textTertiary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleTermsOfService}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <Feather name="file-text" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Terms of Service</Text>
                <Text style={styles.settingDescription}>Read our terms and conditions</Text>
              </View>
              <Feather name="chevron-right" size={20} color={COLORS.textTertiary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={handlePrivacyPolicy}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <Feather name="shield" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Privacy Policy</Text>
                <Text style={styles.settingDescription}>How we protect your data</Text>
              </View>
              <Feather name="chevron-right" size={20} color={COLORS.textTertiary} />
            </TouchableOpacity>
          </View>

          {/* Log Out Button */}
          <TouchableOpacity
            style={styles.logOutButton}
            onPress={handleLogOut}
            activeOpacity={0.8}
          >
            <View style={{ marginRight: 8 }}>
                <Feather name="log-out" size={20} color={COLORS.textLight} />
            </View>
            <Text style={styles.logOutText}>Log Out</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Modals */}
      <HelpSupportModal 
        visible={isHelpVisible} 
        onClose={() => setHelpVisible(false)} 
      />
      
      <TermsOfServiceModal 
        visible={isTermsVisible} 
        onClose={() => setTermsVisible(false)} 
      />

      <PrivacyPolicyModal 
        visible={isPrivacyVisible} 
        onClose={() => setPrivacyVisible(false)} 
      />
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
    paddingVertical: 12, 
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
  logOutText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textLight,
  },
});