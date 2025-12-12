import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator,
  Image 
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
      setLikers([]); // Reset on close
    }
  }, [visible, postId]);

  const fetchLikers = async () => {
    if (!postId) return;
    setLoading(true);
    try {
      // Fetch users from post_likes table joined with profiles
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
        // Map the nested data structure to a flat array
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
        onClose(); // Close likes modal
        onUserPress && onUserPress(item.id); // Open profile modal
      }}
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
    </TouchableOpacity>
  );

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Likes</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.divider} />

          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
          ) : (
            <FlatList
              data={likers}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No likes yet.</Text>
              }
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    maxHeight: '70%',
    backgroundColor: 'white',
    borderRadius: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  closeButton: {
    padding: 4,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 50,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    width: '100%',
  },
  loader: {
    padding: 40,
  },
  listContent: {
    padding: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  avatarContainer: {
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  userProgram: {
    fontSize: 13,
    color: COLORS.textTertiary,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textTertiary,
    marginTop: 20,
    marginBottom: 20,
  }
});