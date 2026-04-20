import { useEffect, useRef, useCallback } from 'react';
import type { BroadcastEvent, User } from '../types';

const CHANNEL_NAME = 'flowa-collab';

export function useCollaboration(
  currentUser: User,
  onEvent: (event: BroadcastEvent) => void
) {
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channelRef.current = channel;

    channel.onmessage = (e) => {
      const event: BroadcastEvent = e.data;
      if (event.userId !== currentUser.id) {
        onEvent(event);
      }
    };

    // Announce join
    channel.postMessage({
      type: 'join',
      userId: currentUser.id,
      payload: currentUser,
    } as BroadcastEvent);

    return () => {
      channel.postMessage({
        type: 'leave',
        userId: currentUser.id,
        payload: {},
      } as BroadcastEvent);
      channel.close();
    };
  }, [currentUser.id]);

  const broadcast = useCallback((type: BroadcastEvent['type'], payload: any) => {
    channelRef.current?.postMessage({
      type,
      userId: currentUser.id,
      payload,
    } as BroadcastEvent);
  }, [currentUser.id]);

  return { broadcast };
}
