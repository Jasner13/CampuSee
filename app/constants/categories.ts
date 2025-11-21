export type CategoryType = 'all' | 'study' | 'items' | 'events' | 'favors';

export const CATEGORIES = [
  { id: 'all', label: 'All', type: 'all' as CategoryType },
  { id: 'study', label: 'Study', type: 'study' as CategoryType },
  { id: 'items', label: 'Items', type: 'items' as CategoryType },
  { id: 'events', label: 'Events', type: 'events' as CategoryType },
  { id: 'favors', label: 'Favors', type: 'favors' as CategoryType },
] as const;
