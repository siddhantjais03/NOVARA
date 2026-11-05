import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, Sparkles, CheckCircle2 } from 'lucide-react';
import { Navbar } from '../../components/Navbar/Navbar';
import { AnnouncementBar } from '../../components/AnnouncementBar/AnnouncementBar';
import { Footer } from '../../components/Footer/Footer';
import { useStore } from '../../context/StoreContext';
import '../Content/ContentPages.css';

export const ContactPage = () => {
  const { showToast } = useStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Bespoke Sizing Consultation',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    showToast('Your message has been received by our Private Concierge.', 'success');
  };

  return (
    <div className="content-page-root">
      <AnnouncementBar />
      <Navbar />

      <header className="content-page-hero">
        <div className="content-hero-pill">
          <Sparkles size={14} />
          <span>Client Relations &amp; Concierge</span>
        </div>
        <h1 className="content-hero-title">Atelier Private Concierge</h1>
        <p className="content-hero-sub">
          Whether inquiring about private fitting appointments, bespoke commissions, or existing orders, our advisors are at your service.
        </p>
      </header>

      <main className="content-main-container">
        <div className="contact-layout-grid">
          {/* Form */}
          <section className="contact-form-card">
            <h2>Send a Direct Inquiry</h2>
            <p>Our dedicated client advisors will respond to your request within four business hours.</p>

            {isSubmitted ? (
              <div style={{
                textAlign: 'center',
                padding: '48px 24px',
                background: '#f0fdf4',
                borderRadius: '16px',
                border: '1px solid #bbf7d0'
              }}>
                <CheckCircle2 size={48} color="#16a34a" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ fontFamily: 'var(--font-display)', color: '#166534', marginBottom: '8px' }}>
                  Inquiry Dispatched
                </h3>
                <p style={{ color: '#15803d', fontSize: '0.92rem' }}>
                  Thank you, {formData.name}. An Atelier Concierge Specialist has received your inquiry and will reach out to {formData.email}.
                </p>
                <button
                  className="btn-primary"
                  style={{ marginTop: '20px' }}
                  onClick={() => {
                    setIsSubmitted(false);
                    setFormData({ name: '', email: '', subject: 'Bespoke Sizing Consultation', message: '' });
                  }}
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Patron Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Elena Rostova"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      outline: 'none',
                      fontSize: '0.95rem'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="patron@novara.luxury"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      outline: 'none',
                      fontSize: '0.95rem'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Subject of Consultation
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      outline: 'none',
                      fontSize: '0.95rem',
                      background: '#ffffff'
                    }}
                  >
                    <option value="Bespoke Sizing Consultation">Bespoke Sizing Consultation</option>
                    <option value="Order Status & Courier Delivery">Order Status &amp; Courier Delivery</option>
                    <option value="VIP Private Viewing Request">VIP Private Viewing Request</option>
                    <option value="Returns & Atelier Exchanges">Returns &amp; Atelier Exchanges</option>
                    <option value="Press & Media Relations">Press &amp; Media Relations</option>
                  </select>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Inquiry Details *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your inquiry or desired styling appointment..."
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      outline: 'none',
                      fontSize: '0.95rem',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '9999px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    fontSize: '1rem',
                    cursor: 'pointer'
                  }}
                >
                  <Send size={16} />
                  <span>Submit to Private Concierge</span>
                </button>
              </form>
            )}
          </section>

          {/* Contact Info Card */}
          <aside className="contact-info-card">
            <h3>Atelier Headquarters</h3>
            <p style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: '1.6' }}>
              For international clientele and private showroom viewings by appointment only.
            </p>

            <div className="contact-detail-row">
              <div className="contact-detail-icon">
                <MapPin size={20} />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.95rem' }}>Global Flagship Showrooms</strong>
                <span style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.5', display: 'block' }}>
                  Via Montenapoleone 14, 20121 Milan, Italy<br />
                  Avenue Montaigne 22, 75008 Paris, France<br />
                  The Oberoi Grand, Kolkata 700013, India
                </span>
              </div>
            </div>

            <div className="contact-detail-row">
              <div className="contact-detail-icon">
                <Mail size={20} />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.95rem' }}>Private Client Concierge</strong>
                <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>concierge@novara.luxury</span>
              </div>
            </div>

            <div className="contact-detail-row">
              <div className="contact-detail-icon">
                <Phone size={20} />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.95rem' }}>Direct Line</strong>
                <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>+91 (0) 11 4982 7000 / +39 02 8739 1000</span>
              </div>
            </div>

            <div className="contact-detail-row">
              <div className="contact-detail-icon">
                <Clock size={20} />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.95rem' }}>Atelier Hours</strong>
                <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                  Monday – Saturday: 10:00 – 19:30 CET<br />
                  Sunday: Private Consultations by Appointment
                </span>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
};

