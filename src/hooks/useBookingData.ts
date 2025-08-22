import { useState, useEffect } from 'react';
import { getEntry } from '../../lib/contentstack-utils';


export function useBookingData(pageSlug?: string) {

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [bookingData, setBookingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchBookingData = async () => {
      console.log('Fetching booking data for pageSlug:', pageSlug);
      
      // Map page slugs to their corresponding booking modal UIDs
      const modalUidMappings: { [key: string]: string } = {
        'hotels': process.env.NEXT_PUBLIC_HOTELS_BOOKING_MODAL_UID || '',
        'restaurants': process.env.NEXT_PUBLIC_RESTAURANTS_BOOKING_MODAL_UID || '',
        'events': process.env.NEXT_PUBLIC_EVENTS_BOOKING_MODAL_UID || '',
        'tours': process.env.NEXT_PUBLIC_TOURS_BOOKING_MODAL_UID || '',
      };

      // Default fallback UID
      const defaultModalUid = process.env.NEXT_PUBLIC_BOOKING_MODAL_UID || '';

      // Determine which modal UID to use
      let modalUid = defaultModalUid;
      
      if (pageSlug) {
        // Find matching UID based on slug
        for (const [key, uid] of Object.entries(modalUidMappings)) {
          if (pageSlug.toLowerCase().includes(key) && uid) {
            modalUid = uid;
            console.log(`Using specific modal UID for ${key}:`, uid);
            break;
          }
        }
      }

      if (!modalUid) {
        console.warn('No booking modal UID found for pageSlug:', pageSlug);
        setLoading(false);
        return;
      }

      try {
        console.log('Attempting to fetch booking modal with UID:', modalUid);
        
        // Try the most likely content type variations
        const contentTypeVariations = ['booking_modal', 'booking', 'reservation', 'modal'];
        let data = null;
        let lastError = null;
        
        for (const contentType of contentTypeVariations) {
          try {
            console.log(`Trying content type: ${contentType}`);
            data = await getEntry(contentType, modalUid);
            if (data) {
              console.log(`Success with content type: ${contentType}`, data);
              break;
            }
          } catch (error) {
            console.log(`Failed with content type ${contentType}:`, (error as Error).message);
            lastError = error;
          }
        }
        
        if (!data) {
          throw lastError || new Error('All content type variations failed');
        }
        
        setBookingData(data);
        console.log('bookingData fetched successfully:', data);
      } catch (err) {
        console.error('Failed to fetch booking modal data:', err);
        console.error('Error details:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingData();
  }, [pageSlug]); // Add pageSlug as dependency

  return { bookingData, loading, error };
} 
