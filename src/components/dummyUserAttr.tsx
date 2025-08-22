'use client'

import { usePersonalization } from '../../lib/personlizeContext';
import { useEffect } from 'react';



export default function DummyUserAttr() {
    const { personalizationSDK } = usePersonalization();
    useEffect(() => {
        personalizationSDK?.set({preferred_activity_type: "tours"})
    }, [personalizationSDK])
    return <div></div>;
}