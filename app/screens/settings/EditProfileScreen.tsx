import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  ScrollView, 
  StyleSheet, 
  StatusBar, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  Image,
  Platform
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer'; 
import { COLORS, GRADIENTS } from '../../constants/colors';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { RootStackParamList } from '../../navigation/types';
import { Profile } from '../../types';

type EditProfileRouteProp = RouteProp<RootStackParamList, 'EditProfile'>;

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const route = useRoute<EditProfileRouteProp>();
  const { session, refreshProfile } = useAuth();

  // Check if we are in "Setup Mode" (New User)
  const isNewUser = route.params?.isNewUser || false;

  // State for form fields
  const [name, setName] = useState('');
  const [program, setProgram] = useState('');
  const [bio, setBio] = useState('');
  
  // Image State
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
  const [avatarExtension, setAvatarExtension] = useState<string | null>(null);

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showProgramDropdown, setShowProgramDropdown] = useState(false);

  const programs = [
    'BS Computer Engineering',
    'BS Computer Science',
    'BS Information Technology',
    'BS Software Engineering',
    'BS Information Systems',
  ];

  useEffect(() => {
    if (session?.user) {
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      if (!session?.user) throw new Error('No user on the session!');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        // Safe casting to Central Profile Type
        const profileData = data as Profile;
        setName(profileData.full_name || '');
        setProgram(profileData.program || '');
        setBio(profileData.bio || '');
        setAvatarUrl(profileData.avatar_url || null);
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (isNewUser) return;
    navigation.goBack();
  };

  // ---------------------------------------------------------------------------
  // 2. FIXED IMAGE PICKER LOGIC (SDK 52+ Compatible)
  // ---------------------------------------------------------------------------
  const handleChangePhoto = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'We need access to your gallery to update your profile photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], 
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true, // Essential for uploading to Supabase
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setAvatarUrl(asset.uri); 
      setAvatarBase64(asset.base64 || null);
      
      const uriParts = asset.uri.split('.');
      const extension = uriParts[uriParts.length - 1];
      setAvatarExtension(extension || 'jpg');
    }
  };

  // ---------------------------------------------------------------------------
  // 3. UPLOAD LOGIC
  // ---------------------------------------------------------------------------
  const uploadAvatar = async () => {
    if (!avatarBase64 || !session?.user) return null;

    try {
      const ext = avatarExtension || 'jpg';
      const fileName = `${session.user.id}/${Date.now()}.${ext}`;

      // Convert Base64 -> ArrayBuffer -> Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, decode(avatarBase64), {
          contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
      return data.publicUrl;

    } catch (error) {
      console.log('Upload error:', error);
      throw error;
    }
  };

  const handleSaveChanges = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    if (!program) {
      Alert.alert('Error', 'Please select a program');
      return;
    }

    try {
      setIsSaving(true);
      if (!session?.user) throw new Error('No user on the session!');

      let finalAvatarUrl = avatarUrl;

      // Only upload if a NEW photo was picked
      if (avatarBase64) {
        const uploadedUrl = await uploadAvatar();
        if (uploadedUrl) finalAvatarUrl = uploadedUrl;
      }

      const updates = {
        id: session.user.id,
        full_name: name,
        program: program,
        bio: bio,
        avatar_url: finalAvatarUrl,
        updated_at: new Date(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);

      if (error) throw error;

      await refreshProfile();

      if (!isNewUser) {
        Alert.alert('Success', 'Profile updated!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }

    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', error.message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const selectProgram = (selectedProgram: string) => {
    setProgram(selectedProgram);
    setShowProgramDropdown(false);
  };

  const bioLength = bio.length;
  const maxBioLength = 200;

  const getInitials = () => {
    if (!name) return 'JL';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        {!isNewUser ? (
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#1F2937" />
          </TouchableOpacity>
        ) : (
          <View style={styles.backButton} />
        )}

        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Photo */}
        <View style={styles.photoSection}>
          <TouchableOpacity 
            style={styles.avatarContainer} 
            onPress={handleChangePhoto}
            activeOpacity={0.8}
          >
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <LinearGradient
                colors={GRADIENTS.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatarPlaceholder}
              >
                <Text style={styles.avatarText}>{getInitials()}</Text>
              </LinearGradient>
            )}
            <View style={styles.cameraButton}>
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Name Input */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Name</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="John Lawrence Villamor"
              placeholderTextColor="#D1D5DB"
            />
          </View>
        </View>

        {/* Program Dropdown */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Program</Text>
          <TouchableOpacity
            style={styles.dropdownContainer}
            onPress={() => setShowProgramDropdown(!showProgramDropdown)}
            activeOpacity={0.7}
          >
            <Ionicons name="school-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
            <Text style={[styles.dropdownText, !program && { color: '#D1D5DB' }]}>
              {program || 'BS Computer Engineering'}
            </Text>
            <Ionicons 
              name={showProgramDropdown ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#9CA3AF" 
            />
          </TouchableOpacity>

          {showProgramDropdown && (
            <View style={styles.dropdownMenu}>
              {programs.map((prog, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dropdownItem,
                    prog === program && styles.dropdownItemSelected,
                    index === programs.length - 1 && { borderBottomWidth: 0 }
                  ]}
                  onPress={() => selectProgram(prog)}
                >
                  <Text style={[
                    styles.dropdownItemText,
                    prog === program && styles.dropdownItemTextSelected
                  ]}>
                    {prog}
                  </Text>
                  {prog === program && (
                    <Ionicons name="checkmark" size={18} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Bio Input */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Bio</Text>
          <View style={styles.textAreaContainer}>
            <Ionicons name="list-outline" size={20} color="#9CA3AF" style={styles.textAreaIcon} />
            <TextInput
              style={styles.textArea}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us about yourself..."
              placeholderTextColor="#D1D5DB"
              multiline
              maxLength={maxBioLength}
              textAlignVertical="top"
            />
          </View>
          <View style={styles.bioFooter}>
            <Text style={styles.bioHint}>Tip: Clubs, interests, campus favorites</Text>
            <Text style={[
              styles.bioCounter,
              bioLength > maxBioLength * 0.9 && styles.bioCounterWarning
            ]}>
              {bioLength}/{maxBioLength}
            </Text>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSaveChanges}
          disabled={isSaving}
          activeOpacity={0.8}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight! + 12 : 50,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '800',
    color: COLORS.textLight,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    height: '100%',
  },
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
  },
  dropdownText: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
  },
  dropdownMenu: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginTop: 8,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemSelected: {
    backgroundColor: '#F0F9FF',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#1F2937',
  },
  dropdownItemTextSelected: {
    fontWeight: '600',
    color: COLORS.primary,
  },
  textAreaContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 120,
  },
  textAreaIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  textArea: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    minHeight: 90,
  },
  bioFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  bioHint: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  bioCounter: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  bioCounterWarning: {
    color: '#F59E0B',
    fontWeight: '600',
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});