// app/types/index.ts

export interface Profile {
    id: string;
    email: string | null;
    full_name: string | null;
    program: string | null;
    avatar_url: string | null;
    bio: string | null;
    settings: {
        replies_to_posts?: boolean;
        new_messages?: boolean;
        post_interactions?: boolean;
        active_status?: boolean; // <--- ADDED
        [key: string]: any;
    } | null;
    updated_at: string | null;
}

export interface Message {
    id: string;
    created_at: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    is_read: boolean;
}

export type NotificationType = 'like' | 'comment' | 'follow' | 'event' | 'announcement';

export interface Notification {
    id: string;
    created_at: string;
    user_id: string;
    actor_id: string | null;
    type: NotificationType;
    title: string | null;
    content: string | null;
    is_read: boolean;
    resource_id?: string | null;
    actor?: {
        full_name: string | null;
        avatar_url: string | null;
    };
}

export interface ConversationView {
    peer_id: string;
    last_message: string;
    time: string;
    is_read: boolean;
    sender_id: string;
    receiver_id: string;
    peer_name: string | null;
    peer_avatar: string | null;
}

export interface Post {
    id: string;
    created_at: string;
    user_id: string;
    title: string;
    description: string;
    category: string;
    file_url: string | null;
    file_type: string | null;
    file_name: string | null;
    profiles?: Profile;
    likes_count?: number;
    comments_count?: number;
}

export interface Comment {
    id: string;
    created_at: string;
    content: string;
    user_id: string;
    post_id: string;
    profiles?: Profile;
}