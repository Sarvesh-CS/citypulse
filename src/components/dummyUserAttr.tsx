'use client'

import { usePersonalization } from '../../lib/personlizeContext';
import { useEffect } from 'react';

declare global {
    interface Window {
      jstag: {
        send: (data: Record<string, unknown>) => void;
      };
    }
  }

export default function DummyUserAttr({activityType}: {activityType: string}) {
    // const { personalizationSDK } = usePersonalization();
    useEffect(() => {
        // personalizationSDK?.set({preferred_activity_type: activityType})
        window.jstag.send({ 
            preferred_activity_type: activityType,
          });
    }, [activityType])
    return <div></div>;
}