import { WorldType } from './globe-state.model';

export interface LocationPin {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  world: WorldType;
  description?: string;
  category?: string;
  color?: string;
  icon?: string;
  size?: 'small' | 'medium' | 'large';
  date?: string;
  metadata?: Record<string, any>;
}

export interface Connection {
  id: string;
  fromPinId: string;
  toPinId: string;
  color?: string;
  animated?: boolean;
  thickness?: number;
}

export function createDefaultPin(): Partial<LocationPin> {
  return {
    title: '',
    description: '',
    latitude: 0,
    longitude: 0,
    color: '#667eea',
    icon: '📍',
    size: 'medium',
    category: 'General'
  };
}
