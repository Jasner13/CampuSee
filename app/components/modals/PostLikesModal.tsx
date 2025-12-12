// app/components/modals/PostLikesModal.tsx
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator,
  Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/fonts';
import { supabase } from '../../lib/supabase';
import { Avatar } from '../Avatar';

interface PostLikesModalProps {
  visible: boolean;
  onClose: () => void;
  postId: string | null;
  onUserPress?: (userId: string) => void;
}

interface LikerProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  program: string | null;
}

export const PostLikesModal: React.FC<PostLikesModalProps> = ({ visible, onClose, postId, onUserPress }) => {
  const [likers, setLikers] = useState<LikerProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible && postId) {
      fetchLikers();
    } else {
      setLikers([]);
    }
  }, [visible, postId]);

  const fetchLikers = async () => {
    if (!postId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('post_likes')
        .select(`
          user_id,
          profiles:profiles!post_likes_user_id_fkey (
            id,
            full_name,
            avatar_url,
            program
          )
        `)
        .eq('post_id', postId);

      if (error) throw error;

      if (data) {
        const formattedData = data.map((item: any) => ({
            id: item.profiles.id,
            full_name: item.profiles.full_name,
            avatar_url: item.profiles.avatar_url,
            program: item.profiles.program
        }));
        setLikers(formattedData);
      }
    } catch (err) {
      console.error('Error fetching likers:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: LikerProfile }) => (
    <TouchableOpacity 
      style={styles.userItem} 
      onPress={() => {
        onClose();
        onUserPress && onUserPress(item.id);
      }}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
         <Avatar 
            initials={item.full_name ? item.full_name.substring(0,2).toUpperCase() : "??"} 
            avatarUrl={item.avatar_url} 
            size="small" 
         />
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.full_name}</Text>
        <Text style={styles.userProgram}>{item.program || 'Student'}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
    </TouchableOpacity>
  );

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
          
          {/* Handle Bar for visual affordance */}
          <View style={styles.handleBarContainer}>
            <View style={styles.handleBar} />
          </View>

          <View style={styles.header}>
            <Text style={styles.headerTitle}>Likes</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.divider} />

          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : (
            <FlatList
              data={likers}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <Ionicons name="heart-outline" size={48} color={COLORS.faintGray} />
                    <Text style={styles.emptyText}>No likes yet. Be the first!</Text>
                </View>
              }
            />
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.backgroundLight,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  handleBarContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: FONTS.bold,
  },
  closeButton: {
    padding: 8,
    backgroundColor: COLORS.background,
    borderRadius: 20,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    width: '100%',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 20,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  avatarContainer: {
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: FONTS.bold,
  },
  userProgram: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textTertiary,
    marginTop: 12,
    fontSize: 16,
    fontFamily: FONTS.regular,
  }
});