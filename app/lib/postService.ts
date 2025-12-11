import { supabase } from './supabase';

export const PostService = {
  /**
   * Toggles a basic 'like'. If it exists, remove it. If not, add it.
   */
  async toggleLike(postId: string, userId: string) {
    // 1. Check if like exists
    const { data: existing } = await supabase
      .from('post_likes')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      // Unlike
      await supabase.from('post_likes').delete().match({ post_id: postId, user_id: userId });
      return null; // No reaction
    } else {
      // Like (default)
      await supabase.from('post_likes').insert({ post_id: postId, user_id: userId, reaction_type: 'like' });
      return 'like';
    }
  },

  /**
   * Sets a specific reaction (e.g., 'love', 'haha'). 
   * Uses upsert to handle both new reactions and changing existing ones.
   */
  async setReaction(postId: string, userId: string, reactionType: string) {
    const { data, error } = await supabase
      .from('post_likes')
      .upsert({ 
        post_id: postId, 
        user_id: userId, 
        reaction_type: reactionType 
      }, { onConflict: 'user_id, post_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async addComment(postId: string, userId: string, content: string) {
    const { data, error } = await supabase
      .from('comments')
      .insert({ post_id: postId, user_id: userId, content })
      .select('*, profiles(*)') // Return the comment with the user profile
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