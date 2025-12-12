import { supabase } from './supabase';
import * as FileSystem from 'expo-file-system/legacy'; 

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;

export type ReactionType = 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';

export const PostService = {
  /**
   * Uploads file using native FileSystem upload (No OOM errors for large files).
   */
  async uploadFile(uri: string, userId: string, mimeType: string, extension: string) {
    if (!SUPABASE_URL) {
        throw new Error('Supabase configuration missing');
    }

    // 1. Get the User's Session Token (CRITICAL FIX)
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
        throw new Error('User not authenticated. Cannot upload.');
    }

    // 2. Prepare Path: userID/timestamp.extension
    const fileName = `${userId}/${Date.now()}.${extension}`;
    // Ensure the URL matches your Supabase project structure exactly
    const targetUrl = `${SUPABASE_URL}/storage/v1/object/post_attachments/${fileName}`;

    // 3. Native Upload with User Token
    const response = await FileSystem.uploadAsync(targetUrl, uri, {
        httpMethod: 'POST',
        uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
        headers: {
            // FIX: Use the User's Token, not the Anon Key
            Authorization: `Bearer ${session.access_token}`, 
            'Content-Type': mimeType,
        },
    });

    // 4. Handle Result
    if (response.status !== 200) {
        console.error('Upload failed:', response.body);
        throw new Error('Failed to upload file to storage.');
    }

    // 5. Get Public URL
    const { data: urlData } = supabase.storage
      .from('post_attachments')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  },

  /**
   * Creates a new post with optional file attachment.
   */
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

    // 1. Upload Attachment if exists
    if (attachment) {
      fileUrl = await this.uploadFile(attachment.uri, userId, attachment.mimeType, attachment.extension);
      fileType = attachment.type;
      fileName = attachment.name; // Capture the original name
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
        file_name: fileName,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // --- Existing Interaction Methods ---

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

  async addComment(postId: string, userId: string, content: string) {
    const { data, error } = await supabase.from('comments').insert({ post_id: postId, user_id: userId, content }).select('*, profiles(*)').single();
    if (error) throw error;
    return data;
  },

  async getComments(postId: string) {
    const { data, error } = await supabase.from('comments').select('*, profiles(*)').eq('post_id', postId).order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  }
};