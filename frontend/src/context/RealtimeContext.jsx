import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/common/Toast';

const RealtimeContext = createContext(null);

const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1')
  .replace(/\/api\/v1\/?$/, '');

export function RealtimeProvider({ children }) {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const subscribersRef = useRef(new Set());
  const { addToast } = useToast();

  useEffect(() => {
    let socketInstance = null;

    async function initSocket() {
      let token = null;
      try {
        const { data } = await supabase.auth.getSession();
        token = data?.session?.access_token || null;
      } catch (err) {
        console.warn('Failed to retrieve token for Socket.IO:', err);
      }

      socketInstance = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
      });

      socketRef.current = socketInstance;

      socketInstance.on('connect', () => {
        setIsConnected(true);
      });

      socketInstance.on('disconnect', () => {
        setIsConnected(false);
      });

      socketInstance.on('connect_error', () => {
        setIsConnected(false);
      });

      // Realtime Disaster Updated / Created Event
      socketInstance.on('disaster_updated', (data) => {
        const eventType = data?.event === 'created' ? 'New disaster incident reported' : 'Disaster information updated';
        addToast(eventType, 'info');

        // Notify active subscribers (e.g. Dashboard, Disaster List, Details page)
        subscribersRef.current.forEach((cb) => cb({ type: 'UPDATE', data }));
      });

      // Realtime Disaster Deleted Event
      socketInstance.on('disaster_deleted', (data) => {
        addToast('Disaster incident removed', 'info');

        subscribersRef.current.forEach((cb) => cb({ type: 'DELETE', data }));
      });
    }

    initSocket();

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, []);

  // Method for components to subscribe to live updates
  const subscribe = useCallback((callback) => {
    subscribersRef.current.add(callback);
    return () => {
      subscribersRef.current.delete(callback);
    };
  }, []);

  return (
    <RealtimeContext.Provider
      value={{
        isConnected,
        socket: socketRef.current,
        subscribe,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
}
