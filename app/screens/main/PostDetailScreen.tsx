// app/screens/main/PostDetailScreen.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, StatusBar, TouchableOpacity, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { GRADIENTS, COLORS } from '../../constants/colors';

// Updated to 'PostDetails'
type PostDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PostDetails'>;
type PostDetailScreenRouteProp = RouteProp<RootStackParamList, 'PostDetails'>;

interface Reply {
  id: string;
  authorName: string;
  authorInitials: string;
  timestamp: string;
  label: string;
  content: string;
}

const MOCK_REPLIES: Reply[] = [
  {
    id: '1',
    authorName: 'First Last',
    authorInitials: 'XX',
    timestamp: 'Just now',
    label: 'Label',
    content: 'This is a sample reply to the post.',
  },
];

export default function PostDetailScreen() {
  const navigation = useNavigation<PostDetailScreenNavigationProp>();
  const route = useRoute<PostDetailScreenRouteProp>();

  // Use the 'post' object passed via navigation
  const { post } = route.params;

  const [comment, setComment] = useState('');
  const [likes, setLikes] = useState(24);
  const [isLiked, setIsLiked] = useState(false);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleMore = () => {
    console.log('More options pressed');
  };

  const handleLike = () => {
    if (isLiked) {
      setLikes(likes - 1);
    } else {
      setLikes(likes + 1);
    }
    setIsLiked(!isLiked);
  };

  const handleSendPrivateMessage = () => {
    console.log('Send private message');
  };

  const handleSendComment = () => {
    if (comment.trim()) {
      console.log('Send comment:', comment);
      setComment('');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.7} onPress={handleBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Post</Text>

        <TouchableOpacity style={styles.moreButton} activeOpacity={0.7} onPress={handleMore}>
          <Text style={styles.moreIcon}>⋯</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Post Card */}
        <View style={styles.postCard}>
          {/* Author Info */}
          <View style={styles.authorSection}>
            <LinearGradient
              colors={GRADIENTS.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>{post.authorInitials}</Text>
            </LinearGradient>

            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>{post.authorName}</Text>
              <Text style={styles.timestamp}>{post.timestamp}</Text>
            </View>

            <View style={styles.labelBadge}>
              <Text style={styles.labelText}>{post.label}</Text>
            </View>
          </View>

          {/* Post Content */}
          <Text style={styles.postTitle}>{post.title}</Text>
          <Text style={styles.postDescription}>
            {post.description}
          </Text>

          {/* ... Rest of the file remains the same ... */}
          {/* Attachment */}
          <View style={styles.attachment}>
            <View style={styles.attachmentIcon}>
              <Text style={styles.attachmentIconText}>📄</Text>
            </View>
            <View style={styles.attachmentInfo}>
              <Text style={styles.attachmentName}>Hello.doc</Text>
              <Text style={styles.attachmentSize}>145.67 kb</Text>
            </View>
          </View>

          {/* Send Message Button */}
          <TouchableOpacity
            style={styles.messageButton}
            onPress={handleSendPrivateMessage}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={GRADIENTS.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.messageButtonGradient}
            >
              <Text style={styles.messageButtonIcon}>💬</Text>
              <Text style={styles.messageButtonText}>Send Private Message</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Interaction Stats */}
          <View style={styles.statsRow}>
            <TouchableOpacity
              style={styles.statItem}
              onPress={handleLike}
              activeOpacity={0.7}
            >
              <Text style={styles.statIcon}>{isLiked ? '❤️' : '🤍'}</Text>
              <Text style={styles.statNumber}>{likes}</Text>
            </TouchableOpacity>

            <View style={styles.statItem}>
              <Text style={styles.statIcon}>💬</Text>
              <Text style={styles.statNumber}>24</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statIcon}>👁️</Text>
              <Text style={styles.statNumber}>24</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statIcon}>🔖</Text>
              <Text style={styles.statNumber}>24</Text>
            </View>
          </View>
        </View>

        {/* Public Replies Section */}
        <View style={styles.repliesSection}>
          <Text style={styles.repliesTitle}>Public Replies (2)</Text>

          {MOCK_REPLIES.map((reply) => (
            <View key={reply.id} style={styles.replyCard}>
              <LinearGradient
                colors={GRADIENTS.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.replyAvatar}
              >
                <Text style={styles.replyAvatarText}>{reply.authorInitials}</Text>
              </LinearGradient>

              <View style={styles.replyContent}>
                <View style={styles.replyHeader}>
                  <Text style={styles.replyAuthorName}>{reply.authorName}</Text>
                  <View style={styles.replyLabelBadge}>
                    <Text style={styles.replyLabelText}>{reply.label}</Text>
                  </View>
                </View>
                <Text style={styles.replyTimestamp}>{reply.timestamp}</Text>
                <Text style={styles.replyText}>{reply.content}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Comment Input */}
        <View style={styles.commentSection}>
          <TextInput
            style={styles.commentInput}
            placeholder="Add a public comment..."
            placeholderTextColor={COLORS.textTertiary}
            value={comment}
            onChangeText={setComment}
            multiline
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSendComment}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={GRADIENTS.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sendButtonGradient}
            >
              <Text style={styles.sendButtonIcon}>➤</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
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
  moreButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreIcon: {
    fontSize: 24,
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  postCard: {
    backgroundColor: COLORS.backgroundLight,
    padding: 20,
    marginBottom: 2,
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textLight,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  labelBadge: {
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  labelText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.success,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  postDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  attachment: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  attachmentIcon: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.primary + '20',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  attachmentIconText: {
    fontSize: 20,
  },
  attachmentInfo: {
    flex: 1,
  },
  attachmentName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  attachmentSize: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  messageButton: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  messageButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  messageButtonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  messageButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statIcon: {
    fontSize: 18,
  },
  statNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  repliesSection: {
    backgroundColor: COLORS.backgroundLight,
    padding: 20,
    marginBottom: 2,
  },
  repliesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  replyCard: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  replyAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  replyAvatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textLight,
  },
  replyContent: {
    flex: 1,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  replyAuthorName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginRight: 8,
  },
  replyLabelBadge: {
    backgroundColor: COLORS.textTertiary + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  replyLabelText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textTertiary,
  },
  replyTimestamp: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  replyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  commentSection: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.backgroundLight,
    padding: 20,
    gap: 12,
  },
  commentInput: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.textPrimary,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  sendButtonGradient: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonIcon: {
    fontSize: 18,
    color: COLORS.textLight,
  },
});