export const REALTIME_EVENTS = {
  DISASTER_UPDATED: 'disaster_updated',
  DISASTER_DELETED: 'disaster_deleted',
  CONNECTED: 'connected',
} as const;

export interface RealtimeDisasterUpdatePayload {
  event: 'created' | 'updated';
  disaster: {
    id: string;
    title: string;
    status: string;
    location: string | null;
    latitude: number | null;
    longitude: number | null;
    createdAt: Date | string;
    updatedAt: Date | string;
  };
}

export interface RealtimeDisasterDeletePayload {
  id: string;
}
