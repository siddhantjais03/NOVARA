import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Sparkles, Search } from 'lucide-react';
import { Navbar } from '../../components/Navbar/Navbar';
import { AnnouncementBar } from '../../components/AnnouncementBar/AnnouncementBar';
import { Footer } from '../../components/Footer/Footer';
import '../Content/ContentPages.css';

const FAQ_DATA = [
  {
    category: 'Orders & Courier Delivery',
    items: [
      {
        q: 'What are the global courier delivery timelines and fees?',
        a: 'We offer complimentary white-glove express courier delivery on all orders exceeding $150 worldwide. Domestic orders arrive within 2–4 business days via insured express air. International parcels are dispatched via DHL Express Luxury Logistics with delivery within 3–6 business days.'
      },
      {
        q: 'Can I track my consignment in real time?',
        a: 'Yes. Upon atelier dispatch, you will receive an encrypted dispatch advisory containing your tracking identifier and an interactive milestone stepper accessible in your Patron Portfolio under My Orders.'
      },
      {
        q: 'Do you offer signature-required delivery?',
        a: 'All NOVARA deliveries require an adult signature upon delivery to guarantee absolute security for your fine garments and jewelry.'
      }
    ]
  },
  {
    category: 'Sizing & Craftsmanship',
    items: [
      {
        q: 'How do NOVARA silhouettes fit?',
        a: 'Our silhouettes adhere to classic European haute couture sizing. Outerwear features an intentional relaxed architectural drape, while tailoring conforms closely to sartorial standards. Consult our interactive size guide on each product page or message our Concierge for personalized sizing counsel.'
      },
      {
        q: 'Are your cashmere and silks 100% authentic?',
        a: 'Every piece is accompanied by a serialized Certificate of Authenticity. Our cashmere is sourced exclusively from certified ethical Mongolian herders, and our silk satin is spun in family-run mills in Como, Italy.'
      }
    ]
  },
  {
    category: 'Returns & Atelier Exchanges',
    items: [
      {
        q: 'What is your returns and exchange policy?',
        a: 'We offer complimentary 30-day returns and exchanges for all unworn silhouettes with original atelier security tags and packaging intact. Bespoke customized commissions are non-returnable.'
      },
      {
        q: 'How quickly are refunds credited?',
        a: 'Once our quality inspection team verifies the garment at our central atelier, full reimbursement is issued to your original payment method within 3–5 banking business days.'
      }
    ]
  },
  {
    category: 'Payment & Security',
    items: [
      {
        q: 'Which payment settlement methods are accepted?',
        a: 'We accept instant UPI (Google Pay, PhonePe, Paytm), Visa, Mastercard, American Express, and White-Glove Cash on Delivery across eligible jurisdictions.'
      },
      {
        q: 'How are my payment credentials safeguarded?',
        a: 'All transactions are protected via PCI-DSS Level 1 compliance and 256-bit bank-grade encryption protocols. We never store raw card numbers on our servers.'
      }
    ]
  }
];

export const FaqPage = () => {
  const [openItems, setOpenItems] = useState({ '0-0': true });
  const [searchQuery, setSearchQuery] = useState('');

  const toggleItem = (key) => {
    setOpenItems((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="content-page-root">
      <AnnouncementBar />
      <Navbar />

      <header className="content-page-hero">
        <div className="content-hero-pill">
          <Sparkles size={14} />
          <span>Client Advisory Desk</span>
        </div>
        <h1 className="content-hero-title">Frequently Asked Questions</h1>
        <p className="content-hero-sub">
          Everything you need to know about our atelier craftsmanship, white-glove shipping, and patron privileges.
        </p>

        <div style={{ maxWidth: '520px', margin: '28px auto 0', position: 'relative' }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search FAQs (shipping, returns, sizing, silk)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 20px 14px 44px',
              borderRadius: '9999px',
              border: '1px solid rgba(255,255,255,0.25)',
              background: 'rgba(255,255,255,0.95)',
              fontSize: '0.95rem',
              outline: 'none',
              color: '#0f172a'
            }}
          />
        </div>
      </header>

      <main className="content-main-container">
        <div className="faq-accordion-list">
          {FAQ_DATA.map((section, secIdx) => {
            const filteredItems = section.items.filter(
              (item) =>
                item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.a.toLowerCase().includes(searchQuery.toLowerCase())
            );

            if (filteredItems.length === 0) return null;

            return (
              <div key={secIdx} style={{ marginBottom: '28px' }}>
                <h3 style={{
                  fontFamily: 'var(--font-display, serif)',
                  fontSize: '1.4rem',
                  color: '#1e1b4b',
                  marginBottom: '14px',
                  paddingLeft: '4px'
                }}>
                  {section.category}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {filteredItems.map((item, itemIdx) => {
                    const key = `${secIdx}-${itemIdx}`;
                    const isOpen = !!openItems[key];

                    return (
                      <div key={itemIdx} className={`faq-item-card ${isOpen ? 'open' : ''}`}>
                        <button
                          type="button"
                          className="faq-question-btn"
                          onClick={() => toggleItem(key)}
                        >
                          <span>{item.q}</span>
                          {isOpen ? <ChevronUp size={18} color="#6366f1" /> : <ChevronDown size={18} color="#94a3b8" />}
                        </button>
                        {isOpen && (
                          <div className="faq-answer-pane">
                            <p style={{ margin: 0 }}>{item.a}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
};

