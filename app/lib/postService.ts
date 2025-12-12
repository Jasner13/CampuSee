// app/lib/postService.ts
import { supabase } from './supabase';
import * as FileSystem from 'expo-file-system/legacy'; 

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;

export type ReactionType = 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';

// Manual constant for Binary Content upload (1 = BINARY_CONTENT)
const UPLOAD_TYPE_BINARY = 1;

export const PostService = {
  /**
   * Uploads file using native FileSystem upload.
   */
  async uploadFile(uri: string, userId: string, mimeType: string, extension: string) {
    if (!SUPABASE_URL) throw new Error('Supabase configuration missing');

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error('User not authenticated.');

    const fileName = `${userId}/${Date.now()}.${extension}`;
    const targetUrl = `${SUPABASE_URL}/storage/v1/object/post_attachments/${fileName}`;

    // Use FileSystem.uploadAsync with the manual constant
    // NOTE: Using legacy FileSystem for uploadAsync support
    const response = await FileSystem.uploadAsync(targetUrl, uri, {
        httpMethod: 'POST',
        uploadType: UPLOAD_TYPE_BINARY as any, 
        headers: {
            Authorization: `Bearer ${session.access_token}`, 
            'Content-Type': mimeType,
        },
    });

    if (response.status !== 200) {
        console.error('Upload failed:', response.body);
        throw new Error('Failed to upload file to storage.');
    }

    const { data: urlData } = supabase.storage
      .from('post_attachments')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  },

  async createPost(
    userId: string,
    title: string,
    description: string,
    category: string,
    attachment?: { uri: string; mimeType: string; extension: string; type: 'image' | 'video' | 'file'; name: string } | null
  ) {
    let fileUrl = null;
    let fileType = null;
    let fileName = null;

    if (attachment) {
      fileUrl = await this.uploadFile(attachment.uri, userId, attachment.mimeType, attachment.extension);
      fileType = attachment.type;
      fileName = attachment.name;
    }

    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: userId,
        title,
        description,
        category,
        file_url: fileUrl,
        file_type: fileType, 
        file_name: fileName,
      })
      .select()
      .single();

    if (error) throw error;

    // --- EVENT NOTIFICATION LOGIC ---
    if (category === 'events' && data) {
        try {
            // 1. Fetch all other users
            const { data: allUsers } = await supabase
                .from('profiles')
                .select('id')
                .neq('id', userId);

            if (allUsers && allUsers.length > 0) {
                // 2. Prepare notifications payload
                const notifications = allUsers.map(user => ({
                    user_id: user.id, // The recipient
                    actor_id: userId, // The creator of the event
                    type: 'event',
                    title: 'New Event',
                    content: `posted a new event: "${title}"`,
                    resource_id: data.id, // <--- CRITICAL: Links notification to the post
                    is_read: false
                }));

                // 3. Bulk Insert
                await supabase.from('notifications').insert(notifications);
            }
        } catch (notifError) {
            console.error('Failed to send event notifications:', notifError);
            // Don't fail the post creation if notifications fail
        }
    }

    return data;
  },

  async handleReaction(postId: string, userId: string, reactionType: ReactionType = 'like') {
    const { data: existing, error: fetchError } = await supabase
      .from('post_likes')
      .select('reaction_type')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (existing) {
      if (existing.reaction_type === reactionType) {
        const { error } = await supabase.from('post_likes').delete().match({ post_id: postId, user_id: userId });
        if (error) throw error;
        return null;
      } else {
        const { data, error } = await supabase
          .from('post_likes')
          .update({ reaction_type: reactionType })
          .match({ post_id: postId, user_id: userId })
          .select().single();
        if (error) throw error;
        return data.reaction_type;
      }
    } else {
      const { data, error } = await supabase
        .from('post_likes')
        .insert({ post_id: postId, user_id: userId, reaction_type: reactionType })
        .select().single();
      if (error) throw error;
      return data.reaction_type;
    }
  },

  // UPDATED: Supports parentId for replies
  async addComment(postId: string, userId: string, content: string, parentId: string | null = null) {
    const { data, error } = await supabase
      .from('comments')
      .insert({ 
        post_id: postId, 
        user_id: userId, 
        content,
        parent_id: parentId 
      })
      .select('*, profiles(id, full_name, avatar_url, program)')
      .single();
      
    if (error) throw error;
    return data;
  },

  // NEW: Update existing comment
  async updateComment(commentId: string, content: string) {
    const { data, error } = await supabase
      .from('comments')
      .update({ content, is_edited: true }) 
      .eq('id', commentId)
      .select('*, profiles(id, full_name, avatar_url, program)')
      .single();

    if (error) throw error;
    return data;
  },
  
  // NEW: Delete comment
  async deleteComment(commentId: string) {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;
  },

  async getComments(postId: string) {
    const { data, error } = await supabase
      .from('comments')
      .select('*, profiles(id, full_name, avatar_url, program)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
      
    if (error) throw error;
    return data;
  }
};