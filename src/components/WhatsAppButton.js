import React from 'react';
import './WhatsAppButton.css';

const WhatsAppButton = () => {
  const phoneNumber = '260770029595'; // Zambian format
  const message = encodeURIComponent('Hello! I need help with the CV Generator.');
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float"
      aria-label="Chat on WhatsApp"
    >
      <svg 
        viewBox="0 0 32 32" 
        className="whatsapp-icon"
        fill="currentColor"
      >
        <path d="M16 0C7.164 0 0 7.164 0 16c0 2.828.736 5.484 2.02 7.78L0 32l8.448-2.208A15.924 15.924 0 0016 32c8.836 0 16-7.164 16-16S24.836 0 16 0zm0 29.333c-2.444 0-4.796-.664-6.828-1.916l-.488-.292-5.08 1.328 1.36-4.964-.32-.504A13.265 13.265 0 012.667 16c0-7.364 5.97-13.333 13.333-13.333S29.333 8.636 29.333 16 23.364 29.333 16 29.333z"/>
        <path d="M23.565 19.31c-.396-.2-2.348-1.156-2.712-1.288-.364-.136-.628-.2-.892.2-.264.396-1.024 1.288-1.256 1.552-.228.264-.46.296-.856.096-.396-.2-1.676-.616-3.192-1.968-1.18-1.052-1.976-2.348-2.208-2.744-.228-.396-.024-.612.176-.808.18-.176.396-.46.596-.692.2-.228.264-.396.396-.66.136-.264.068-.496-.032-.692-.1-.2-.892-2.148-1.22-2.94-.32-.772-.648-.668-.892-.68-.228-.012-.492-.016-.756-.016s-.692.096-1.056.492c-.364.396-1.388 1.356-1.388 3.304s1.42 3.832 1.616 4.096c.2.264 2.788 4.256 6.756 5.968.944.408 1.684.652 2.26.832.948.3 1.812.256 2.496.156.76-.112 2.348-.96 2.676-1.888.332-.928.332-1.724.232-1.888-.096-.168-.36-.268-.756-.468z"/>
      </svg>
      <span className="whatsapp-tooltip">Chat with us</span>
    </a>
  );
};

export default WhatsAppButton;
