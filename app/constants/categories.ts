
export type CategoryType = 'all' | 'study' | 'items' | 'events' | 'favors';

export const CATEGORIES = [
  { id: 'all', label: 'All', type: 'all' as CategoryType },
  { id: 'study', label: 'Study', type: 'study' as CategoryType },
  { id: 'items', label: 'Items', type: 'items' as CategoryType },
  { id: 'events', label: 'Events', type: 'events' as CategoryType },
  { id: 'favors', label: 'Favors', type: 'favors' as CategoryType },
] as const;


export const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  study:  { bg: '#E6F7F5', text: '#00BFA5' },
  items:  { bg: '#FFF7ED', text: '#F59E0B' },
  events: { bg: '#FDF2F8', text: '#DB2777' },
  favors: { bg: '#EFF6FF', text: '#2563EB' },
  default:{ bg: '#F1F5F9', text: '#64748B' },
};

export const getCategoryStyle = (category: string = 'default') => {
  return CATEGORY_COLORS[category.toLowerCase()] || CATEGORY_COLORS.default;
};

export const getCategoryLabel = (category: string) => {
  const found = CATEGORIES.find(c => c.type === category.toLowerCase());
  return found ? found.label : category.charAt(0).toUpperCase() + category.slice(1);
};