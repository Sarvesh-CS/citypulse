"use client"
import React, { useState } from 'react'
import ContentCardDetail from './ContentCardDetail'
import BookingModal from './BookingModal'
import { useManualLoading } from '../hooks/useManualLoading'
import { useBookingData } from '../hooks/useBookingData'


interface ImageObject {
    uid: string;
    title: string;
    url: string;
    filename: string;
    content_type: string;
}

interface ContentCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  name : string;
  price : string;
  rating : string;    
  duration : string;
  location : string;
  group_size : string;
  image : Array<ImageObject>;
  description : string;
  button_text : string;
  button_url : string;
  pageSlug?: string; // Optional page slug for context
}

export default function ContentCard(props: ContentCardProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const { withLoading } = useManualLoading();
    const { bookingData } = useBookingData(props.pageSlug);
    
    const handleLearnMore = () => {
        console.log('Learn More clicked');
        setIsDetailModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsDetailModalOpen(false);
    };

    const handleCloseBookingModal = () => {
        setIsBookingModalOpen(false);
    };

    // Helper function to determine activity type based on content
    const getActivityType = (): 'tour' | 'event' | 'hotel' | 'restaurant' => {
        const name = props?.name?.toLowerCase() || '';
        const description = props?.description?.toLowerCase() || '';
        
        if (name.includes('hotel') || description.includes('hotel') || description.includes('stay')) {
            return 'hotel';
        } else if (name.includes('restaurant') || description.includes('dining') || description.includes('food')) {
            return 'restaurant';
        } else if (name.includes('event') || description.includes('event') || description.includes('concert')) {
            return 'event';
        } else {
            return 'tour'; // Default to tour
        }
    };

    // Use passed pageSlug if available, otherwise extract from pathname
    const pageSlug = props.pageSlug || (props.button_url ? props.button_url.split('/').pop() : '');

    const handleBookNow = () => {
        console.log('Book Now clicked - Opening booking modal');
        setIsBookingModalOpen(true);
        
    };

    const handlePreviousImage = () => {
        if (props.image && props.image.length > 0) {
            setCurrentImageIndex((prev) => 
                prev === 0 ? props.image.length - 1 : prev - 1
            );
        }
    };

    const handleNextImage = () => {
        if (props.image && props.image.length > 0) {
            setCurrentImageIndex((prev) => 
                (prev + 1) % props.image.length
            );
        }
    };

    const currentImage = props.image && props.image.length > 0 ? props.image[currentImageIndex] : null;

    return (
        <>
            <div className="card">
                <div className="card-horizontal">
                    {/* Image Section */}
                    <div className="card-image-section">
                        <div className="card-image-container">
                            {currentImage ? (
                                <div className="image-wrapper">
                                    <img 
                                        src={currentImage.url} 
                                        alt={currentImage.title || props.name || 'Tour image'} 
                                        className="card-image"
                                    />
                                    
                                    {/* Navigation buttons - only show if more than 1 image */}
                                    {props.image && props.image.length > 1 && (
                                        <>
                                            <button 
                                                onClick={handlePreviousImage}
                                                className="image-nav-btn image-nav-prev"
                                                aria-label="Previous image"
                                            >
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                </svg>
                                            </button>
                                            <button 
                                                onClick={handleNextImage}
                                                className="image-nav-btn image-nav-next"
                                                aria-label="Next image"
                                            >
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                            
                                            {/* Image counter */}
                                            <div className="image-counter">
                                                {currentImageIndex + 1} / {props.image.length}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="card-image-placeholder">
                                    <div className="text-center">
                                        <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                        </svg>
                                        <p className="text-sm">Tour Image</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="card-content-section">
                        <div>
                            {/* Title */}
                            <h3 className="card-title">{props?.name || 'Amazing Tour Package'}</h3>
                            
                            {/* Description */}
                            <p className="card-description">{props?.description || 'Experience the beauty and culture of this amazing destination with our expert guides. Discover hidden gems and create unforgettable memories.'}</p>
                            
                            {/* Card Details */}
                            <div className="card-details">
                                <div className="card-info">
                                    <svg className="card-info-icon" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                    </svg>
                                    {props?.duration || '3 Days'}
                                </div>
                                <div className="card-info">
                                    <svg className="card-info-icon" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                    </svg>
                                    {props?.location || 'Location'}
                                </div>
                                <div className="card-info">
                                    <svg className="card-info-icon" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
                                    </svg>
                                    {props?.group_size || '8 max'}
                                </div>
                            </div>

                            {/* Star Rating and Price */}
                            <div className="star-rating">
                                <div className="flex items-center">
                                    <div className="star-container">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <svg 
                                                key={star}
                                                className={`star ${parseInt(props?.rating || '0') >= star ? 'star-filled' : 'star-empty'}`}
                                                fill="currentColor" 
                                                viewBox="0 0 20 20"
                                            >
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </div>
                                    <span className="rating-text">({props?.rating || '0'})</span>
                                </div>
                                <div className="price">
                                    <span className="price-amount">{props?.price}</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="button-group">
                            <button
                                onClick={handleLearnMore}
                                className="btn-learn-more"
                            >
                                Learn More
                            </button>
                            <button
                                onClick={handleBookNow}
                                className="btn-book"
                            >
                                {props?.button_text || 'Book Now'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            <ContentCardDetail
                {...props}
                isOpen={isDetailModalOpen}
                onClose={handleCloseModal}
                pageSlug={pageSlug}
            />

            {/* Booking Modal */}
            <BookingModal
                isOpen={isBookingModalOpen}
                onClose={handleCloseBookingModal}
                activityName={props?.name || 'Amazing Activity'}
                activityType={getActivityType()}
                activityPrice={props?.price || '$299'}
                activityImage={currentImage?.url}
                maxPeople={20}
                bookingData={bookingData}
                pageSlug={pageSlug}
            />
        </>
    );
}