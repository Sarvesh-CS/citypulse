/**
 * Example usage of the improved personalization system
 * 
 * This file demonstrates how to use the new variant utilities
 * for better personalized content fetching
 */

import { 
  getPersonalizationData,
  isPersonalizationActive 
} from './personalize';

import { 
  fetchIntelligentContent,
  fetchBatchIntelligentContent,
  PersonalizationData,
  isVariantActive,
  getActiveExperiences,
  getVariantState,
  debugPersonalizationState,
  VARIANT_STATES,
  createPersonalizationData
} from './variant-utils';

/**
 * Example: Basic personalization check
 */
export async function exampleBasicCheck() {
  // Check if personalization is active
  const isActive = await isPersonalizationActive();
  console.log('Personalization active:', isActive);
  
  // Get full personalization data
  const personalizationData = await getPersonalizationData();
  if (personalizationData) {
    debugPersonalizationState(personalizationData);
  }
}

/**
 * Example: Working with your data structure
 */
export function exampleWorkingWithYourData() {
  // Your data structure
  const yourPersonalizationData: PersonalizationData = {
    "activeVariants": {
        "1": null,        // Variant 1 is NOT active
        "3": "0"          // Variant 3 IS active
    },
    "experiences": [
        {
            "shortUid": "1",
            "activeVariantShortUid": null
        },
        {
            "shortUid": "3",
            "activeVariantShortUid": "0"
        }
    ]
  };

  // Check which experiences are active
  const activeExperiences = getActiveExperiences(yourPersonalizationData);
  console.log('Active experiences:', activeExperiences);
  // Output: [{ shortUid: "3", activeVariantShortUid: "0" }]

  // Check specific variant states
  const variant1State = getVariantState("1", yourPersonalizationData);
  const variant3State = getVariantState("3", yourPersonalizationData);
  
  console.log('Variant 1 state:', variant1State);
  // Output: { isActive: false, variantId: null, experienceId: "1" }
  
  console.log('Variant 3 state:', variant3State);
  // Output: { isActive: true, variantId: "0", experienceId: "3" }

  // Check individual variant values
  console.log('Is variant 1 active?', isVariantActive(yourPersonalizationData.activeVariants["1"])); // false
  console.log('Is variant 3 active?', isVariantActive(yourPersonalizationData.activeVariants["3"])); // true
}

/**
 * Example: Fetching personalized content
 */
export async function exampleFetchContent() {
  const personalizationData = await getPersonalizationData();
  
  // Fetch a single piece of content with intelligent personalization
  const content = await fetchIntelligentContent({
    contentTypeUid: 'home_page',
    entryUid: 'your-entry-uid',
    referenceFieldPath: ['cards_section.card.card'],
    personalizationData: personalizationData || undefined,
    fallbackToDefault: true
  });

  // Fetch multiple pieces of content in parallel
  const contentRequests = [
    {
      id: 'homepage',
      contentTypeUid: 'home_page',
      entryUid: 'homepage-uid',
      referenceFieldPath: ['cards_section.card.card']
    },
    {
      id: 'tours',
      contentTypeUid: 'content_card_page', 
      entryUid: 'tours-uid',
      referenceFieldPath: ['content_card_page_header', 'content_cards.content_card.info_card']
    }
  ];

  const batchResults = await fetchBatchIntelligentContent(
    contentRequests,
    personalizationData || undefined,
    true
  );

  console.log('Homepage content:', batchResults.homepage);
  console.log('Tours content:', batchResults.tours);
}

/**
 * Example: Manual variant checking
 */
export function exampleManualVariantChecking() {
  // Check if a variant value represents active state
  console.log('null is active?', isVariantActive(null)); // false
  console.log('"0" is active?', isVariantActive("0")); // true
  console.log('"1" is active?', isVariantActive("1")); // false
  
  // Use constants for clarity
  console.log('Active constant:', VARIANT_STATES.ACTIVE); // "0"
  console.log('Inactive constant:', VARIANT_STATES.INACTIVE); // null
}

/**
 * Example: Creating personalization data from external sources
 */
export function exampleCreatePersonalizationData() {
  // If you get data from an external API or different format
  const externalExperiences = [
    { shortUid: "1", activeVariantShortUid: null },
    { shortUid: "2", activeVariantShortUid: "0" },
    { shortUid: "3", activeVariantShortUid: "0" }
  ];

  // Method 1: Let the utility infer activeVariants from experiences
  const personalizationData1 = createPersonalizationData(externalExperiences);

  // Method 2: Provide explicit activeVariants mapping
  const customActiveVariants = {
    "1": null,  // Inactive
    "2": "0",   // Active  
    "3": "0"    // Active
  };
  
  const personalizationData2 = createPersonalizationData(
    externalExperiences, 
    customActiveVariants
  );

  console.log('Generated personalization data:', personalizationData2);
}

/**
 * Key Benefits of the New Approach:
 * 
 * 1. **Clear Logic**: null = inactive, "0" = active (as you requested)
 * 2. **Type Safety**: Proper TypeScript interfaces
 * 3. **Scalable**: Works with multiple experiences and variants
 * 4. **Fallback Support**: Gracefully falls back to default content
 * 5. **Batch Operations**: Fetch multiple content pieces efficiently
 * 6. **Debug Tools**: Built-in debugging utilities
 * 7. **Backwards Compatibility**: Old code continues to work
 * 8. **Error Handling**: Robust error handling with fallbacks
 */