import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/fonts';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface UserProfileModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ visible, onClose, userId }) => {
  const { session } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (visible && userId) {
      fetchProfileAndFollowStatus();
    }
  }, [visible, userId]);

  const fetchProfileAndFollowStatus = async () => {
    setLoading(true);
    try {
      // Fetch Profile
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      setProfile(profileData);

      // Check Follow Status
      if (session?.user) {
        const { count } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', session.user.id)
          .eq('following_id', userId);
        
        setIsFollowing(count ? count > 0 : false);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!session?.user) return;
    setFollowLoading(true);
    
    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', session.user.id)
          .eq('following_id', userId);
        if (error) throw error;
        setIsFollowing(false);
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: session.user.id,
            following_id: userId
          });
        if (error) throw error;
        setIsFollowing(true);
        
        // Optional: Send Notification
        await supabase.from('notifications').insert({
            user_id: userId,
            actor_id: session.user.id,
            type: 'follow',
            title: 'New Follower',
            content: 'started following you.'
        });
      }
    } catch (err) {
      Alert.alert('Error', 'Could not update follow status.');
    } finally {
      setFollowLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
             <Ionicons name="close" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>

          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
          ) : profile ? (
            <>
              <Image 
                source={{ uri: profile.avatar_url || 'https://via.placeholder.com/100' }} 
                style={styles.avatar} 
              />
              <Text style={styles.name}>{profile.full_name}</Text>
              <Text style={styles.program}>{profile.program || 'Student'}</Text>
              <Text style={styles.bio}>{profile.bio || 'No bio available.'}</Text>

              {session?.user?.id !== userId && (
                  <TouchableOpacity 
                    style={[styles.followButton, isFollowing && styles.followingButton]} 
                    onPress={handleFollowToggle}
                    disabled={followLoading}
                  >
                    <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
                        {isFollowing ? 'Following' : 'Follow'}
                    </Text>
                  </TouchableOpacity>
              )}
            </>
          ) : (
            <Text>User not found</Text>
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
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  program: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  bio: {
    fontSize: 14,
    color: COLORS.textTertiary,
    textAlign: 'center',
    marginBottom: 24,
  },
  followButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 20,
  },
  followingButton: {
    backgroundColor: COLORS.backgroundLight,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  followButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  followingButtonText: {
    color: COLORS.primary,
  },
});