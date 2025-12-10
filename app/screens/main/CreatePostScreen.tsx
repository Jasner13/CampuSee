import React, { useState } from 'react';
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
  Image 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import * as DocumentPicker from 'expo-document-picker';
// CHANGED: Import from 'legacy' to fix SDK 54 deprecation error
import * as FileSystem from 'expo-file-system/legacy'; 
import { decode } from 'base64-arraybuffer';
import type { MainTabParamList } from '../../navigation/types';
import { COLORS } from '../../constants/colors';
import { supabase } from '../../lib/supabase';

type CreatePostScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'CreatePost'>;

type CategoryOption = 'study' | 'items' | 'events' | 'favors';

interface Category {
  type: CategoryOption;
  label: string;
  icon: string;
  color: string;
}

const CATEGORIES: Category[] = [
  { type: 'study', label: 'Study', icon: '📚', color: '#667EEA' },
  { type: 'items', label: 'Items', icon: '🛍️', color: '#FBBF24' },
  { type: 'events', label: 'Events', icon: '📅', color: '#E94B8B' },
  { type: 'favors', label: 'Favors', icon: '💬', color: '#7B68EE' },
];

export default function CreatePostScreen() {
  const navigation = useNavigation<CreatePostScreenNavigationProp>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryOption | null>(null);
  
  // State for file handling
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCancel = () => {
    navigation.navigate('Home');
  };

  const handleBrowseFiles = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*', // Allow all file types
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
      }
    } catch (err) {
      console.warn('Error picking file:', err);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const uploadFile = async (userId: string): Promise<string | null> => {
    if (!selectedFile) return null;

    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Read file as Base64 using the legacy FileSystem API
      // We use the string literal 'base64' to avoid TypeScript errors with the enum
      const base64 = await FileSystem.readAsStringAsync(selectedFile.uri, {
        encoding: 'base64',
      });

      // Decode Base64 to ArrayBuffer
      const arrayBuffer = decode(base64);

      // Upload ArrayBuffer to Supabase
      const { error: uploadError } = await supabase.storage
        .from('post_attachments')
        .upload(filePath, arrayBuffer, {
          contentType: selectedFile.mimeType ?? 'application/octet-stream',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('post_attachments')
        .getPublicUrl(filePath);

      return data.publicUrl;

    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  };

  const handlePost = async () => {
    // 1. Validation
    if (!title.trim() || !description.trim()) {
      Alert.alert('Missing Fields', 'Please enter a title and description.');
      return;
    }
    if (!selectedCategory) {
      Alert.alert('Category Required', 'Please select a category for your post.');
      return;
    }

    setLoading(true);

    try {
      // 2. Get User
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        Alert.alert('Error', 'You must be logged in to post.');
        return;
      }

      // 3. Upload File (if exists)
      let fileUrl = null;
      if (selectedFile) {
        fileUrl = await uploadFile(user.id);
      }

      // 4. Insert Post into Database
      const { error: insertError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim(),
          category: selectedCategory,
          file_url: fileUrl,
          // You might want to store file_type if needed for rendering logic later
          // file_type: selectedFile?.mimeType 
        });

      if (insertError) throw insertError;

      // 5. Success
      Alert.alert('Success', 'Post created successfully!', [
        { text: 'OK', onPress: () => navigation.navigate('Home') }
      ]);

    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong while creating the post.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.cancelButton} activeOpacity={0.7}>
          <Text style={styles.cancelIcon}>✕</Text>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Create Post</Text>
        
        <TouchableOpacity 
          onPress={handlePost} 
          style={[styles.postButton, loading && styles.postButtonDisabled]}
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading ? (
             <ActivityIndicator color={COLORS.textLight} size="small" />
          ) : (
             <Text style={styles.postButtonText}>Post</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter title"
            placeholderTextColor={COLORS.lightGray}
            value={title}
            onChangeText={setTitle}
            editable={!loading}
          />
        </View>

        {/* Description Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter description"
            placeholderTextColor={COLORS.lightGray}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            editable={!loading}
          />
        </View>

        {/* Category Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((category) => {
              const isSelected = selectedCategory === category.type;
              
              return (
                <TouchableOpacity
                  key={category.type}
                  style={[
                    styles.categoryChip,
                    isSelected && styles.categoryChipSelected,
                  ]}
                  onPress={() => setSelectedCategory(category.type)}
                  activeOpacity={0.7}
                  disabled={loading}
                >
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  <Text 
                    style={[
                      styles.categoryLabel,
                      isSelected && { color: category.color }
                    ]}
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Attachment Section */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Attachment</Text>
          
          {!selectedFile ? (
            <TouchableOpacity 
              style={styles.attachmentBox}
              onPress={handleBrowseFiles}
              activeOpacity={0.7}
              disabled={loading}
            >
              <View style={styles.attachmentIconContainer}>
                <Text style={styles.attachmentIcon}>📎</Text>
              </View>
              <Text style={styles.attachmentTitle}>Add Photo or File</Text>
              <Text style={styles.attachmentSubtitle}>Tap to browse or drag and drop</Text>
              <View style={styles.browseButton}>
                <Text style={styles.browseButtonText}>Browse Files</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.selectedFileContainer}>
              <View style={styles.fileInfo}>
                <Text style={styles.fileIcon}>📄</Text>
                <View style={styles.fileDetails}>
                   <Text style={styles.fileName} numberOfLines={1}>{selectedFile.name}</Text>
                   <Text style={styles.fileSize}>
                     {(selectedFile.size ? selectedFile.size / 1024 / 1024 : 0).toFixed(2)} MB
                   </Text>
                </View>
              </View>
              <TouchableOpacity onPress={removeFile} style={styles.removeFileButton}>
                <Text style={styles.removeFileText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
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
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancelIcon: {
    fontSize: 20,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginRight: 4,
  },
  cancelText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  postButton: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  postButtonDisabled: {
    opacity: 0.6,
  },
  postButtonText: {
    color: COLORS.textLight,
    fontSize: 16,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.backgroundLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.backgroundLight,
    marginRight: 12,
    marginBottom: 12,
  },
  categoryChipSelected: {
    borderColor: COLORS.faintGray,
    backgroundColor: COLORS.background,
  },
  categoryIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  categoryLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.mediumGray,
  },
  attachmentBox: {
    backgroundColor: COLORS.backgroundLight,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  attachmentIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  attachmentIcon: {
    fontSize: 28,
  },
  attachmentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 4,
    marginBottom: 4,
  },
  attachmentSubtitle: {
    fontSize: 13,
    color: COLORS.mediumGray,
    marginBottom: 12,
  },
  browseButton: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  browseButtonText: {
    color: COLORS.textLight,
    fontSize: 15,
    fontWeight: '700',
  },
  // New Styles for Selected File
  selectedFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.backgroundLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fileIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  removeFileButton: {
    padding: 8,
    marginLeft: 8,
  },
  removeFileText: {
    fontSize: 18,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
});