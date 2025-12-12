// app/components/modals/SharePostModal.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, Alert, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/fonts';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar } from '../Avatar';

interface SharePostModalProps {
  visible: boolean;
  onClose: () => void;
  post: any;
}

export const SharePostModal: React.FC<SharePostModalProps> = ({ visible, onClose, post }) => {
  const { session } = useAuth();
  const [following, setFollowing] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible && session?.user) {
      fetchFollowing();
    }
  }, [visible]);

  const fetchFollowing = async () => {
    setLoading(true);
    try {
        const { data, error } = await supabase
            .from('follows')
            .select(`
                following_id,
                profile:profiles!follows_following_id_fkey (
                    id, full_name, avatar_url, program
                )
            `)
            .eq('follower_id', session!.user.id);

        if (error) throw error;
        
        const users = data.map((item: any) => item.profile);
        setFollowing(users);
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  const handleSend = async (receiverId: string) => {
    try {
        const messagePayload = {
            type: 'share_post',
            postId: post.id,
            title: post.title,
            description: post.description,
            thumbnail: post.fileUrl
        };

        const content = JSON.stringify(messagePayload);
        
        const { error } = await supabase.from('messages').insert({
            sender_id: session!.user.id,
            receiver_id: receiverId,
            content: content
        });

        if (error) throw error;
        Alert.alert("Sent", "Post shared successfully!");
        onClose();
    } catch (err) {
        Alert.alert("Error", "Failed to share post.");
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.userRow}>
        <View style={styles.userInfo}>
            <Avatar 
                avatarUrl={item.avatar_url} 
                initials={item.full_name ? item.full_name.substring(0,2).toUpperCase() : "??"} 
                size="small" 
            />
            <View style={styles.textContainer}>
                <Text style={styles.name}>{item.full_name}</Text>
                <Text style={styles.program}>{item.program || 'Student'}</Text>
            </View>
        </View>
        <TouchableOpacity style={styles.sendButton} onPress={() => handleSend(item.id)}>
            <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
    </View>
  );

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
            <View style={styles.handleBarContainer}>
                <View style={styles.handleBar} />
            </View>

            <View style={styles.header}>
                <Text style={styles.title}>Share to...</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Ionicons name="close" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
            </View>
            
            <View style={styles.divider} />

            <FlatList
                data={following}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="people-outline" size={48} color={COLORS.faintGray} />
                        <Text style={styles.emptyText}>You aren't following anyone yet.</Text>
                    </View>
                }
            />
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
    height: '65%',
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
  title: {
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
  listContent: {
      padding: 20,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  textContainer: {
      marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: FONTS.bold,
  },
  program: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  sendText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FONTS.bold,
  },
  emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 40,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginTop: 12,
    fontFamily: FONTS.regular,
  }
});