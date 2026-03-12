export const NOTIFICATION_CONFIGS: any = {
  booking_request_received: {
    title: 'New Booking Request!',
    message: '{{tenantName}} wants to book your {{roomTitle}}',
    emailSubject: () => '🏠 New Booking Request for Your Room!',
    emailTemplate: 'booking-request-received',
    smsTemplate: 'LookRooms: {{tenantName}} wants to book your room. Respond within 48hrs. lookrooms.com/requests',
    category: 'booking',
    priority: 'high',
    icon: 'home',
    color: '#3b82f6',
    actionUrl: '/landlord/booking-requests/{{bookingId}}'
  },
  booking_accepted: {
    title: '🎉 Booking Accepted!',
    message: 'Your request for {{roomTitle}} was accepted!',
    emailSubject: () => '🎉 Your Room Request Was Accepted!',
    emailTemplate: 'booking-accepted',
    smsTemplate: 'LookRooms: Your booking for {{roomTitle}} is accepted! Contact: {{landlordPhone}}. lookrooms.com',
    category: 'booking',
    priority: 'urgent',
    icon: 'check-circle',
    color: '#10b981',
    actionUrl: '/bookings/{{bookingId}}'
  },
  payment_successful: {
    title: '✅ Payment Confirmed',
    message: 'Rs {{amount}} paid successfully via {{gateway}}',
    emailSubject: (d: any) => `✅ Payment Confirmed — Rs ${d.amount}`,
    emailTemplate: 'payment-success',
    smsTemplate: 'LookRooms: Rs {{amount}} paid via {{gateway}}. Txn: {{txnId}}. Receipt: lookrooms.com/receipt/{{receiptId}}',
    category: 'payment',
    priority: 'high',
    icon: 'credit-card',
    color: '#10b981',
    actionUrl: '/payments/{{paymentId}}'
  }
};
