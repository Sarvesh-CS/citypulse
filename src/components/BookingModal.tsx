'use client';
import React, { useState, useEffect } from 'react';
import { useManualLoading } from '../hooks/useManualLoading';
import { getEntry } from '../../lib/contentstack-utils';
import { sendConfirmationEmail, BookingDetails } from '../services/emailService';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityName: string;
  activityType: 'tour' | 'event' | 'hotel' | 'restaurant';
  activityPrice: string;
  activityImage?: string;
  maxPeople?: number;
  bookingData?: Record<string, unknown>; // API response data for booking modal labels
  pageSlug?: string; // Current page slug to customize labels
}

// Mapping of page slugs to their corresponding environment variable names
const BOOKING_MODAL_UID_MAP: Record<string, string> = {
  'hotels': process.env.NEXT_PUBLIC_HOTELS_BOOKING_MODAL_UID as string,
  'restaurants': process.env.NEXT_PUBLIC_RESTAURANTS_BOOKING_MODAL_UID as string,
  'events': process.env.NEXT_PUBLIC_EVENTS_BOOKING_MODAL_UID as string,
  'tours': process.env.NEXT_PUBLIC_TOURS_BOOKING_MODAL_UID as string,
};

// Simple function to fetch booking data based on slug
const fetchBookingDataBySlug = async (pageSlug: string) => {
  console.log('=== Fetching Booking Data ===');
  console.log('Page Slug:', pageSlug);
  
  // Get the UID for the specific page slug
  const uid = BOOKING_MODAL_UID_MAP[pageSlug];
  
  if (!uid) {
    throw new Error(`No booking modal UID found for slug: ${pageSlug}`);
  }
  
  console.log(`Fetching ${pageSlug.toUpperCase()} booking modal with UID:`, uid);
  
  try {
    const data = await getEntry('booking_modal', uid);
    console.log(`${pageSlug} booking data:`, data);
    return data;
  } catch (error) {
    console.error(`Error fetching booking data for ${pageSlug}:`, error);
    throw error;
  }
}; 

export default function BookingModal({
  isOpen,
  onClose,
  activityName,
  activityType,
  activityPrice,
  activityImage,
  maxPeople = 20,
  bookingData,
  pageSlug
}: BookingModalProps) {
  const [selectedDate, setSelectedDate] = useState('');
  const [checkoutDate, setCheckoutDate] = useState('');
  const [peopleCount, setPeopleCount] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successDetails, setSuccessDetails] = useState<{
    activityName: string;
    selectedDate: string;
    checkoutDate?: string;
    peopleCount: number;
    totalPrice: string;
    customerName: string;
    customerEmail: string;
  } | null>(null);
  const { withLoading } = useManualLoading();

  // Debug: Log bookingData when it changes
  React.useEffect(() => {
    console.log('BookingModal received bookingData:', bookingData);
    console.log('BookingModal pageSlug:', pageSlug);
  }, [bookingData, pageSlug]);


  // Reset form when modal opens and track booking intent
  useEffect(() => {
    if (isOpen) {
      setSelectedDate('');
      setCheckoutDate('');
      setPeopleCount(1);
      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('');
      setSpecialRequests('');
      setShowSuccessModal(false);
      setSuccessDetails(null);
    }
  }, [isOpen, activityName, activityType, activityPrice, pageSlug]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setSuccessDetails(null);
    // Close the main booking modal after success modal is closed
    onClose();
  };

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showSuccessModal) {
          handleSuccessModalClose();
        } else {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, showSuccessModal, onClose, handleSuccessModalClose]);

  const handleBookNow = async () => {
    // Validate required fields - include checkout date for hotels
    const requiredFieldsValid = pageSlug === 'hotels' 
      ? selectedDate && checkoutDate && customerName && customerEmail && customerPhone
      : selectedDate && customerName && customerEmail && customerPhone;

    if (!requiredFieldsValid) {
      alert('Please fill in all required fields');
      return;
    }

    // Additional validation for hotels - checkout must be after checkin
    if (pageSlug === 'hotels' && checkoutDate <= selectedDate) {
      alert('Check-out date must be after check-in date');
      return;
    }

    await withLoading(async () => {
      // Map pageSlug to correct activityType
      const getActivityType = () => {
        switch (pageSlug) {
          case 'hotels': return 'hotel';
          case 'restaurants': return 'restaurant';
          case 'events': return 'event';
          case 'tours': return 'tour';
          default: return activityType; // fallback to prop
        }
      };

      // Simulate booking API call
      const bookingDetails: BookingDetails = {
        activityName,
        activityType: getActivityType(),
        activityPrice,
        selectedDate,
        peopleCount,
        customerName,
        customerEmail,
        customerPhone,
        specialRequests,
        totalPrice: calculateTotalPrice()
      };


      // Add checkout date for hotels
      if (pageSlug === 'hotels') {
        bookingDetails.checkoutDate = checkoutDate;
      }



      // Send confirmation email
      await sendConfirmationEmail(bookingDetails);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Show success modal with booking details
      setSuccessDetails({
        activityName,
        selectedDate,
        checkoutDate: pageSlug === 'hotels' ? checkoutDate : undefined,
        peopleCount,
        totalPrice: calculateTotalPrice(),
        customerName,
        customerEmail
      });
      setShowSuccessModal(true);
    });
  };

  const calculateTotalPrice = () => {
    const basePrice = parseFloat(activityPrice.replace(/[^0-9.]/g, '')) || 0;
    const total = basePrice * peopleCount;
    return `₹${total.toFixed(2)}`;
  };

  const getModalTitle = (): string => {
    // Use API title if available, otherwise use slug-based labels
    if (bookingData?.heading) {
      return String(bookingData.heading);
    }
    
    return String(bookingData?.modal_title || 'Make Booking'); // Fallback to bookingData.modal_title
  };

  const getPeopleLabel = (): string => {
    return String(bookingData?.people_label || 'Number of People'); // Fallback to bookingData.people_label
  };

  const getDateLabel = (): string => {
    return String(bookingData?.date || 'Date'); // Fallback to bookingData.date_label
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Success Modal */}
      {showSuccessModal && successDetails && (
        <div className="success-modal-backdrop" onClick={(e) => e.target === e.currentTarget && handleSuccessModalClose()}>
          <div className="success-modal-container">
            {/* Close Button */}
            <button 
              onClick={handleSuccessModalClose}
              className="success-modal-close-btn"
              aria-label="Close success modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Success Modal Content */}
            <div className="success-modal-content">
              {/* Success Header */}
              <div className="success-modal-header">
                <div className="success-icon-wrapper">
                  <div className="success-checkmark">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h2 className="success-modal-title">Booking Confirmed!</h2>
                <p className="success-modal-subtitle">Thank you for your booking. A confirmation email has been sent to your email address.</p>
              </div>

              {/* Booking Details Card */}
              <div className="booking-success-card">
                <h3 className="booking-card-title">Booking Details</h3>
                
                <div className="booking-details-grid">
                  <div className="booking-detail-item">
                    <div className="booking-detail-icon">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <span className="booking-detail-label">Activity</span>
                      <span className="booking-detail-value">{successDetails.activityName}</span>
                    </div>
                  </div>
                  
                  <div className="booking-detail-item">
                    <div className="booking-detail-icon">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <span className="booking-detail-label">Name</span>
                      <span className="booking-detail-value">{successDetails.customerName}</span>
                    </div>
                  </div>

                  <div className="booking-detail-item">
                    <div className="booking-detail-icon">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <span className="booking-detail-label">Email</span>
                      <span className="booking-detail-value">{successDetails.customerEmail}</span>
                    </div>
                  </div>

                  {successDetails.checkoutDate ? (
                    <>
                      <div className="booking-detail-item">
                        <div className="booking-detail-icon">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <span className="booking-detail-label">Check-in</span>
                          <span className="booking-detail-value">{successDetails.selectedDate}</span>
                        </div>
                      </div>
                      <div className="booking-detail-item">
                        <div className="booking-detail-icon">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <span className="booking-detail-label">Check-out</span>
                          <span className="booking-detail-value">{successDetails.checkoutDate}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="booking-detail-item">
                      <div className="booking-detail-icon">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <span className="booking-detail-label">Date</span>
                        <span className="booking-detail-value">{successDetails.selectedDate}</span>
                      </div>
                    </div>
                  )}

                  <div className="booking-detail-item">
                    <div className="booking-detail-icon">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <span className="booking-detail-label">People</span>
                      <span className="booking-detail-value">{successDetails.peopleCount} {successDetails.peopleCount === 1 ? 'person' : 'people'}</span>
                    </div>
                  </div>
                </div>

                {/* Total Price Highlight */}
                <div className="booking-total-highlight">
                  <div className="booking-total-content">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <div>
                      <span className="booking-total-label">Total Amount</span>
                      <span className="booking-total-price">{successDetails.totalPrice}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Success Modal Actions */}
              <div className="success-modal-actions">
                <button
                  onClick={handleSuccessModalClose}
                  className="success-modal-btn"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Perfect! Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Booking Modal */}
      {!showSuccessModal && (
        <div className="booking-modal-backdrop" onClick={handleBackdropClick}>
      <div className="booking-modal-container">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="booking-modal-close-btn"
          aria-label="Close booking modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal Content */}
        <div className="booking-modal-content">
          {/* Header */}
          <div className="booking-modal-header">
            <h2 className="booking-modal-title">{getModalTitle()}</h2>
            <div className="booking-activity-info">
              {activityImage && (
                <img 
                  src={activityImage} 
                  alt={activityName}
                  className="booking-activity-image"
                />
              )}
              <div>
                <h3 className="booking-activity-name">{activityName}</h3>
                <p className="booking-activity-price">Price per person: {activityPrice}</p>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="booking-form">
            <div className="booking-form-grid">
              {/* Date Selection - Different for Hotels */}
              {pageSlug === 'hotels' ? (
                <>
                  {/* Check-in Date */}
                  <div className="booking-form-group">
                    <label htmlFor="checkin-date" className="booking-form-label">
                      Check-in Date *
                    </label>
                    <input
                      type="date"
                      id="checkin-date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={getMinDate()}
                      className="booking-form-input"
                      required
                    />
                  </div>

                  {/* Check-out Date */}
                  <div className="booking-form-group">
                    <label htmlFor="checkout-date" className="booking-form-label">
                      Check-out Date *
                    </label>
                    <input
                      type="date"
                      id="checkout-date"
                      value={checkoutDate}
                      onChange={(e) => setCheckoutDate(e.target.value)}
                      min={selectedDate || getMinDate()}
                      className="booking-form-input"
                      required
                    />
                  </div>
                </>
              ) : (
                /* Regular Date Selection for other types */
                <div className="booking-form-group">
                  <label htmlFor="booking-date" className="booking-form-label">
                    {getDateLabel()} *
                  </label>
                  <input
                    type="date"
                    id="booking-date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={getMinDate()}
                    className="booking-form-input"
                    required
                  />
                </div>
              )}

              {/* People Count */}
              <div className="booking-form-group">
                <label htmlFor="people-count" className="booking-form-label">
                  {getPeopleLabel()} *
                </label>
                <select
                  id="people-count"
                  value={peopleCount}
                  onChange={(e) => setPeopleCount(parseInt(e.target.value))}
                  className="booking-form-input"
                  required
                >
                  {Array.from({ length: maxPeople }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'person' : 'people'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Customer Name */}
              <div className="booking-form-group">
                <label htmlFor="customer-name" className="booking-form-label">
                  {String(bookingData?.full_name || 'Full Name')} *
                </label>
                <input
                  type="text"
                  id="customer-name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={`Enter your ${String(bookingData?.full_name || '').toLowerCase() || 'full name'}`}
                  className="booking-form-input"
                  required
                />
              </div>

              {/* Customer Email */}
              <div className="booking-form-group">
                <label htmlFor="customer-email" className="booking-form-label">
                  {String(bookingData?.email_address || 'Email Address')} *
                </label>
                <input
                  type="email"
                  id="customer-email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder={`Enter your ${String(bookingData?.email_address || '').toLowerCase() || 'email'}`}
                  className="booking-form-input"
                  required
                />
              </div>

              {/* Customer Phone */}
              <div className="booking-form-group">
                <label htmlFor="customer-phone" className="booking-form-label">
                  {String(bookingData?.phone_number || 'Phone Number')} *
                </label>
                <input
                  type="tel"
                  id="customer-phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder={`Enter your ${String(bookingData?.phone_number || '').toLowerCase() || 'phone number'}`}
                  className="booking-form-input"
                  required
                />
              </div>

              {/* Special Requests */}
              <div className="booking-form-group booking-form-group-full">
                <label htmlFor="special-requests" className="booking-form-label">
                  {String(bookingData?.special_requests || 'Special Requests (Optional)')}
                </label>
                <textarea
                  id="special-requests"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Any special requirements or requests..."
                  className="booking-form-textarea"
                  rows={3}
                />
              </div>
            </div>

            {/* Total Price Display */}
            <div className="booking-total">
              <div className="booking-total-breakdown">
                <span>
                  {String(bookingData?.total_prefix || 'Total for ')}
                  {peopleCount} {peopleCount === 1 ? 'person' : 'people'}:
                </span>
                <span className="booking-total-price">{calculateTotalPrice()}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="booking-modal-actions">
              <button
                onClick={handleCancel}
                className="btn-cancel"
              >
                {String(bookingData?.cancel_btn || 'Cancel')}
              </button>
              <button
                onClick={handleBookNow}
                className="btn-book"
              >
                {String(bookingData?.confirm_booking_btn || 'Confirm Booking')}
              </button>
            </div>
          </div>
        </div>
      </div>
        </div>
      )}
    </>
  );
} 