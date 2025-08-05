import React from 'react';
import Card from './Card';

interface PopularActivitiesSectionProps {
  cardSectionHeader: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  allCards: any[];
}

export default function PopularActivitiesSection({ 
  cardSectionHeader, 
  allCards 
}: PopularActivitiesSectionProps) {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">{cardSectionHeader}</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover amazing experiences curated just for you
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {allCards.map((card: any, index: number) => (
            <Card
              key={card.uid || index}
              title={card.card_title}
              description={card.card_subtitle}
              image={card.card_image?.url || ''}
              link={card.link?.href || '#'}
            />
          ))}
        </div>
      </div>
    </section>
  );
} 