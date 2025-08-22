// Email service for sending booking confirmation emails via Contentstack automation

interface BookingDetails {
  activityName: string;
  activityType: string;
  activityPrice: string;
  selectedDate: string;
  checkoutDate?: string;
  peopleCount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  specialRequests: string;
  totalPrice: string;
}

const contentstackAutomationUrl = process.env.NEXT_PUBLIC_EMAIL_REQ_TRIGGER as string;

/**
 * Creates HTML email template for booking confirmation
 */
const createEmailTemplate = (bookingDetails: BookingDetails): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333; text-align: center;">${bookingDetails.activityType} Booking Confirmation</h2>
      
      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #555; margin-top: 0;">Thank you for your booking!</h3>
        
        <p><strong>Activity:</strong> ${bookingDetails.activityName}</p>
        
        ${bookingDetails.checkoutDate 
          ? `<p><strong>Check-in Date:</strong> ${bookingDetails.selectedDate}</p>
             <p><strong>Check-out Date:</strong> ${bookingDetails.checkoutDate}</p>`
          : `<p><strong>Date:</strong> ${bookingDetails.selectedDate}</p>`
        }
        
        <p><strong>Number of People:</strong> ${bookingDetails.peopleCount}</p>
        <p><strong>Total Price:</strong> ${bookingDetails.totalPrice}</p>
        
        <hr style="border: 1px solid #ddd; margin: 20px 0;">
        
        <h4 style="color: #555;">Customer Information:</h4>
        <p><strong>Name:</strong> ${bookingDetails.customerName}</p>
        <p><strong>Email:</strong> ${bookingDetails.customerEmail}</p>
        <p><strong>Phone:</strong> ${bookingDetails.customerPhone}</p>
        
        ${bookingDetails.specialRequests 
          ? `<p><strong>Special Requests:</strong> ${bookingDetails.specialRequests}</p>` 
          : ''
        }
      </div>
      
      <p style="text-align: center; color: #666; font-size: 12px;">
        This is an automated confirmation email. Please keep this for your records.
      </p>
    </div>
  `;
};

/**
 * Sends confirmation email via Contentstack automation API
 */
export const sendConfirmationEmail = async (bookingDetails: BookingDetails): Promise<boolean> => {
  try {
    const emailHTML = createEmailTemplate(bookingDetails);
    
    // Create query parameters - matching your API structure
    const params = new URLSearchParams({
      to: bookingDetails.customerEmail,
      subject: `Booking Confirmation - ${bookingDetails.activityName}`,
      body: emailHTML
    });
    
    // Build URL with query parameters
    const url = `${contentstackAutomationUrl}${params.toString()}`;
    console.log('URL:', url);
    
    // Send POST request to Contentstack automation API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(url, {
      method: 'POST',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};

export type { BookingDetails };