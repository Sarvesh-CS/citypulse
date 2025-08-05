import React from 'react';
import ContentCard from './ContentCard';

interface SearchResultsProps {
  searchTerm: string;
  filteredResults: any[];
  onClearSearch: () => void;
}

export default function SearchResults({
  searchTerm,
  filteredResults,
  onClearSearch
}: SearchResultsProps) {
  
  // Group results by content type
  const groupedResults = filteredResults.reduce((acc: Record<string, any[]>, item) => {
    const type = item.contentType || 'other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(item);
    return acc;
  }, {});

  // Content type display names and colors
  const contentTypeConfig = {
    tour: { 
      name: 'Tours', 
      color: 'bg-blue-100 text-blue-800',
      icon: '🏞️'
    },
    event: { 
      name: 'Events', 
      color: 'bg-purple-100 text-purple-800',
      icon: '🎉'
    },
    hotel: { 
      name: 'Hotels', 
      color: 'bg-green-100 text-green-800',
      icon: '🏨'
    },
    restaurant: { 
      name: 'Restaurants', 
      color: 'bg-orange-100 text-orange-800',
      icon: '🍽️'
    },
    other: { 
      name: 'Other', 
      color: 'bg-gray-100 text-gray-800',
      icon: '📍'
    }
  };

  return (
    <section id="search-results" className="py-16 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">
            Search Results for "{searchTerm}"
          </h2>
          <button
            onClick={onClearSearch}
            className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Clear Search
          </button>
        </div>
        
        {filteredResults.length > 0 ? (
          <div className="space-y-8">
            {/* Summary */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <p className="text-gray-600 mb-4">
                Found {filteredResults.length} result(s) across {Object.keys(groupedResults).length} category(s)
              </p>
              
              {/* Category summary */}
              <div className="flex flex-wrap gap-2">
                {(Object.entries(groupedResults) as [string, any[]][]).map(([type, items]) => {
                  const config = contentTypeConfig[type as keyof typeof contentTypeConfig] || contentTypeConfig.other;
                  return (
                    <span 
                      key={type}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}
                    >
                      <span className="mr-1">{config.icon}</span>
                      {items.length} {config.name}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Results by category */}
            {(Object.entries(groupedResults) as [string, any[]][]).map(([type, items]) => {
              const config = contentTypeConfig[type as keyof typeof contentTypeConfig] || contentTypeConfig.other;
              
              return (
                <div key={type} className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{config.icon}</span>
                    <h3 className="text-2xl font-bold text-gray-800">{config.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${config.color}`}>
                      {items.length} result(s)
                    </span>
                  </div>
                  
                  <div className="space-y-6">
                    {items.map((item: any) => (
                      <div key={item.uid || `${type}-${Math.random()}`} className="relative">
                        {/* Content type badge */}
                        <div className="absolute top-4 right-4 z-10">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                            {config.icon} {config.name.slice(0, -1)}
                          </span>
                        </div>
                        
                        <ContentCard 
                          data={item.sourceData || {}} 
                          name={item.name || item.title || 'Unnamed'} 
                          price={item.price || 'Price not available'} 
                          rating={item.rating?.value?.toString() || item.rating?.toString() || '0'} 
                          duration={item.duration || 'Duration not specified'}
                          location={item.location || 'Location not specified'}
                          group_size={item.group_size || item.capacity || 'Not specified'}
                          image={item.image || []} 
                          description={item.info || item.description || 'No description available'} 
                          button_text={item.book_now_btn || item.reserve_btn || item.book_btn || 'Book Now'} 
                          button_url="#" 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No results found</h3>
            <p className="text-gray-500 mb-4">
              Try searching with different keywords like location, activity name, or content type.
            </p>
            <div className="text-sm text-gray-400">
              <p>Search works across:</p>
              <div className="flex justify-center space-x-4 mt-2">
                <span className="inline-flex items-center">🏞️ Tours</span>
                <span className="inline-flex items-center">🎉 Events</span>
                <span className="inline-flex items-center">🏨 Hotels</span>
                <span className="inline-flex items-center">🍽️ Restaurants</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
} 