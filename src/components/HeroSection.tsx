import React from 'react';
import Button from './Button';

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  description?: string;
  exploreBtn?: { title: string };
  learnMoreBtn?: { title: string; href: string };
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  onSearch: (e: React.FormEvent) => void;
}

export default function HeroSection({
  title,
  subtitle,
  description,
  exploreBtn,
  learnMoreBtn,
  searchTerm,
  onSearchTermChange,
  onSearch
}: HeroSectionProps) {
  return (
    <section className="relative h-[70vh] flex items-center justify-center">
      {/* Cool Tech Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-700 via-indigo-700 to-cyan-700"></div>
      
      {/* Content */}
      <div className="relative z-10 text-center text-white px-6">
        {/* Dynamic Title from Contentstack */}
        <h1 className="text-4xl md:text-6xl font-light mb-4">
          {title || "what's your destination?"}
        </h1>
        
        {/* Subtitle from Contentstack */}
        {subtitle && (
          <h2 className="text-xl md:text-2xl mb-6 text-gray-200 font-light max-w-4xl mx-auto">
            {subtitle}
          </h2>
        )}
        
        {/* Description from Contentstack */}
        {description && (
          <p className="text-lg mb-8 text-gray-100 max-w-3xl mx-auto leading-relaxed">
            {description}
          </p>
        )}
        
        {/* Action Buttons from Contentstack */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          {exploreBtn?.title && (
            <Button 
              text={exploreBtn.title}
              href="#section-2"
              className="bg-blue-600 text-white hover:bg-blue-700 px-8 py-3 rounded-lg font-medium transition-colors shadow-lg"
            />
          )}
          
          {learnMoreBtn?.title && (
            <Button 
              text={learnMoreBtn.title}
              href={learnMoreBtn.href}
              className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-3 rounded-lg font-medium transition-colors"
            />
          )}
        </div>
        
        {/* Search Form */}
        <form onSubmit={onSearch} className="flex max-w-2xl mx-auto">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            placeholder="Search by location, tour name, or destination..."
            className="flex-1 px-6 py-4 text-lg text-gray-700 bg-white rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            type="submit"
            className="px-8 py-4 bg-blue-600 text-white font-medium rounded-r-lg hover:bg-blue-500 transition-colors"
          >
            Search
          </button>
        </form>
      </div>
    </section>
  );
} 