import { supabase } from './supabase';
import { decode } from 'base64-arraybuffer';

export type ReactionType = 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';

export const PostService = {
  /**
   * Uploads an image (base64) to Supabase Storage and returns the public URL.
   */
  async uploadImage(base64Data: string, userId: string) {
    // Unique path: userID/timestamp.jpg
    const fileName = `${userId}/${Date.now()}.jpg`; 
    
    const { data, error } = await supabase.storage
      .from('post_attachments')
      .upload(fileName, decode(base64Data), {
        contentType: 'image/jpeg',
      });

    if (error) throw error;

    // Get the Public URL
    const { data: urlData } = supabase.storage
      .from('post_attachments')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  },

  /**
   * Creates a new post in the database.
   * Handles image upload internally if provided.
   */
  async createPost(
    userId: string,
    title: string,
    description: string,
    category: string,
    imageBase64?: string | null
  ) {
    let fileUrl = null;
    let fileType = null;

    // 1. Upload Image if exists
    if (imageBase64) {
      fileUrl = await this.uploadImage(imageBase64, userId);
      fileType = 'image';
    }

    // 2. Insert Post Data
    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: userId,
        title,
        description,
        category,
        file_url: fileUrl,
        file_type: fileType,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // --- Existing Methods (Kept for compatibility) ---

  async toggleLike(postId: string, userId: string) {
    const { data: existing } = await supabase
      .from('post_likes')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      await supabase.from('post_likes').delete().match({ post_id: postId, user_id: userId });
      return null;
    } else {
      await supabase.from('post_likes').insert({ post_id: postId, user_id: userId, reaction_type: 'like' });
      return 'like';
    }
  },

  /**
   * Handles user reactions intelligently:
   * 1. If reaction exists and is same type -> Remove it (Toggle off)
   * 2. If reaction exists but different type -> Update it (Change reaction)
   * 3. If no reaction -> Insert new one
   */
  async handleReaction(postId: string, userId: string, reactionType: ReactionType = 'like') {
    // 1. Check if a reaction already exists for this user/post combo
    const { data: existing, error: fetchError } = await supabase
      .from('post_likes')
      .select('reaction_type')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (existing) {
      if (existing.reaction_type === reactionType) {
        // Case 1: Same reaction clicked again -> Delete (Toggle Off)
        const { error } = await supabase
            .from('post_likes')
            .delete()
            .match({ post_id: postId, user_id: userId });
        if (error) throw error;
        return null; // Return null to indicate removed
      } else {
        // Case 2: Different reaction clicked -> Update (e.g., Like to Love)
        const { data, error } = await supabase
          .from('post_likes')
          .update({ reaction_type: reactionType })
          .match({ post_id: postId, user_id: userId })
          .select()
          .single();
        if (error) throw error;
        return data.reaction_type;
      }
    } else {
      // Case 3: No existing reaction -> Insert new one
      const { data, error } = await supabase
        .from('post_likes')
        .insert({ 
            post_id: postId, 
            user_id: userId, 
            reaction_type: reactionType 
        })
        .select()
        .single();
      if (error) throw error;
      return data.reaction_type;
    }
  },

  async addComment(postId: string, userId: string, content: string) {
    const { data, error } = await supabase
      .from('comments')
      .insert({ post_id: postId, user_id: userId, content })
      .select('*, profiles(*)') 
      .single();
    if (error) throw error;
    return data;
  },

  async getComments(postId: string) {
    const { data, error } = await supabase
      .from('comments')
      .select('*, profiles(*)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  }
};