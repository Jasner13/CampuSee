import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface SharePostModalProps {
  visible: boolean;
  onClose: () => void;
  post: any; // The post object being shared
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
        // Fetch profiles of people the current user follows
        const { data, error } = await supabase
            .from('follows')
            .select(`
                following_id,
                profile:profiles!follows_following_id_fkey (
                    id, full_name, avatar_url
                )
            `)
            .eq('follower_id', session!.user.id);

        if (error) throw error;
        
        // Flatten structure
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
        // Create a structured payload for the message
        const messagePayload = {
            type: 'share_post',
            postId: post.id,
            title: post.title,
            description: post.description,
            thumbnail: post.fileUrl // Optional: if you want to show a preview image
        };

        const content = JSON.stringify(messagePayload);
        
        // 1. Insert Message
        const { error } = await supabase.from('messages').insert({
            sender_id: session!.user.id,
            receiver_id: receiverId,
            content: content
        });

        if (error) throw error;
        Alert.alert("Sent", "Post shared successfully!");
    } catch (err) {
        Alert.alert("Error", "Failed to share post.");
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.userRow}>
        <Image source={{ uri: item.avatar_url || 'https://via.placeholder.com/40' }} style={styles.avatar} />
        <Text style={styles.name}>{item.full_name}</Text>
        <TouchableOpacity style={styles.sendButton} onPress={() => handleSend(item.id)}>
            <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
    </View>
  );

  if (!visible) return null;

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
            <View style={styles.header}>
                <Text style={styles.title}>Share to...</Text>
                <TouchableOpacity onPress={onClose}>
                    <Ionicons name="close" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
            </View>
            
            <FlatList
                data={following}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                ListEmptyComponent={<Text style={styles.emptyText}>You aren't following anyone yet.</Text>}
            />
        </View>
      </View>
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
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '60%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  name: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  sendText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginTop: 20,
  }
});