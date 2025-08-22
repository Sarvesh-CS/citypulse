import React from 'react';

interface CardProps {
    title: string;
    description: string;
    image: string | null;
    link: string;
}

export default function Card({ title, description, image, link }: CardProps) {
    return (
        <a href={link} className="block">
            {/* Activity Card 1 */}
            <div className="bg-white rounded-lg overflow-hidden shadow-blue-200 hover:shadow-xl transition-shadow">
              <div className="h-64 bg-gradient-to-br from-blue-400 to-blue-600">
                {image ? (
                  <img src={image} alt={title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <div className="text-center">
                      <svg className="w-16 h-16 mx-auto mb-2 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm opacity-75">Image</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-gray-800">{title}</h3>
                <p className="text-gray-600">{description}</p>
              </div>
            </div>
        </a>
    );
}