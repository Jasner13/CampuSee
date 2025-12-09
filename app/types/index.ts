// app/types/index.ts

// 1. Database Row Types
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

// 2. View Types
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