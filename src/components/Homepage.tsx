'use client';
import { useEffect, useState } from 'react';
import Stack from '../../lib/contentstack';
import { getEntry, getEntries } from '../../lib/contentstack-utils';
import HeroSection from './HeroSection';
import SearchResults from './SearchResults';
import StatsSection from './StatsSection';
import PopularActivitiesSection from './PopularActivitiesSection';
import { useLoading } from '../components/LoadingProvider';

const homePageUid = process.env.NEXT_PUBLIC_HOMEPAGE_UID || '';
const toursPageUid = process.env.NEXT_PUBLIC_TOURS_PAGE_UID || '';
const eventsPageUid = process.env.NEXT_PUBLIC_EVENTS_PAGE_UID || '';
const hotelsPageUid = process.env.NEXT_PUBLIC_HOTELS_PAGE_UID || '';
const restaurantsPageUid = process.env.NEXT_PUBLIC_RESTAURANTS_PAGE_UID || '';

export default function Homepage() {
  const [data, setData] = useState<any>(null);
  const [allContentData, setAllContentData] = useState<any>({
    tours: null,
    events: null,
    hotels: null,
    restaurants: null
  });
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredResults, setFilteredResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  const { setLoading } = useLoading();

  useEffect(() => {
    // Only run once on mount
    if (isDataLoaded) return;

    async function fetchData() {
      setLoading(true);
      try {
        if (!Stack) {
          setError('Contentstack not configured - check environment variables');
          return;
        }
        
        // Fetch homepage data
        const result = await getEntry('home_page', homePageUid, ["cards_section.card.card"]);
        
        // Fetch tours data (known working UID)
        const toursData = await getEntry('content_card_page', toursPageUid, ["content_card_page_header",  "content_cards.content_card.info_card"]);
        const eventsData = await getEntry('content_card_page', eventsPageUid, ["content_card_page_header", "content_cards.content_card.info_card"]);
        const hotelsData = await getEntry('content_card_page', hotelsPageUid, ["content_card_page_header", "content_cards.content_card.info_card"]);
        const restaurantsData = await getEntry('content_card_page', restaurantsPageUid, ["content_card_page_header", "content_cards.content_card.info_card"]);
        
        
        // try {
        //   const allEntries = await getEntries('content_card_page', ["content_card_page_header", "header", "content_cards.content_card.info_card"]);
        //   const entries = allEntries?.entries || [];
        //   console.log('Found content_card_page entries:', entries.length);
          
        //   // Try to identify different content types by their titles/headers
        //   entries.forEach((entry: any) => {
        //     const header = entry.content_card_page_header?.toLowerCase() || '';
        //     const title = entry.title?.toLowerCase() || '';
            
        //     if ((header.includes('event') || title.includes('event')) && !additionalContent.events) {
        //       additionalContent.events = entry;
        //       console.log('Found events content:', entry.uid);
        //     } else if ((header.includes('hotel') || title.includes('hotel')) && !additionalContent.hotels) {
        //       additionalContent.hotels = entry;
        //       console.log('Found hotels content:', entry.uid);
        //     } else if ((header.includes('restaurant') || title.includes('restaurant') || header.includes('dining')) && !additionalContent.restaurants) {
        //       additionalContent.restaurants = entry;
        //       console.log('Found restaurants content:', entry.uid);
        //     }
        //   });
        // } catch (error) {
        //   console.warn('Failed to fetch additional content types:', error);
        // }
        
        // Set all content data
        const newContentData = {
          tours: toursData,
          events: eventsData,
          hotels: hotelsData,
          restaurants: restaurantsData
        };
  
        setAllContentData(newContentData);
        setData(result);
        setIsDataLoaded(true);
        
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load content');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [isDataLoaded, setLoading]);

  const getAllSearchableItems = () => {
    const searchableItems: any[] = [];
    
    // Add tours
    if (allContentData.tours?.content_cards?.[0]?.content_card?.info_card) {
      const tours = allContentData.tours.content_cards[0].content_card.info_card;
      console.log('Adding tours to search:', tours.length);
      tours.forEach((item: any) => {
        searchableItems.push({
          ...item,
          contentType: 'tour',
          sourceData: allContentData.tours
        });
      });
    }
    
    // Add events
    if (allContentData.events?.content_cards?.[0]?.content_card?.info_card) {
      const events = allContentData.events.content_cards[0].content_card.info_card;
      console.log('Adding events to search:', events.length);
      events.forEach((item: any) => {
        searchableItems.push({
          ...item,
          contentType: 'event',
          sourceData: allContentData.events
        });
      });
    }
    
    // Add hotels
    if (allContentData.hotels?.content_cards?.[0]?.content_card?.info_card) {
      const hotels = allContentData.hotels.content_cards[0].content_card.info_card;
      console.log('Adding hotels to search:', hotels.length);
      hotels.forEach((item: any) => {
        searchableItems.push({
          ...item,
          contentType: 'hotel',
          sourceData: allContentData.hotels
        });
      });
    }
    
    // Add restaurants
    if (allContentData.restaurants?.content_cards?.[0]?.content_card?.info_card) {
      const restaurants = allContentData.restaurants.content_cards[0].content_card.info_card;
      console.log('Adding restaurants to search:', restaurants.length);
      restaurants.forEach((item: any) => {
        searchableItems.push({
          ...item,
          contentType: 'restaurant',
          sourceData: allContentData.restaurants
        });
      });
    }
    
    console.log('Total searchable items:', searchableItems.length);
    console.log('Items by type:', {
      tours: searchableItems.filter(item => item.contentType === 'tour').length,
      events: searchableItems.filter(item => item.contentType === 'event').length,
      hotels: searchableItems.filter(item => item.contentType === 'hotel').length,
      restaurants: searchableItems.filter(item => item.contentType === 'restaurant').length,
    });
    
    return searchableItems;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      setFilteredResults([]);
      setShowSearchResults(false);
      return;
    }

    setLoading(true);
    try {
      console.log('🔍 Searching for:', searchTerm);
      
      const allItems = getAllSearchableItems();
      console.log('📊 Available items to search:', allItems.length);
      
      if (allItems.length === 0) {
        console.warn('⚠️ No searchable items available');
        setFilteredResults([]);
        setShowSearchResults(true);
        return;
      }
      
      // Simulate search processing time
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Filter across all content types based on name, location, or description
      const filtered = allItems.filter((item: any) => {
        const searchLower = searchTerm.toLowerCase();
        const matches = (
          item.name?.toLowerCase().includes(searchLower) ||
          item.location?.toLowerCase().includes(searchLower) ||
          item.info?.toLowerCase().includes(searchLower) ||
          item.description?.toLowerCase().includes(searchLower) ||
          item.title?.toLowerCase().includes(searchLower) ||
          item.contentType?.toLowerCase().includes(searchLower)
        );
        
        if (matches) {
          console.log('✅ Match found:', item.name || item.title, 'Type:', item.contentType);
        }
        
        return matches;
      });

      console.log(`🎯 Found ${filtered.length} results across all content types`);
      
      // Group results by type for logging
      const resultsByType = filtered.reduce((acc: any, item) => {
        acc[item.contentType] = (acc[item.contentType] || 0) + 1;
        return acc;
      }, {});
      console.log('📈 Results by type:', resultsByType);
      
      setFilteredResults(filtered);
      setShowSearchResults(true);
      
      // Scroll to search results
      setTimeout(() => {
        const searchSection = document.getElementById('search-results');
        if (searchSection) {
          searchSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setFilteredResults([]);
    setShowSearchResults(false);
  };

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="error-container max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-4 text-gray-900">Oops! Something went wrong</h1>
            <p className="error-text mb-4">{error}</p>
            <p className="text-sm text-gray-500">Please try refreshing the page or check your internet connection.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="btn btn-primary mt-4"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state - let global loading spinner handle this
  if (!isDataLoaded || !data) {
    return null; 
  }

  // Extract content from Contentstack data
  const title = data.title;
  const subtitle = data.subtitle;
  const description = data.description;
  const exploreBtn = data.explore_btn; 
  const learnMoreBtn = data?.learn_more_lnk;
  const cardSectionheader = data.card_section_header_title;

  // Flatten all cards from all card sections
  const allCards = data.cards_section?.flatMap((section: any) => section.card.card) || [];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroSection
        title={title}
        subtitle={subtitle}
        description={description}
        exploreBtn={exploreBtn}
        learnMoreBtn={learnMoreBtn}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        onSearch={handleSearch}
      />

      {/* Search Results Section */}
      {showSearchResults && (
        <SearchResults
          searchTerm={searchTerm}
          filteredResults={filteredResults}
          onClearSearch={clearSearch}
        />
      )}

      {/* Statistics Section */}
      <StatsSection />

      {/* Popular Activities Section */}
      <PopularActivitiesSection
        cardSectionHeader={cardSectionheader}
        allCards={allCards}
      />
    </div>
  );
}

