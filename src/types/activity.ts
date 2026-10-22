export type ActivityEventType = 'INSERT' | 'UPDATE' | 'DELETE' | 'SYSTEM';

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  table: string;
  recordId?: string;
  itemName?: string;
  timestamp: string; // ISO string
  details?: string;
  source: 'realtime' | 'polling' | 'system';
  changes?: {
    field: string;
    oldValue?: any;
    newValue?: any;
  }[];
}
