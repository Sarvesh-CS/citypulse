import React from 'react';

interface CardProps {
    title: string;
    description: string;
    image: string;
    link: string;
}

export default function Card({ title, description, image, link }: CardProps) {
    return (
        <a href={link} className="block">
            {/* Activity Card 1 */}
            <div className="bg-white rounded-lg overflow-hidden shadow-blue-200 hover:shadow-xl transition-shadow">
              <div className="h-64 bg-gradient-to-br from-blue-400 to-blue-600">
                <img src={image} alt={title} className="w-full h-full object-cover" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-gray-800">{title}</h3>
                <p className="text-gray-600">{description}</p>
              </div>
            </div>
        </a>
    );
}