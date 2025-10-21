export interface TimelineEvent {
  id: string;
  date: Date;
  title: string;
  description?: string;
  category?: string;
  color?: string;
  icon?: string;
  // Positioning (calculated)
  x?: number;
  y?: number;
  position?: 'top' | 'bottom';
}
