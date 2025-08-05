"use client"
import React, { useState, useEffect } from 'react'
import { useManualLoading } from '../hooks/useManualLoading'

interface ImageObject {
    uid: string;
    title: string;
    url: string;
    filename: string;
    content_type: string;
}

interface ContentCardDetailProps {
    data: any;
    name: string;
    price: string;
    rating: string;    
    duration: string;
    location: string;
    group_size: string;
    image: Array<ImageObject>;
    description: string;
    button_text: string;
    button_url: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function ContentCardDetail(props: ContentCardDetailProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const { withLoading } = useManualLoading();

    // Handle escape key to close modal
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                props.onClose();
            }
        };

        if (props.isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden'; // Prevent background scroll
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [props.isOpen, props.onClose]);

    const handleCancel = () => {
        console.log('Cancel clicked');
        props.onClose();
    };

    const handleBookNow = async () => {
        await withLoading(async () => {
            console.log('Book Now clicked');
            // Simulate API call or navigation
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Add actual booking logic here
            // For example: await bookTour(props.data.id);
            // Or navigate: router.push('/booking');
        });
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

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            props.onClose();
        }
    };

    if (!props.isOpen) return null;

    const currentImage = props.image && props.image.length > 0 ? props.image[currentImageIndex] : null;

    return (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
            <div className="modal-container">
                {/* Close Button */}
                <button 
                    onClick={props.onClose}
                    className="modal-close-btn"
                    aria-label="Close modal"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="modal-content">
                    {/* Image Section */}
                    <div className="modal-image-section">
                        {currentImage ? (
                            <div className="modal-image-wrapper">
                                <img 
                                    src={currentImage.url} 
                                    alt={currentImage.title || props.name || 'Tour image'} 
                                    className="modal-image"
                                />
                                
                                {/* Navigation buttons - only show if more than 1 image */}
                                {props.image && props.image.length > 1 && (
                                    <>
                                        <button 
                                            onClick={handlePreviousImage}
                                            className="image-nav-btn image-nav-prev"
                                            aria-label="Previous image"
                                        >
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </button>
                                        <button 
                                            onClick={handleNextImage}
                                            className="image-nav-btn image-nav-next"
                                            aria-label="Next image"
                                        >
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                        
                                        {/* Image counter */}
                                        <div className="modal-image-counter">
                                            {currentImageIndex + 1} / {props.image.length}
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="modal-image-placeholder">
                                <svg className="w-24 h-24 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                </svg>
                                <p className="text-lg">Tour Image</p>
                            </div>
                        )}
                    </div>

                    {/* Content Section */}
                    <div className="modal-content-section">
                        <div className="modal-header">
                            <h1 className="modal-title">
                                {props?.name || 'Amazing Tour Package'}
                            </h1>
                            <div className="modal-price">
                                <span className="modal-price-amount">{props?.price}</span>
                            </div>
                        </div>

                        {/* Rating and Key Details */}
                        <div className="modal-details-grid">
                            <div className="modal-detail-card">
                                <div className="modal-detail-header">
                                    <svg className="modal-detail-icon" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    <span>Rating</span>
                                </div>
                                <div className="modal-detail-value">{props?.rating || '0'} / 5</div>
                            </div>

                            <div className="modal-detail-card">
                                <div className="modal-detail-header">
                                    <svg className="modal-detail-icon" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                    </svg>
                                    <span>Duration</span>
                                </div>
                                <div className="modal-detail-value">{props?.duration || '3 Days'}</div>
                            </div>

                            <div className="modal-detail-card">
                                <div className="modal-detail-header">
                                    <svg className="modal-detail-icon" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                    </svg>
                                    <span>Location</span>
                                </div>
                                <div className="modal-detail-value">{props?.location || 'Not specified'}</div>
                            </div>

                            <div className="modal-detail-card">
                                <div className="modal-detail-header">
                                    <svg className="modal-detail-icon" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
                                    </svg>
                                    <span>Group Size</span>
                                </div>
                                <div className="modal-detail-value">{props?.group_size || '8 max'}</div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="modal-description-section">
                            <h3 className="modal-section-title">About This Experience</h3>
                            <p className="modal-description">
                                {props?.description || 'Experience the beauty and culture of this amazing destination with our expert guides. Discover hidden gems and create unforgettable memories on this carefully crafted journey.'}
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="modal-actions">
                            <button
                                onClick={handleCancel}
                                className="btn-cancel"
                            >
                                Cancel
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
        </div>
    );
} 