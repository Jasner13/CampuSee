import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, StatusBar, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '../../navigation/types';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/fonts';

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

  const handleCancel = () => {
    navigation.navigate('Home');
  };

  const handlePost = () => {
    console.log('Creating post:', { title, description, selectedCategory });
    navigation.navigate('Home');
  };

  const handleBrowseFiles = () => {
    console.log('Browse files pressed');
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
          style={styles.postButton}
          activeOpacity={0.8}
        >
          <Text style={styles.postButtonText}>Post</Text>
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
          <TouchableOpacity 
            style={styles.attachmentBox}
            onPress={handleBrowseFiles}
            activeOpacity={0.7}
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
});