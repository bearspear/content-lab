import { TimelineEvent } from './timeline-event.model';

export interface TimelineState {
  events: TimelineEvent[];
  scale: 'days';  // Phase 1 only supports days
  zoom: number;   // 1.0 = 100%
  panX: number;   // Horizontal pan offset
}

// Helper function to create sample events
function createSampleEvents(): TimelineEvent[] {
  const today = new Date();
  return [
    {
      id: 'sample-1',
      date: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      title: 'Project Started',
      description: 'Initial project kickoff meeting',
      color: '#667eea'
    },
    {
      id: 'sample-2',
      date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      title: 'First Milestone',
      description: 'Completed initial planning phase',
      color: '#43e97b'
    },
    {
      id: 'sample-3',
      date: today,
      title: 'Current Status',
      description: 'Development in progress',
      color: '#f093fb'
    },
    {
      id: 'sample-4',
      date: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      title: 'Next Deadline',
      description: 'Feature completion target',
      color: '#fa709a'
    }
  ];
}

export const DEFAULT_TIMELINE_STATE: TimelineState = {
  events: createSampleEvents(),
  scale: 'days',
  zoom: 1.0,
  panX: 0
};
