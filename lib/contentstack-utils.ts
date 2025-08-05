// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as contentstack from "@contentstack/delivery-sdk";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as Utils from "@contentstack/utils";
import Stack from './contentstack';

// Export the stack instance for direct use
// export { default as stack } from './contentstack';

// Basic wrapper functions - customize these based on your contentstack SDK version
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getEntry(contentTypeUid: string, entryUid: string, references?: string[]): Promise<any> {
  if (!Stack) {
    console.log('Contentstack not configured, returning null');
    return null;
  }
  
  try {
    const query = Stack.contentType(contentTypeUid).entry()
      .includeReference(references || [])
      .query({ uid: entryUid });
    
    const result = await query.find();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const entries = (result as any).entries || [];

    if (entries.length > 0) {
      return JSON.parse(JSON.stringify(entries[0]));
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching entry ${entryUid}:`, error);
    return null;
  }
}


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getEntries(contentTypeUid: string, references?: string[]): Promise<any> {
  if (!Stack) {
    console.log('Contentstack not configured, returning null');
    return null;
  }
  
  try {
    const query = Stack.contentType(contentTypeUid).entry();  

    if (references && references.length > 0) {
      query.includeReference(...references);
    }
    
    return await query.find();
  } catch (error) {
    console.error(`Error fetching entries for ${contentTypeUid}:`, error);
    return null;
  }
}

// New function to get page by URL slug
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getPageByUrl(url: string, references?: string[]): Promise<any> {
  if (!Stack) {
    return null;
  }
  
  try {      
        const testQuery = Stack.contentType('content_card_page').entry().includeReference(references || []).query({url: url});
        
        const result = await testQuery.find();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const entries = (result as any).entries || [];

        if (entries.length > 0) {
          return JSON.parse(JSON.stringify(entries[0]));
        }
        
    } catch (error) {
      console.error(`Error fetching page with URL ${url}:`, error);
      return null;
    } 
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getContentType(contentTypeUid: string): Promise<any> {
  if (!Stack) {
    return null;
  }
  
  try {
    const contentType = Stack.contentType(contentTypeUid);  
    return await contentType.fetch();
  } catch (error) {
    console.error(`Error fetching content type ${contentTypeUid}:`, error);
    return null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getAsset(assetUid: string): Promise<any> {
  if (!Stack) { 
    return null;
  }
  
  try {
    const asset = Stack.asset(assetUid);
    return await asset.fetch();
  } catch (error) {
    console.error(`Error fetching asset ${assetUid}:`, error);
    return null;
  }
}

// Helper function to get the raw stack for custom operations
export function getStackInstance() {
  return Stack;
}

// Helper function to check if Contentstack is configured
// export function isContentstackConfigured(): boolean {
//   return stack !== null;
// } 