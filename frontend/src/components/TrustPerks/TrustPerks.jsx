import React from 'react';
import { Truck, Sparkles, RotateCcw, Headphones } from 'lucide-react';
import './TrustPerks.css';

export const TrustPerks = () => {
  const perks = [
    {
      icon: <Truck size={24} />,
      title: 'Complimentary Express',
      description: 'Delivered directly to your door with carbon-neutral courier service.'
    },
    {
      icon: <Sparkles size={24} />,
      title: 'Ethical Master Craft',
      description: 'Sourced exclusively from certified heritage mills in Biella & Tuscany.'
    },
    {
      icon: <RotateCcw size={24} />,
      title: '30-Day Global Returns',
      description: 'Prepaid return label and concierge door pickup included with each box.'
    },
    {
      icon: <Headphones size={24} />,
      title: 'Private Client Concierge',
      description: 'Dedicated personal stylists available 24/7 for tailored recommendations.'
    }
  ];

  return (
    <section className="trust-perks-section" id="about">
      <div className="container">
        <div className="perks-grid">
          {perks.map((perk, index) => (
            <div key={index} className="perk-card">
              <div className="perk-icon-wrap">
                {perk.icon}
              </div>
              <h4 className="perk-title">{perk.title}</h4>
              <p className="perk-desc">{perk.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

