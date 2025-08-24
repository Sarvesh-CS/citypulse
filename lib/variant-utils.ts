import { fetchPersonalizedEntry } from './personalize';
import { getEntry } from './contentstack-utils';

// Type definitions for the improved variant system
export interface ActiveVariants {
  [experienceShortUid: string]: string | null;
}

export interface Experience {
  shortUid: string;
  activeVariantShortUid: string | null;
}

export interface PersonalizationData {
  activeVariants: ActiveVariants;
  experiences: Experience[];
}

export interface VariantState {
  isActive: boolean;
  variantId: string | null;
  experienceId: string;
}

// Constants
export const VARIANT_STATES = {
  ACTIVE: '0',
  INACTIVE: null,
} as const;

/**
 * Check if a variant is active based on the new logic:
 * - null means the variant is not active
 * - "0" means the variant is active
 */
export function isVariantActive(variantValue: string | null): boolean {
  return variantValue === VARIANT_STATES.ACTIVE;
}

/**
 * Get all active experiences from personalization data
 */
export function getActiveExperiences(personalizationData: PersonalizationData): Experience[] {
  return personalizationData.experiences.filter(experience => 
    isVariantActive(personalizationData.activeVariants[experience.shortUid])
  );
}

/**
 * Get variant state for a specific experience
 */
export function getVariantState(
  experienceShortUid: string, 
  personalizationData: PersonalizationData
): VariantState {
  const variantValue = personalizationData.activeVariants[experienceShortUid];
  const experience = personalizationData.experiences.find(exp => exp.shortUid === experienceShortUid);
  
  return {
    isActive: isVariantActive(variantValue),
    variantId: variantValue,
    experienceId: experienceShortUid,
  };
}

/**
 * Generate variant alias from experience and variant IDs
 */
export function generateVariantAlias(experienceShortUid: string, variantShortUid: string): string {
  return `cs_personalize_${experienceShortUid}_${variantShortUid}`;
}

/**
 * Get variant aliases for all active experiences
 */
export function getActiveVariantAliases(personalizationData: PersonalizationData): string[] {
  const activeExperiences = getActiveExperiences(personalizationData);
  
  return activeExperiences.map(experience => {
    const variantId = personalizationData.activeVariants[experience.shortUid];
    return generateVariantAlias(experience.shortUid, variantId || '');
  });
}

/**
 * Check if any variants are active
 */
export function hasActiveVariants(personalizationData: PersonalizationData): boolean {
  return getActiveExperiences(personalizationData).length > 0;
}

/**
 * Enhanced content fetching with improved variant logic
 */
export interface ContentFetchOptions {
  contentTypeUid: string;
  entryUid: string;
  referenceFieldPath: string[];
  personalizationData?: PersonalizationData;
  fallbackToDefault?: boolean;
}

/**
 * Fetch content with intelligent personalization
 * Uses the new variant system to determine whether to fetch personalized or default content
 */
export async function fetchIntelligentContent({
  contentTypeUid,
  entryUid,
  referenceFieldPath,
  personalizationData,
  fallbackToDefault = true
}: ContentFetchOptions): Promise<unknown> {
  try {
    // If no personalization data or no active variants, fetch default content
    if (!personalizationData || !hasActiveVariants(personalizationData)) {
      console.log('📄 Fetching default content (no active variants)');
      return await getEntry(contentTypeUid, entryUid, referenceFieldPath);
    }

    // Get the first active variant alias (you can modify this logic as needed)
    const activeAliases = getActiveVariantAliases(personalizationData);
    
    if (activeAliases.length === 0) {
      console.log('📄 Fetching default content (no variant aliases)');
      return await getEntry(contentTypeUid, entryUid, referenceFieldPath);
    }

    const primaryVariantAlias = activeAliases[0];
    console.log('🎯 Fetching personalized content with variant:', primaryVariantAlias);
    
    // Try to fetch personalized content
    const personalizedContent = await fetchPersonalizedEntry(
      contentTypeUid,
      entryUid,
      referenceFieldPath,
      primaryVariantAlias
    );

    // If personalized content exists, return it
    if (personalizedContent) {
      console.log('✅ Successfully fetched personalized content');
      return personalizedContent;
    }

    // If fallback is enabled and personalized content failed, fetch default
    if (fallbackToDefault) {
      console.log('🔄 Falling back to default content');
      return await getEntry(contentTypeUid, entryUid, referenceFieldPath);
    }

    return null;
  } catch (error) {
    console.error('❌ Error in fetchIntelligentContent:', error);
    
    // If fallback is enabled, try to fetch default content
    if (fallbackToDefault) {
      try {
        console.log('🔄 Error fallback: fetching default content');
        return await getEntry(contentTypeUid, entryUid, referenceFieldPath);
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError);
        throw fallbackError;
      }
    }
    
    throw error;
  }
}

/**
 * Batch fetch multiple content items with personalization
 */
export interface BatchContentRequest {
  id: string;
  contentTypeUid: string;
  entryUid: string;
  referenceFieldPath: string[];
}

export async function fetchBatchIntelligentContent(
  requests: BatchContentRequest[],
  personalizationData?: PersonalizationData,
  fallbackToDefault = true
): Promise<Record<string, unknown>> {
  const results: Record<string, unknown> = {};

  // Use Promise.allSettled to handle failures gracefully
  const promises = requests.map(async (request) => {
    try {
      const content = await fetchIntelligentContent({
        ...request,
        personalizationData,
        fallbackToDefault
      });
      return { id: request.id, content, success: true };
    } catch (error) {
      console.error(`❌ Failed to fetch content for ${request.id}:`, error);
      return { id: request.id, content: null, success: false, error };
    }
  });

  const settled = await Promise.allSettled(promises);
  
  settled.forEach((result) => {
    if (result.status === 'fulfilled') {
      if (result.value.success) {
        results[result.value.id] = result.value.content;
      } else {
        results[result.value.id] = null;
      }
    }
    // For rejected promises, we can't determine the ID, so skip them
  });

  return results;
}

/**
 * Utility to create personalization data from SDK response
 * You can use this to transform data from your personalization SDK
 */
export function createPersonalizationData(
  experiences: unknown[],
  activeVariants?: Record<string, string | null>
): PersonalizationData {
  // If activeVariants is not provided, infer from experiences
  const variants = activeVariants || {};
  
  if (!activeVariants) {
    experiences.forEach((exp) => {
      const typedExp = exp as { shortUid: string; activeVariantShortUid: string | null };
      variants[typedExp.shortUid] = typedExp.activeVariantShortUid;
    });
  }

  return {
    activeVariants: variants,
    experiences: experiences.map((exp) => {
      const typedExp = exp as { shortUid: string; activeVariantShortUid: string | null };
      return {
        shortUid: typedExp.shortUid,
        activeVariantShortUid: typedExp.activeVariantShortUid
      };
    })
  };
}

/**
 * Debug utility to log personalization state
 */
export function debugPersonalizationState(personalizationData: PersonalizationData): void {
  console.group('🔍 Personalization Debug Info');
  console.log('Active Variants:', personalizationData.activeVariants);
  console.log('Experiences:', personalizationData.experiences);
  console.log('Active Experiences:', getActiveExperiences(personalizationData));
  console.log('Active Variant Aliases:', getActiveVariantAliases(personalizationData));
  console.log('Has Active Variants:', hasActiveVariants(personalizationData));
  console.groupEnd();
}