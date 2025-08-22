'use client'

import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import Personalize from '@contentstack/personalize-edge-sdk'
import { Sdk } from '@contentstack/personalize-edge-sdk/dist/sdk'

const personalizeConfiguration: any = {
    uid: '',
    audiences: {},
    taxonomy_path: ''
}

// Create a context that captures the initialized state, personalization SDK instance, and personalizeConfig
const PersonalizationContext = createContext({
    isInitialized: false,
    personalizationSDK: undefined as Sdk | undefined,
    personalizeConfig: personalizeConfiguration
})

// Create a hook to use the Personalization context
export const usePersonalization = () => {
    return useContext(PersonalizationContext)
}

// Create a provider component to wrap the application with the Personalization context
export function PersonalizationProvider({ children }: { children: ReactNode }): React.ReactElement {

    const [personalizeConfig, setPersonalizeConfig] = useState<any | undefined>()

    const [isInitialized, setIsInitialized] = useState<boolean>(false)

    const [personalizationSDK, setPersonalizationSDK] = useState<Sdk | undefined>()

    const initializePersonalizationSDK = async () => {
        try {
            // validates whether the CONTENTSTACK_PERSONALIZE_PROJECT_UID are present in .env.local file
            if (!process.env.NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID) {
                console.warn('NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID not found, skipping personalization')
                return
            }
            
            // validates whether the CONTENTSTACK_PERSONALIZE_EDGE_API_URL are present in .env.local file and sets the edge api url
            // if not present, the default edge api url will be used
            if (process.env.NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_BASE_URL) {
                Personalize.setEdgeApiUrl(process.env.NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_BASE_URL)
            }
            
            // initializes the personalize SDK with the project UID
            const personalize = await Personalize.init(
                process.env.NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID
            )

            // sets the personalize SDK instance in the state
            setPersonalizationSDK(personalize)
        }

        catch(e) {
            console.error('Personalization initialization failed:', e)
        }

    }

    // Fetch the Personalize Config from the CMS and set it in the state

    useEffect(() => {
        initializePersonalizationSDK().then(() => {
            setIsInitialized(true)
        })
    }, [])

    return (
        // Provide the Personalization context with the initialization status, initalized personalization SDK instance, and personalizeConfig
        <PersonalizationContext.Provider
            value={{ isInitialized, personalizationSDK: personalizationSDK, personalizeConfig: personalizeConfig! }}
        >
            {isInitialized && children}
        </PersonalizationContext.Provider>
    )
}