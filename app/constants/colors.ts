// CampuSee Color Palette
export const COLORS = {
    // Primary Colors
    primary: '#667EEA',
    primaryDark: '#5568D3',
    secondary: '#764BA2',

    // Accent Colors
    accent: '#FBBF24',
    accentDark: '#F59E0B',

    // Text Colors
    textPrimary: '#1E293B',
    textSecondary: '#64748B',
    textTertiary: '#94A3B8',
    textLight: '#FFFFFF',

    // Background Colors
    background: '#F8FAFC',
    backgroundLight: '#FFFFFF',

    // UI Colors
    border: '#E2E8F0',
    faintGray: '#D3DEE8',
    mediumGray: '#64748B',
    lightGray: '#94A3B8',

    // Status Colors
    success: '#10B981',
    error: '#EF4444',
} as const;

// Gradient definitions - properly typed for LinearGradient
export const GRADIENTS = {
    primary: ['#667EEA', '#764BA2'] as const,
    accent: ['#FBBF24', '#F59E0B'] as const,
} as const;
