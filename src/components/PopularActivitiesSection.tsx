import React from 'react';
import Card from './Card';

interface PopularActivitiesSectionProps {
  cardSectionHeader: string;
  allCards: any[];
}

export default function PopularActivitiesSection({
  cardSectionHeader,
  allCards
}: PopularActivitiesSectionProps) {
  return (
    <section id="section-2" className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-light text-center text-gray-800 mb-12">
          {cardSectionHeader}
        </h2>
        
        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {allCards.map((card: any) => (
            <Card 
              key={card.uid} 
              title={card.card_title} 
              description={card.card_subtitle} 
              image={card.card_image.url} 
              link={card.link.href || '#'} 
            />
          ))}
        </div>
      </div>
    </section>
  );
} 