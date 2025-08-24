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
    }
  }, [isOpen, activityName, activityType, activityPrice, pageSlug]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
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
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCancel = () => {
    onClose();
  };

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

      // Show success message - different for hotels
      const successMessage = pageSlug === 'hotels'
        ? `Booking confirmed for ${activityName}!\nCheck-in: ${selectedDate}\nCheck-out: ${checkoutDate}\nPeople: ${peopleCount}\nTotal: ${calculateTotalPrice()}`
        : `Booking confirmed for ${activityName}!\nDate: ${selectedDate}\nPeople: ${peopleCount}\nTotal: ${calculateTotalPrice()}`;
      
      alert(successMessage);
      
      // Close modal
      onClose();
    });
  };

  const calculateTotalPrice = () => {
    const basePrice = parseFloat(activityPrice.replace(/[^0-9.]/g, '')) || 0;
    const total = basePrice * peopleCount;
    return `$${total.toFixed(2)}`;
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
  );
} 