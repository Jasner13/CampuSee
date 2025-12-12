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
  DeviceEventEmitter,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Video, ResizeMode } from 'expo-av'; 
import { COLORS } from '../../constants/colors';
import { CATEGORIES, CategoryType } from '../../constants/categories';
import { PostService } from '../../lib/postService';
import { useAuth } from '../../contexts/AuthContext';
import PrimaryButton from '../../components/buttons/PrimaryButton';

const CATEGORY_UI: Record<string, { icon: string; color: string }> = {
  study:  { icon: '📚', color: '#667EEA' },
  items:  { icon: '🛍️', color: '#FBBF24' },
  events: { icon: '📅', color: '#E94B8B' },
  favors: { icon: '💬', color: '#7B68EE' },
  default:{ icon: '🔖', color: COLORS.primary },
};

// STRICT LIMIT: 50MB (Supabase Free Plan Limit)
const MAX_FILE_SIZE = 50 * 1024 * 1024; 

export default function CreatePostScreen() {
  const navigation = useNavigation();
  const { session } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('study');
  
  const [attachment, setAttachment] = useState<{
    uri: string;
    mimeType: string;
    extension: string;
    type: 'image' | 'video' | 'file';
    name: string;
    size?: number;
  } | null>(null);

  const [loading, setLoading] = useState(false);

  // Helper to Validate Size
  const validateSize = (size?: number) => {
    if (size && size > MAX_FILE_SIZE) {
      Alert.alert(
        "File too large", 
        `The File Limit is 50MB. Your file is ${(size / (1024 * 1024)).toFixed(1)}MB. Please trim it or choose a smaller file.`
      );
      return false;
    }
    return true;
  };

  const pickMedia = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "Access to gallery is needed.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All, 
      // ENABLE EDITING: Allows user to trim video to fit size limit
      allowsEditing: true, 
      quality: 0.5, 
      // COMPRESSION: Request lower quality video to save space
      videoQuality: ImagePicker.UIImagePickerControllerQualityType.Medium,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      
      // Check Size (if available)
      if (!validateSize(asset.fileSize)) return;

      const type = asset.type === 'video' ? 'video' : 'image';
      const uriParts = asset.uri.split('.');
      const extension = uriParts[uriParts.length - 1];
      
      // Default mime types
      const mimeType = type === 'video' ? 'video/mp4' : 'image/jpeg';

      setAttachment({
        uri: asset.uri,
        mimeType: asset.mimeType || mimeType,
        extension: extension,
        type: type,
        name: type === 'video' ? 'Video Attachment' : 'Image Attachment',
        size: asset.fileSize
      });
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets) {
        const file = result.assets[0];
        
        // Check Size
        if (!validateSize(file.size)) return;

        const nameParts = file.name.split('.');
        const extension = nameParts.length > 1 ? nameParts.pop()! : 'bin';

        setAttachment({
          uri: file.uri,
          mimeType: file.mimeType || 'application/octet-stream',
          extension: extension,
          type: 'file',
          name: file.name,
          size: file.size
        });
      }
    } catch (err) {
      console.log('Document picker error', err);
      Alert.alert("Error", "Failed to pick document.");
    }
  };

  const handleAttachmentPress = () => {
    Alert.alert(
      "Add Attachment",
      "Choose the type of file you want to upload",
      [
        { text: "Photo or Video", onPress: pickMedia },
        { text: "Document / File", onPress: pickDocument },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSelectedCategory('study');
    setAttachment(null);
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
      // Pass the attachment object directly (PostService handles the rest)
      await PostService.createPost(
        session.user.id,
        title,
        description,
        selectedCategory,
        attachment 
      );

      DeviceEventEmitter.emit('post_updated');
      resetForm(); 
      
      Alert.alert('Success', 'Post created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      
    } catch (error: any) {
      console.error('Create post error:', error);
      let msg = error.message || 'Failed to create post.';
      
      // Helpful error mapping
      if (msg.includes('413')) msg = 'File is too large (Limit: 50MB).';
      if (msg.includes('Network')) msg = 'Network error. Check your connection.';
      
      Alert.alert('Upload Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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

        {/* Categories */}
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
                    isSelected && { color: ui.color }
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

        {/* Attachment */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Attachment</Text>
          
          {attachment ? (
            <View style={styles.attachmentPreview}>
              <View style={styles.fileInfo}>
                {attachment.type === 'image' ? (
                   <Image source={{ uri: attachment.uri }} style={styles.thumbImage} />
                ) : attachment.type === 'video' ? (
                   <View style={styles.thumbVideo}>
                      <Video
                        source={{ uri: attachment.uri }}
                        style={{ width: '100%', height: '100%', borderRadius: 8 }}
                        resizeMode={ResizeMode.COVER}
                        shouldPlay={false}
                        isMuted={true}
                      />
                      <View style={styles.playIconOverlay}>
                        <Ionicons name="play" size={20} color="#FFF" />
                      </View>
                   </View>
                ) : (
                   <View style={styles.thumbIcon}>
                      <Ionicons name="document-text" size={24} color={COLORS.primary} />
                   </View>
                )}
                <View style={{flex: 1, marginLeft: 12}}>
                    <Text style={styles.fileName} numberOfLines={1}>{attachment.name}</Text>
                    <View style={{flexDirection: 'row', gap: 8}}>
                        <Text style={styles.fileType}>{attachment.type.toUpperCase()}</Text>
                        {attachment.size && (
                            <Text style={styles.fileType}>{(attachment.size / (1024*1024)).toFixed(1)} MB</Text>
                        )}
                    </View>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.removeButton} 
                onPress={() => setAttachment(null)}
              >
                <Ionicons name="close" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.attachmentBox} 
              onPress={handleAttachmentPress} 
              activeOpacity={0.7}
            >
              <View style={styles.attachmentIconContainer}>
                <Ionicons name="cloud-upload-outline" size={32} color={COLORS.primary} />
              </View>
              <Text style={styles.attachmentTitle}>Add Attachment</Text>
              <Text style={styles.attachmentSubtitle}>Photo, Video, or Document</Text>
              <View style={styles.browseButton}>
                <Text style={styles.browseButtonText}>Browse</Text>
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
  categoryChip: {
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24, 
    backgroundColor: '#F1F5F9',
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  categoryChipSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: COLORS.primary,
  },
  categoryIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  categoryText: { 
    fontSize: 15,
    fontWeight: '600', 
    color: COLORS.textSecondary 
  },
  attachmentBox: {
    backgroundColor: '#F8FAFC', 
    borderWidth: 2,
    borderColor: '#E2E8F0', 
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  attachmentIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EEF2FF', 
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
    backgroundColor: COLORS.primary, 
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  browseButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  attachmentPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  thumbImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  thumbVideo: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#000',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIconOverlay: {
    position: 'absolute',
    opacity: 0.8,
  },
  thumbIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  fileType: {
    fontSize: 12,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  removeButton: {
    padding: 8,
  },
  footer: { marginTop: 20, marginBottom: 80 },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});