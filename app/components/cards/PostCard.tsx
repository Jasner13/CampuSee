import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Avatar } from '../Avatar';
import { Chip } from '../Chip';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/fonts';

export interface Post {
  id: string;
  userId: string; 
  authorName: string;
  authorInitials: string;
  authorAvatarUrl?: string | null; // Added this field
  timestamp: string;
  label: string;
  title: string;
  description: string;
  category?: string; 
  fileUrl?: string | null; 
}

interface PostCardProps {
  post: Post;
  onPress?: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.container}>
      <View style={styles.top}>
        {/* Pass the avatarUrl here */}
        <Avatar 
          initials={post.authorInitials} 
          avatarUrl={post.authorAvatarUrl} 
          size="default" 
        />
        <View style={styles.nameMetadata}>
          <Text style={styles.authorName}>{post.authorName}</Text>
          <Text style={styles.timestamp}>{post.timestamp}</Text>
        </View>
        <View style={styles.labelContainer}>
          <Chip label={post.label} />
        </View>
      </View>
      <View style={styles.center}>
        <Text style={styles.title}>{post.title}</Text>
        <Text style={styles.description} numberOfLines={2} ellipsizeMode="tail">
          {post.description}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    gap: 20,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  nameMetadata: {
    flex: 1,
    gap: 4,
  },
  authorName: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
  },
  timestamp: {
    color: COLORS.textTertiary,
    fontSize: FONTS.sizes.md,
    fontWeight: '500',
  },
  labelContainer: {
    marginLeft: 'auto',
  },
  center: {
    gap: 12,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
  },
  description: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.md,
    fontWeight: '500',
    lineHeight: 22,
  },
});