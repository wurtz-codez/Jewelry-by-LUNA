const ADMIN_WHATSAPP_NUMBER = '919039348168'; // Added country code 91 for India

const generateWhatsAppMessage = (order, user) => {
  const itemsList = order.items.map(item => 
    `• ${item.jewelry.name} (Qty: ${item.quantity}) - ₹${item.price * item.quantity}`
  ).join('\n');

  const shippingAddress = order.shippingAddress;
  const address = `${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}, ${shippingAddress.country}`;

  return `Hello! I would like to place an order for the following items:

${itemsList}

Total Amount: ₹${order.totalAmount}
Payment Method: ${order.paymentMethod}

Shipping Details:
Name: ${user.name}
Address: ${address}

Please confirm if these items are available and let me know the next steps. Thank you!`;
};

const encodeWhatsAppMessage = (message) => {
  return encodeURIComponent(message);
};

const generateWhatsAppUrl = (message) => {
  const encodedMessage = encodeWhatsAppMessage(message);
  
  // Using wa.me format which works well on both mobile and desktop
  // It will:
  // - Open WhatsApp app on mobile if installed
  // - Open WhatsApp Web on desktop if connected
  // - Redirect to app store/play store if app not installed
  return `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodedMessage}`;
};

module.exports = {
  generateWhatsAppMessage,
  encodeWhatsAppMessage,
  generateWhatsAppUrl
}; 