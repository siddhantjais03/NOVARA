import React, { useState, useEffect } from 'react';
import { Sparkles, Copy, Check, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import './AnnouncementBar.css';

export const AnnouncementBar = () => {
  const [copied, setCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [activeMessageIndex, setActiveMessageIndex] = useState(0);
  const { showToast, storeSettings } = useStore();

  const messages = [
    ...(storeSettings?.announcementText
      ? [
          {
            highlight: 'NOVARA PRIVILEGE',
            text: storeSettings.announcementText,
            code: 'WELCOME10'
          }
        ]
      : []),
    {
      highlight: 'MID-SEASON ARCHIVE',
      text: 'Enjoy up to 45% off curated silhouettes',
      code: 'NOVARA45'
    },
    {
      highlight: 'SPRING / SUMMER 2026',
      text: `Complimentary Express Worldwide Shipping on orders over $${storeSettings?.freeShippingThreshold ?? 150}`,
      code: 'FREESHIP'
    },
    {
      highlight: 'FIRST ACCESS',
      text: 'Receive 15% off your inaugural order with code',
      code: 'WELCOME15'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveMessageIndex((prev) => (prev + 1) % messages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [messages.length]);

  const handleCopyCode = (code) => {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    showToast(`Code "${code}" copied to clipboard!`);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isVisible) return null;

  const current = messages[activeMessageIndex];

  return (
    <div className="announcement-bar">
      <div className="container announcement-inner">
        <div className="announcement-left">
          <span className="announcement-badge">
            <Sparkles size={12} className="sparkle-icon" />
            Limited Drop
          </span>
          <span className="announcement-perk">Free 30-Day Global Returns</span>
        </div>

        <div className="announcement-center">
          <span className="announcement-highlight">{current.highlight}:</span>
          <span className="announcement-text">{current.text}</span>
          <button
            className="announcement-code-btn"
            onClick={() => handleCopyCode(current.code)}
            title="Click to copy promo code"
          >
            <code>{current.code}</code>
            {copied ? <Check size={12} /> : <Copy size={12} />}
          </button>
        </div>

        <div className="announcement-right">
          <span className="announcement-currency">USD ($)</span>
          <button
            className="announcement-close"
            onClick={() => setIsVisible(false)}
            aria-label="Close announcement bar"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

