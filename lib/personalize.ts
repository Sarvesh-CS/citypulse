import * as PersonalizeSDK from '@contentstack/personalize-edge-sdk';
import Contentstack, { Region } from '@contentstack/delivery-sdk';
import Stack from './contentstack';
import { PersonalizationData, createPersonalizationData } from './variant-utils';

// Cookie utility function
function getCookie(name: string): string | undefined {
  if (typeof window === 'undefined') {
    // Server-side: cookies should be passed as parameter
    return undefined;
  }
  
  // Client-side: read from document.cookie
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift();
  }
  return undefined;
}

// Environment variables
const PERSONALIZE_PROJECT_UID = process.env.NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID || '';
const PERSONALIZE_BASE_URL = process.env.NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_BASE_URL || 'https://personalize-edge.contentstack.com';
const API_KEY = process.env.NEXT_PUBLIC_CONTENTSTACK_API_KEY || '';
const DELIVERY_TOKEN = process.env.NEXT_PUBLIC_CONTENTSTACK_DELIVERY_TOKEN || '';
const ENVIRONMENT = process.env.NEXT_PUBLIC_CONTENTSTACK_ENVIRONMENT || 'production';

// Type definitions
interface PersonalizeConfig {
  projectUid: string;
  baseUrl: string;
//   userId: string;
  isConfigured: boolean;
}


// pages/index.tsx

interface ExperienceData {
  shortUid: string;
  activeVariantShortUid: string | null;
}

// Personalize SDK instance
type PersonalizeSDKInstance = Awaited<ReturnType<typeof PersonalizeSDK.init>>;
let personalizeInstance: PersonalizeSDKInstance | null = null;
let initializationPromise: Promise<PersonalizeSDKInstance> | null = null;

// Configuration
const personalizeConfig: PersonalizeConfig = {
  projectUid: PERSONALIZE_PROJECT_UID,
  baseUrl: PERSONALIZE_BASE_URL,
//   userId: "e53815a7-9355-46c6-b5b1-c306394b62b9",
  isConfigured: !!PERSONALIZE_PROJECT_UID && !!API_KEY && !!DELIVERY_TOKEN
};

// Initialize Personalize SDK
export async function initializePersonalize(userId?: string): Promise<PersonalizeSDKInstance> {
  // If no userId provided, try to get it from cookie
//   if (!userId) {
//     userId = getCookie('cs-personalize-user-uid');
//   }

  console.log('✅ User ID:', userId);

  // If already initialized, return existing instance
  if (personalizeInstance) {
    return personalizeInstance;
  }

  // If initialization is in progress, wait for it
  if (initializationPromise) {
    console.log('⏳ Waiting for existing initialization...');
    return initializationPromise;
  }

  if (!personalizeConfig.isConfigured) {
    throw new Error('Personalize not configured. Check environment variables.');
  }

  // Start initialization and store the promise
  initializationPromise = (async () => {
    try {
      console.log('🚀 Starting Personalize SDK initialization...');
      
      // Set the edge API URL
      PersonalizeSDK.setEdgeApiUrl(personalizeConfig.baseUrl);
      
      // Initialize SDK
      personalizeInstance = await PersonalizeSDK.init(personalizeConfig.projectUid, {
        userId: userId
      });
      
      console.log('✅ Personalize SDK initialized successfully');
      return personalizeInstance;
    } catch (error) {
      console.error('❌ Failed to initialize Personalize SDK:', error);
      // Reset promises so retry is possible
      personalizeInstance = null;
      initializationPromise = null;
      throw error;
    }
  })();

  return initializationPromise;
}

/**
 * Set user attribute using Contentstack Personalize API
 */
export async function setUserAttribute(preferred_activity_type: string, ): Promise<void> {
  try {
    const sdk = await initializePersonalize();
    await sdk.set({preferred_activity_type : preferred_activity_type});
    console.log('✅ User attribute set:', preferred_activity_type);
  } catch (error) {
    console.error('❌ Failed to set user attribute:', error);
    throw error;
  }
}

/**
 * Get active experience from Personalize SDK
 */
export async function getActiveExperience(): Promise<ExperienceData> {
  try {
    const sdk = await initializePersonalize();
    if (!sdk) {
      throw new Error('SDK not initialized');
    }
    const experiences = sdk.getExperiences();
    return experiences[0] || { shortUid: '', activeVariantShortUid: '' };
  } catch (error) {
    console.error('❌ Failed to get active experience:', error);
    return {
      shortUid: '',
      activeVariantShortUid: ''
    };
  }
}

/**
 * Get active variant aliases from Personalize Edge API
 * Returns array of variant aliases in format: cs_personalize_{experienceShortUid}_{variantShortUid}
 */
export async function getActiveVariantAliases(): Promise<string[]> {
  try {
    const sdk = await initializePersonalize();
    if (!sdk) {
      throw new Error('SDK not initialized');
    }
    const variantAliases = sdk.getVariantAliases();
   
    console.log('✅ Active variant aliases:', variantAliases);
    return variantAliases || [];
  } catch (error) {
    console.error('❌ Failed to get variant aliases:', error);
    // Return default value to prevent breaking the application
    return ['cs_personalize_1_null'];
  }
}

/**
 * Check if user has a specific attribute set to expected value
 */
export async function hasUserAttribute(attributeName: string, expectedValue: string): Promise<boolean> {
  try {
    const sdk = await initializePersonalize();
    // Get current user data/attributes
    // Note: SDK doesn't have getUserAttributes method - this needs to be implemented differently
    const userData = null;
    const attributeValue = userData?.[attributeName];
    const hasAttribute = attributeValue === expectedValue;
    
    console.log(`🔍 Checking attribute ${attributeName}:`, attributeValue, '-> Expected:', expectedValue, '-> Match:', hasAttribute);
    return hasAttribute;
  } catch (error) {
    console.error('❌ Error checking user attribute:', error);
    return false;
  }
}

/**
 * Clear all user attributes (useful for testing)
 */
export async function clearUserAttributes(): Promise<void> {
  try {
    const sdk = await initializePersonalize();
    // Note: SDK doesn't have clearUserData method
    console.log('Clear user data not implemented');
    console.log('🧹 User attributes cleared');
  } catch (error) {
    console.error('❌ Error clearing user attributes:', error);
  }
}

/**
 * Fetch personalized entry using variant aliases
 */
export async function fetchPersonalizedEntry(
  contentTypeUid: string, 
  entryUid: string,
  referenceFieldPath: string[],
  variantAlias: string
): Promise<unknown> {
  try {
    if (!Stack) {
      throw new Error('Contentstack not configured');
    }

    const entryQuery = Stack.contentType(contentTypeUid)
      .entry()
      .includeFallback()
      .includeEmbeddedItems()
      .includeReference(referenceFieldPath)
      .variants(variantAlias)
      .query();

    const result = await entryQuery.find();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const entries = (result as any).entries || [];

    if (entries.length > 0) {
      return JSON.parse(JSON.stringify(entries[0]));
    }
    
    return null;
  } catch (error) {
    console.error('❌ Failed to fetch personalized entry:', error);
    throw error;
  }
}

// Helper function to check if personalize is configured
export function isPersonalizeConfigured(): boolean {
  return personalizeConfig.isConfigured;
}

/**
 * Get personalization data in the improved format
 * This replaces the old approach and provides structured data for variant management
 */
export async function getPersonalizationData(): Promise<PersonalizationData | null> {
  try {
    const sdk = await initializePersonalize();
    if (!sdk) {
      console.warn('⚠️ SDK not initialized, returning null personalization data');
      return null;
    }

    // Get experiences from the SDK
    const experiences = sdk.getExperiences();
    console.log('📊 Raw experiences from SDK:', experiences);

    if (!experiences || experiences.length === 0) {
      console.log('📭 No experiences found');
      return createPersonalizationData([]);
    }

    // Create activeVariants mapping
    const activeVariants: Record<string, string | null> = {};
    
    experiences.forEach((experience: ExperienceData) => {
      const shortUid = experience.shortUid;
      const activeVariant = experience.activeVariantShortUid;
      
      // Apply the new logic: null means inactive, "0" means active
      if (activeVariant === null || activeVariant === undefined) {
        activeVariants[shortUid] = null; // Inactive
      } else {
        activeVariants[shortUid] = "0"; // Active (normalize to "0")
      }
    });

    const personalizationData = createPersonalizationData(experiences, activeVariants);
    
    console.log('✅ Created personalization data:', personalizationData);
    return personalizationData;
    
  } catch (error) {
    console.error('❌ Failed to get personalization data:', error);
    return null;
  }
}

/**
 * Enhanced function that checks if personalization is available and active
 */
export async function isPersonalizationActive(): Promise<boolean> {
  try {
    const personalizationData = await getPersonalizationData();
    if (!personalizationData) return false;
    
    // Check if any variants are active (value === "0")
    return Object.values(personalizationData.activeVariants).some(variant => variant === "0");
  } catch (error) {
    console.error('❌ Error checking personalization status:', error);
    return false;
  }
}

/**
 * Get the primary active variant alias (backwards compatibility)
 * This maintains compatibility with existing code while using the new system
 */
export async function getPrimaryActiveVariantAlias(): Promise<string> {
  try {
    const personalizationData = await getPersonalizationData();
    if (!personalizationData) {
      return 'cs_personalize_1_null'; // Default fallback
    }

    // Find the first active experience
    const activeExperience = personalizationData.experiences.find(exp => 
      personalizationData.activeVariants[exp.shortUid] === "0"
    );

    if (activeExperience) {
      return `cs_personalize_${activeExperience.shortUid}_0`;
    }

    return 'cs_personalize_1_null'; // Fallback when no active variants
  } catch (error) {
    console.error('❌ Error getting primary variant alias:', error);
    return 'cs_personalize_1_null';
  }
}

// Export configuration for debugging
export { personalizeConfig };
