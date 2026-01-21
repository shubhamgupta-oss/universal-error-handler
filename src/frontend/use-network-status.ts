/**
 * NETWORK STATUS HOOK - Monitor online/offline status
 */

import { useState, useEffect } from 'react';
import { ErrorCode } from '../shared';
import { UIMessageMapper } from './ui-message-mapper';

export interface UseNetworkStatusReturn {
  isOnline: boolean;
  offlineMessage: string;
}

export function useNetworkStatus(): UseNetworkStatusReturn {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    offlineMessage: UIMessageMapper.getMessage(ErrorCode.OFFLINE),
  };
}
