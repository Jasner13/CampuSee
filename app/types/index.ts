// app/types/index.ts

// 1. Database Row Types (Matching Supabase)
export interface Profile {
    id: string;
    email: string; // Changed from null to string since your trigger enforces it
    full_name: string | null;
    program: string | null;
    avatar_url: string | null;
    bio: string | null;
    settings: {
        new_messages: boolean;
        post_interactions: boolean;
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

// 2. View Types (For the Messages List)
export interface ConversationView {
    peer_id: string;
    last_message: string;
    time: string; // created_at from the view
    is_read: boolean;
    sender_id: string;
    receiver_id: string;
    // We will join this in the query
    profiles: {
        full_name: string | null;
        avatar_url: string | null;
    } | null;
}

// 3. Keep existing types if they are used elsewhere to prevent breaking UI
// (We can deprecate 'User' later if we fully switch to 'Profile')
export interface User {
    id: string;
    email: string;
    fullName: string;
    program: string;
    yearLevel: string;
    profilePhotoUrl?: string;
}