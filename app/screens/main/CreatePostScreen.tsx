import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Image, 
  Alert,
  ActivityIndicator,
  DeviceEventEmitter
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../../constants/colors';
import { CATEGORIES, CategoryType } from '../../constants/categories';
import { PostService } from '../../lib/postService';
import { useAuth } from '../../contexts/AuthContext';
import PrimaryButton from '../../components/buttons/PrimaryButton';

// 1. UI Mapping to restore your original icons and colors
const CATEGORY_UI: Record<string, { icon: string; color: string }> = {
  study:  { icon: '📚', color: '#667EEA' },
  items:  { icon: '🛍️', color: '#FBBF24' },
  events: { icon: '📅', color: '#E94B8B' },
  favors: { icon: '💬', color: '#7B68EE' },
  default:{ icon: '🔖', color: COLORS.primary },
};

export default function CreatePostScreen() {
  const navigation = useNavigation();
  const { session } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('study');
  
  const [image, setImage] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "You need to allow access to your photos to upload an image.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5, 
      base64: true, 
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setImageBase64(result.assets[0].base64 || null);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSelectedCategory('study');
    setImage(null);
    setImageBase64(null);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Missing Fields', 'Please enter a title and description.');
      return;
    }

    if (!session?.user?.id) {
      Alert.alert('Error', 'You must be logged in to post.');
      return;
    }

    setLoading(true);

    try {
      await PostService.createPost(
        session.user.id,
        title,
        description,
        selectedCategory,
        imageBase64
      );

      // Notify Home to refresh
      DeviceEventEmitter.emit('post_updated');
      
      // 2. Clear the form BEFORE navigating away
      resetForm();

      Alert.alert('Success', 'Post created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      
    } catch (error: any) {
      console.error('Create post error:', error);
      Alert.alert('Error', error.message || 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Kept NEW Header (Arrow Back) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Post</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Title */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            placeholder="What's the topic?"
            placeholderTextColor={COLORS.textTertiary}
            value={title}
            onChangeText={setTitle}
            maxLength={60}
          />
        </View>

        {/* 2. Modified Category Section: Restored Icons & Colors */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesRow}>
            {CATEGORIES.filter(c => c.type !== 'all').map((cat) => {
              const ui = CATEGORY_UI[cat.type] || CATEGORY_UI.default;
              const isSelected = selectedCategory === cat.type;
              
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setSelectedCategory(cat.type)}
                  style={[
                    styles.categoryChip,
                    isSelected && styles.categoryChipSelected
                  ]}
                >
                  <Text style={styles.categoryIcon}>{ui.icon}</Text>
                  <Text style={[
                    styles.categoryText,
                    isSelected && { color: ui.color } // Restore original color logic
                  ]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Share the details..."
            placeholderTextColor={COLORS.textTertiary}
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Attachment</Text>
          
          {image ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: image }} style={styles.imagePreview} />
              <TouchableOpacity 
                style={styles.removeImageButton} 
                onPress={() => { setImage(null); setImageBase64(null); }}
              >
                <Ionicons name="close" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.attachmentBox}
              onPress={pickImage}
              activeOpacity={0.7}
              disabled={loading}
            >
              <View style={styles.attachmentIconContainer}>
                {/* Changed from Emoji 📎 to Icon to match App Theme Color */}
                <Ionicons name="cloud-upload-outline" size={32} color={COLORS.primary} />
              </View>
              <Text style={styles.attachmentTitle}>Add Photo or File</Text>
              <Text style={styles.attachmentSubtitle}>Tap to browse</Text>
              <View style={styles.browseButton}>
                <Text style={styles.browseButtonText}>Browse Files</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.footer}>
          <PrimaryButton onPress={handleSubmit} disabled={loading} style={{ width: '100%' }}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Post</Text>}
          </PrimaryButton>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  content: { padding: 20 },
  inputGroup: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 8 },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  textArea: { height: 120 },
  categoriesRow: { flexDirection: 'row' },
  
  // Updated Chip Styles to match original look
  categoryChip: {
    flexDirection: 'row', // Added for icon
    alignItems: 'center', // Added for icon
    paddingHorizontal: 16,
    paddingVertical: 10, // Increased padding
    borderRadius: 24,    // More rounded
    backgroundColor: '#F1F5F9',
    marginRight: 12,     // Increased margin
    borderWidth: 1.5,    // Thicker border
    borderColor: COLORS.border,
  },
  categoryChipSelected: {
    backgroundColor: '#EEF2FF', // Keep selection background from new design (or adjust if needed)
    borderColor: COLORS.primary, // Keep selection border
  },
  categoryIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  categoryText: { 
    fontSize: 15, // Slightly larger
    fontWeight: '600', 
    color: COLORS.textSecondary 
  },
  categoryTextSelected: { 
    color: COLORS.primary 
  },

  // Restored Attachment Styles
  attachmentBox: {
    backgroundColor: '#F8FAFC', 
    borderWidth: 2,
    borderColor: '#E2E8F0', // Matches your input borders
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  attachmentIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EEF2FF', // Light Indigo (matches selected category theme)
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  attachmentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  attachmentSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  browseButton: {
    backgroundColor: COLORS.primary, // Changed from Green to App Primary Color
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  browseButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  imagePreviewContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  imagePreview: { width: '100%', height: '100%' },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: { marginTop: 20, marginBottom: 50 },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});